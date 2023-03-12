import { Grammar, Parser } from 'nearley';
import { BlockStatement } from "./BlockStatement";
import { MmLexer, MmToken } from '../grammar/MmLexer';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { concatWithSpaces, concatWithSpacesSkippingStart } from './Utils';
import { WorkingVars } from '../mmp/WorkingVars';
import { NonBlockStatement } from "./NonBlockStatement";

// statements with a label; blocks and '$d' statements
// are NOT labeled

export abstract class LabeledStatement extends NonBlockStatement {
    Label: string;

    private _parseNode: InternalNode | undefined;

    /** statement number for labeled statements */
    statementNumber: number;

    public static parseString(formula: string, grammar: Grammar, workingVars: WorkingVars) {
        let parseNode: ParseNode | undefined;
        grammar.lexer = new MmLexer(workingVars);
        const parser: Parser = new Parser(grammar);
        // Parse something!
        try {
            parser.feed(formula);
            parseNode = parser.results[0];
        } catch (error: any) {
            // this error could also happen when a 'weird' $e statement is present
            // even though the .mm file is valid; thus we don't throw an exception
            // (the caller should check for parseNode being undefined)
            console.log("Unexpected error! - parseStrArray : " + formula);
            // throw new Error("Unexpected error! - parseStrArray : " + formula);
        }
        return parseNode;
    }

    // parses a formula, without producing diagnostics
    // we invoke it with theory formulas, thus no error is expected
    protected parseStrArray(theoryFormula: string[], grammar: Grammar, workingVars: WorkingVars): ParseNode | undefined {
        const formula: string = concatWithSpaces(theoryFormula);
        const parseNode: ParseNode | undefined = LabeledStatement.parseString(formula, grammar, workingVars);
        return parseNode;
    }

    public isParseNodeDefined(): boolean {
        const isDefined = !!this.parseNode;
        return isDefined;
    }

    public get parseNode(): InternalNode {
        if (this._parseNode == undefined)
            // this._parseNode = <InternalNode>this.parseStrArray(this.formula, grammar, new WorkingVars());
            this._parseNode = <InternalNode>this.parseStrArray(
                this.formula, this.outermostBlock!.grammar!, this.outermostBlock!.mmParser!.workingVars);
        return this._parseNode;
    }

    public setParseNode(parseNode: InternalNode) {
        this._parseNode = parseNode;
    }


    private _logicalVariables: Set<string> | undefined;

    public get logicalVariables(): Set<string> {
        if (this._logicalVariables == undefined)
            // this._parseNode = <InternalNode>this.parseStrArray(this.formula, grammar, new WorkingVars());
            this._logicalVariables = this.parseNode.logicalVariables(this.outermostBlock!);
        return this._logicalVariables;
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
            throw new Error("Unexpected error! - parseForTypecode typecode: " + typecode + " - strToParse:" + strToParse);
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
            //TODO it might be faster using a MmLexer that uses symbols directly (without creating the intermediate string)
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
