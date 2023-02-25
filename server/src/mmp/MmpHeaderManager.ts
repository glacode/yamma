import { Parameters } from '../general/Parameters';
import { splitToTokensDefault } from '../mm/Utils';
import { MmpProof } from './MmpProof';
import { MmpProofStep } from './MmpProofStep';
import { MmpComment } from './MmpStatement';

export class MmpHeaderManager {
	private mmpComment: MmpComment;
	constructor(private mmpProof: MmpProof) {
		this.mmpComment = this.buildDefaultComment();
	}

	buildDefaultComment(): MmpComment {
		const defaultComment: string = Parameters.defaultComment;
		const commentMmTokens = splitToTokensDefault(defaultComment);
		const mmpComment: MmpComment = new MmpComment(commentMmTokens, defaultComment);
		return mmpComment;
	}

	//#region addMissingStatements
	getIndexOfFirstMmpProofStepIfMissingComment(): number | undefined {
		let index = 0;
		const mmpStatements = this.mmpProof.mmpStatements;
		while (index < mmpStatements.length &&
			!(mmpStatements[index] instanceof MmpComment) &&
			!(mmpStatements[index] instanceof MmpProofStep))
			index++;
		const indexOfFirstMmpStatement: number | undefined = mmpStatements[index] instanceof MmpProofStep ?
			index : undefined;
		return indexOfFirstMmpStatement;
	}
	addCommentIfMissing() {
		const index: number | undefined = this.getIndexOfFirstMmpProofStepIfMissingComment();
		if (index != undefined)
			// there is at least a MmpProof steps, and index is the index
			// of the first MmpProof step
			this.mmpProof.insertStatementToTheHeader(this.mmpComment, index);
	}

	addMissingStatements() {
		this.addCommentIfMissing();
	}
	//#endregion addMissingStatements
}