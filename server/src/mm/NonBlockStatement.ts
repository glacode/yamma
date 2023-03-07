import { BlockStatement } from "./BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { Statement } from './Statements';
import { normalizedFormula } from './Utils';

// export class BlockStatementOld extends Statement{
//     constructor(parentBlock: BlockStatementOld | null) {
//         super(parentBlock);
//     }
// }

export abstract class NonBlockStatement extends Statement {
    Content: MmToken[];
    private _formula: string[] = [];
    private _normalizedFormula = '';

    constructor(content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(parentBlock, comment);
        this.Content = content;
    }

    /**
     * Return the content as a string array. If the content contains a proof,
     * it returns only the content BEFORE the proof
     */
    get formula(): string[] {
        if (this._formula.length === 0) {
            // this._contentBeforeTheProof has not been assigned, yet
            let i = 0;
            while (i < this.Content.length && this.Content[i].value != '$=') {
                this._formula.push(this.Content[i++].value);
            }
        }
        return this._formula;
    }

    /** returns the formula as a normalized string: normalized means that
     * between each pair of symbols there will be exactly one character, no matter
     * how the formula was originally written */
    get normalizedFormula(): string {
        if (this._normalizedFormula.length === 0) {
            // this._normalizedFormula has not been assigned, yet
            this._normalizedFormula = normalizedFormula(this.formula);
        }
        return this._normalizedFormula;
    }

}
