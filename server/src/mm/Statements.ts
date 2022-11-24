import { BlockStatement } from "./BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { IMmpStatementWithRange } from '../mmp/UStatement';
import { arrayRange } from './Utils';
import { Range } from 'vscode-languageserver';

export abstract class Statement {
    ParentBlock?: BlockStatement;
    outermostBlock?: BlockStatement;
    comment?: MmToken[];

    constructor(parentBlock?: BlockStatement, comment?: MmToken[]) {
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
export class DisjVarUStatement implements IMmpStatementWithRange {
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

    get range(): Range {
        const range: Range = arrayRange(this.disjointVars);
        return range;
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
