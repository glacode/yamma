import { MmToken } from '../grammar/MmLexer';
import { IMmpStatementWithRange } from '../mmp/MmpStatement';
import { arrayRange } from './Utils';
import { Range } from 'vscode-languageserver';


/** represents a Disjoint Var constraint statement in the current proof */
export class DisjVarMmpStatement implements IMmpStatementWithRange {
    /** tokens of the disjoint vars */
    disjointVars: MmToken[];

    // constructor(var1: string, var2: string) {
    constructor(disjointVars: MmToken[]) {
        this.disjointVars = disjointVars;
    }

    get range(): Range {
        const range: Range = arrayRange(this.disjointVars);
        return range;
    }

    toText() {
        const text: string = DisjVarMmpStatement.textForTwoVars(this.disjointVars[0].value, this.disjointVars[1].value);
        return text;
    }

    /** returns the text for a $d statement for two vars*/
    static textForTwoVars(var1: string, var2: string): string {
        const statementText = `$d ${var1} ${var2}`;
        return statementText;
    }

}
