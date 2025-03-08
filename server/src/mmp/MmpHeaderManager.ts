import { Parameters } from '../general/Parameters';
import { MmpAllowDiscouraged } from './MmpAllowDiscouraged';
import { MmpComment } from './MmpComment';
import { MmpProof } from './MmpProof';
import { IMmpStatement } from './MmpStatement';
import { MmpTheoremLabel } from "./MmpTheoremLabel";

export class MmpHeaderManager {
	private mmpComment: MmpComment;
	constructor(private mmpProof: MmpProof, private expectedTheoremName?: string) {
		this.mmpComment = this.buildDefaultComment();
	}

	buildDefaultComment(): MmpComment {
		// const defaultComment: string = Parameters.defaultComment;
		// const commentMmTokens = splitToTokensDefault(defaultComment);
		// const mmpComment: MmpComment = new MmpComment(commentMmTokens, defaultComment);
		const mmpComment: MmpComment = MmpComment.CreateMmpComment(Parameters.defaultComment);
		return mmpComment;
	}

	//#region addMissingStatements
	/** searches the first index for a MmpStatement that is not
	 * a MmpTheoremLabel. If this is not a MmpComment, than a comment is inserted
	 */
	getIndexToInsertMissingComment(): number | undefined {
		let index = 0;
		const mmpStatements = this.mmpProof.mmpStatements;
		while (index < mmpStatements.length &&
			// !(mmpStatements[index] instanceof MmpComment) &&
			// !(mmpStatements[index] instanceof MmpProofStep))
			(mmpStatements[index] instanceof MmpTheoremLabel ||
				mmpStatements[index] instanceof MmpAllowDiscouraged))
			index++;
		const indexOfFirstMmpStatement: number | undefined = mmpStatements[index] instanceof MmpComment ?
			undefined : index;
		return indexOfFirstMmpStatement;
	}
	addCommentIfMissing() {
		const index: number | undefined = this.getIndexToInsertMissingComment();
		if (index != undefined)
			// there is at least a MmpProof steps, and index is the index
			// of the first MmpProof step
			this.mmpProof.insertStatementToTheHeader(this.mmpComment, index);
	}

	//#region addTheoremLabelStatementIfMissing
	getFirstStatement(): IMmpStatement | undefined {
		let firstStatement: IMmpStatement | undefined;
		if (this.mmpProof.mmpStatements.length > 0)
			firstStatement = this.mmpProof.mmpStatements[0];
		return firstStatement;
	}
	addTheoremLabelStatement(expectedTheoremName: string) {
		const theoremLabel: MmpTheoremLabel = MmpTheoremLabel.CreateMmpTheoremLabel(
			expectedTheoremName);
		this.mmpProof.insertStatementToTheHeader(theoremLabel, 0);
	}
	private addTheoremLabelStatementIfMissing() {
		if (this.expectedTheoremName != undefined) {
			const firstStatement: IMmpStatement | undefined = this.getFirstStatement();
			if (!(firstStatement instanceof MmpTheoremLabel))
				this.addTheoremLabelStatement(this.expectedTheoremName);
		}
	}
	//#endregion addTheoremLabelStatementIfMissing

	addMissingStatements() {
		this.addTheoremLabelStatementIfMissing();
		this.addCommentIfMissing();
	}
	//#endregion addMissingStatements
}