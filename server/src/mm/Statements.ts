import { BlockStatement } from "./BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { DisjVarMmpStatement } from './DisjVarMmpStatement';

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


// export type DisjVar = {
//     var1: string,
//     var2: string
// }

export type DisjVars = Set<DisjVarMmpStatement>
