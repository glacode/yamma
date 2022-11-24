import { BlockStatement } from "./BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { Statement } from './Statements';

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
