import { MmToken } from '../grammar/MmLexer';
import { BlockStatement } from './BlockStatement';
import { LabeledStatement } from './LabeledStatement';

export class EHyp extends LabeledStatement {
    constructor(labelToken: MmToken, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(labelToken, content, parentBlock, comment);
    }
}