import { MmToken } from '../grammar/MmLexer';
import { BlockStatement } from './BlockStatement';
import { LabeledStatement } from './LabeledStatement';

export class EHyp extends LabeledStatement {
    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(label, content, parentBlock, comment);
    }
}