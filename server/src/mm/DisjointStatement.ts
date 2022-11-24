import { BlockStatement } from "./BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { NonBlockStatement } from './NonBlockStatement';


export class DisjointStatement extends NonBlockStatement {
    constructor(content: MmToken[], parentBlock: BlockStatement) {
        super(content, parentBlock);
    }
}
