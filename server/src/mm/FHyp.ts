import { MmToken } from '../grammar/MmLexer';
import { BlockStatement } from './BlockStatement';
import { LabeledStatement } from './LabeledStatement';

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