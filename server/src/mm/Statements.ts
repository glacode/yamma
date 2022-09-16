import { Grammar, Parser } from 'nearley';
import { BlockStatement } from "./BlockStatement";
import { Frame } from "./Frame";
import { MmLexer, MmToken } from '../grammar/MmLexer';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { IUStatement } from '../mmp/UStatement';
import { concatWithSpaces, concatWithSpacesSkippingStart } from './Utils';
import { WorkingVars } from '../mmp/WorkingVars';

export abstract class Statement {
    ParentBlock?: BlockStatement;
    outermostBlock?: BlockStatement;
    comment?: MmToken[];

    constructor(parentBlock?: BlockStatement, comment?: MmToken[] ) {
        this.ParentBlock = parentBlock;
        this.comment = comment;
        // assign this.outermostBlock if this is not the outermostBlock 
        if (parentBlock != undefined)
            // this is not the otermostBlock statement
            if (parentBlock!.outermostBlock == undefined)
                // the parentBlock is the outermost block
                this.outermostBlock = parentBlock;
            else
                // the parentBlock is not the outermost block
                this.outermostBlock = parentBlock.outermostBlock;
    }
}

// export class BlockStatementOld extends Statement{
//     constructor(parentBlock: BlockStatementOld | null) {
//         super(parentBlock);
//     }
// }

export abstract class NonBlockStatement extends Statement {
    Content: MmToken[];
    private _formula: string[] = [];

    constructor(content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(parentBlock, comment);
        this.Content = content;
    }

    /**
     * Return the content as a string. If the content contains a proof,
     * it returns only the content BEFORE the proof
     */
    get formula(): string[] {
        // const indexOfLastTokenBeforeProof = this.Content.indexOf('$=');
        // const contentBeforeTheProof: MmToken[] = this.Content.slice(0, indexOfLastTokenBeforeProof);
        if (this._formula.length === 0) {
            // this._contentBeforeTheProof has not been assigned, yet
            let i = 0;
            while (i < this.Content.length && this.Content[i].value != '$=') {
                this._formula.push(this.Content[i++].value);
            }
        }
        return this._formula;
    }

}

export class DisjointStatement extends NonBlockStatement {
    constructor(content: MmToken[], parentBlock: BlockStatement) {
        super(content, parentBlock);
    }
}

// statements with a label; blocks and '$d' statements
// are NOT labeled
export abstract class LabeledStatement extends NonBlockStatement {
    Label: string

    private _parseNode: InternalNode | undefined;

    /** statement number for labeled statements */
    statementNumber: number;


    //#region parseNode

    // parses a formula, without producing diagnostics
    // we invoke it with theory formulas, thus no error is expected
    protected parseStrArray(theoryFormula: string[], grammar: Grammar, workingVars: WorkingVars): ParseNode | undefined {
        let parseNode: ParseNode | undefined;
        grammar.lexer = new MmLexer(workingVars);
        const parser: Parser = new Parser(grammar);
        // Parse something!
        const stepFormulaString = concatWithSpaces(theoryFormula);
        try {
            parser.feed(stepFormulaString);
            parseNode = parser.results[0];
        } catch (error: any) {
            throw new Error("Unexpected error!");
        }
        return parseNode;
    }
    //#endregion parseNode

    public get parseNode(): InternalNode {
        if (this._parseNode == undefined)
            // this._parseNode = <InternalNode>this.parseStrArray(this.formula, grammar, new WorkingVars());
            this._parseNode = <InternalNode>this.parseStrArray(
                this.formula, this.outermostBlock!.grammar!, this.outermostBlock!.mmParser!.workingVars);
        return this._parseNode;
    }

    //#region parseNodeForSyntaxAxiom

    /**
     * 
     * @param strToParse 
     * @param grammar 
     */
    parseForTypecode(typecode: string, strToParse: string, grammar: Grammar): InternalNode {
        let parseNode: ParseNode | undefined;
        grammar.lexer = new MmLexer(this.outermostBlock!.mmParser!.workingVars);
        grammar.start = typecode;
        const parser: Parser = new Parser(grammar);
        // Parse something!
        try {
            parser.feed(strToParse);
            parseNode = parser.results[0];
        } catch (error: any) {
            throw new Error("Unexpected error!");
        }
        //TODO use a constant, instead
        grammar.start = "provable";
        return <InternalNode>parseNode;
    }
    /** this should be invoked for SyntaxAxioms. The first symbol is replaced by
     * the provable typecode and then the parse method is invoked
     */
    parseNodeForSyntaxAxiom(grammar: Grammar): InternalNode {
        if (this._parseNode == undefined) {
            const typecode: string = this.formula[0];
            const strToParse: string = concatWithSpacesSkippingStart(1, this.formula);
            this._parseNode = <InternalNode>this.parseForTypecode(typecode, strToParse, grammar);
        }
        return this._parseNode;
    }
    //#endregion parseNodeForSyntaxAxiom

    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(content, parentBlock, comment);
        //public FileInfo File;
        //public int Line;
        //public int Column;
        //public int ByteOffset;
        this.Label = label;
        this.statementNumber = parentBlock.nextLabeledStatementNumber;
    }
}

export class FHyp extends LabeledStatement {
    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        if (content.length !== 2) {
            throw new Error("An f hyp expects two strings");
        }
        super(label, content, parentBlock, comment);
    }
    public get Variable(): string {
        return this.Content[1].value;
    }
    public get Kind(): string {
        return this.Content[0].value;
    }

}

export class EHyp extends LabeledStatement {
    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(label, content, parentBlock, comment);
    }
}

export abstract class AssertionStatement extends LabeledStatement {
    frame: Frame | undefined;

    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(label, content, parentBlock, comment);
    }

    // returns the mandatory vars for the current AssertionStatement
    mandatoryVars(outermostrBlock: BlockStatement): Set<string> {
        const mandatoryVars: string[] = outermostrBlock.get_mand_vars(this.formula, this.frame!.eHyps);
        const result: Set<string> = new Set<string>(mandatoryVars);
        return result;
    }
}



export class AssertionStatementOld extends LabeledStatement {
    disjVars: DisjVars;
    f_hyps: FHyp[];
    e_hyps: EHyp[];
    constructor(label: string, content: MmToken[], disjVars: DisjVars,
        f_hyps: FHyp[], e_hyps: EHyp[], parentBlock: BlockStatement) {
        super(label, content, parentBlock);
        this.disjVars = disjVars;
        this.f_hyps = f_hyps;
        this.e_hyps = e_hyps;
    }

    // static make_assertion(label: string, statementContent: string[], currentBlock: BlockStatement): AssertionStatementOld {
    //     const e_hyps: EHyp[] = currentBlock.mandatoryEHyps()
    //     const mand_vars: string[] = currentBlock.get_mand_vars(statementContent, e_hyps)
    //     const dvs: DisjVars = currentBlock.getDisjointVars(mand_vars)
    //     const f_hyps: FHyp[] = currentBlock.mandatoryFHyps(mand_vars)
    //     const assertion: AssertionStatementOld = new AssertionStatementOld(
    //         label,
    //         statementContent,
    //         dvs,
    //         f_hyps,
    //         e_hyps,
    //         currentBlock)

    //     return assertion
    // }
}

export class AxiomStatement extends AssertionStatement {

}

// export class AxiomStatementOld extends AssertionStatementOld {
//     constructor(label: string, content: string[], disjVars: DisjVars,
//         f_hyps: FHyp[], e_hyps: EHyp[], parentBlock: BlockStatement) {
//         super(label, content, disjVars, f_hyps, e_hyps, parentBlock);
//     }
// }

//export class ProvableStatement extends AssertionStatementOld {
// constructor(label: string, content: string[], disjVars: DisjVars,
//     f_hyps: FHyp[], e_hyps: EHyp[], parentBlock: BlockStatement) {
//     super(label, content, disjVars, f_hyps, e_hyps, parentBlock);
export class ProvableStatement extends AssertionStatement {

    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(label, content, parentBlock, comment);
    }

    get Proof(): string[] {
        const proof: string[] = [];
        let hasProofBegun = false;
        this.Content.forEach(token => {
            if (hasProofBegun)
                proof.push(token.value);
            if (token.value == '$=')
                hasProofBegun = true;
        });
        // const indexOfLastTokenBeforeProof = this.Content.indexOf('$=');
        // const proofTokens = this.Content.slice(indexOfLastTokenBeforeProof + 1);
        // const proof = MmToken.joinValues(proofTokens)
        return proof;
    }

    get compressedProofString(): string {
        const proof = this.Proof;
        const ep = proof.lastIndexOf(')');
        let compressedString = "";
        for (let index = ep + 1; index < proof.length; index++) {
            compressedString += proof[index];
        }
        return compressedString;
    }

    get CompressedProofLabels(): string[] {
        const proofStrings: string[] = this.Proof;
        if (proofStrings[0] != "(") {
            throw new Error("This method should be called for compressed proofs only!");
        }
        const closingParIndex = this.Proof.indexOf(')');
        const proofLabels = proofStrings.slice(1, closingParIndex);
        return proofLabels;
    }
    // get ContentBeforeProof() {
    //     const indexOfLastTokenBeforeProof = this.Content.indexOf('$=');
    //     const contentBeforeProof = this.Content.slice(undefined, indexOfLastTokenBeforeProof);
    //     return contentBeforeProof;
    // }

}
// export interface Assertion {
//     AssertionStatement: AssertionStatementOld
//     DisjVars: DisjVars;
//     f_hyps: FHyp[];
//     e_hyps: EHyp[];
// }


export class ZIStatement extends Statement {
    constructor() {
        super(undefined);
    }
}

export class ZRStatement extends Statement {
    referencedZ: number;
    constructor(referencedZ: number) {
        super(undefined);
        this.referencedZ = referencedZ;
    }
}


// enum StatementType {
//     d = '$d',
//     f = '$f',
//     e = '$e',
//     a = '$a',
//     p = '$p'
// }

// type Statement = {
//     StatementType: StatementType,
//     StatementContent: string[]
// }

/** represents a Disjoint Var constraint statement in the current proof */
export class DisjVarUStatement implements IUStatement {
    // var1: string;
    // var2: string;

    /** tokens of the disjoint vars */
    disjointVars: MmToken[];

    // constructor(var1: string, var2: string) {
    constructor(disjointVars: MmToken[]) {
        // this.var1 = var1;
        // this.var2 = var2;
        this.disjointVars = disjointVars;
    }

    toText() {
        // const textForDisjointVars: string = rebuildOriginalStringFromTokens(this.disjointVars);
        // // const result = `$d ${this.var1} ${this.var2}`;
        // const result = '$d ' + textForDisjointVars;
        const text: string = DisjVarUStatement.textForTwoVars(this.disjointVars[0].value, this.disjointVars[1].value);
        return text;
    }

    /** returns the text for a $d statement for two vars*/
    static textForTwoVars(var1: string, var2: string): string {
        const statementText = `$d ${var1} ${var2}`;
        return statementText;
    }

}
// export type DisjVar = {
//     var1: string,
//     var2: string
// }

export type DisjVars = Set<DisjVarUStatement>
