import { BlockStatement } from "./BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { concatTokenValuesWithSpaces } from './Utils';

export abstract class Statement {
    ParentBlock?: BlockStatement;
    outermostBlock?: BlockStatement;
    comment?: MmToken[];
    private _normalizedComment = '';
    private _isDiscouraged?: boolean;

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

    /** returns the formula as a normalized string: normalized means that
    * between each pair of symbols there will be exactly one character, no matter
    * how the formula was originally written */
    get normalizedComment(): string {
        if (this._normalizedComment?.length === 0 && this.comment) {
            // this.comment has not been assigned, yet
            this._normalizedComment = concatTokenValuesWithSpaces(this.comment);
        }
        return this._normalizedComment;
    }

    get isDiscouraged(): boolean {
        if ( this._isDiscouraged == undefined )
            this._isDiscouraged = this.normalizedComment.indexOf('(New usage is discouraged.)') != -1;
        return this._isDiscouraged;
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
