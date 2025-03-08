import { MmToken } from '../grammar/MmLexer';
import { splitToTokensDefault } from '../mm/Utils';
import { IMmpStatement } from './MmpStatement';

export class MmpComment implements IMmpStatement {
	/** comment tokens, exclued the startin '*' character */
	contentTokens: MmToken[]
	comment: string;

	constructor(contentTokens: MmToken[], comment: string) {
		this.contentTokens = contentTokens;
		this.comment = comment;
	}

	static CreateMmpComment(comment: string): MmpComment {
		const commentMmTokens = splitToTokensDefault(comment);
		const mmpComment: MmpComment = new MmpComment(commentMmTokens, comment);
		return mmpComment;
	}

	toText() {
		return this.comment;
	}
}