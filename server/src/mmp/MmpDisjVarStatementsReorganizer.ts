/** This class gets a MmpProof and reorganizes its $d statements:
 * - $d statements are classified as mandatory and dummy
 * - mandatory $d statements are moved at the top of the list
 * - then a comment is added to separate mandatory and dummy $d statements
 * - dummy $d statements are moved at the bottom of the list
 * - each group of $d statements is sorted alphabetically
 * - the order of the $d statements is preserved within each group
 */

import { MmpProof } from './MmpProof';
import { MmpDisjVarStatement } from './MmpDisjVarStatement';
import { MmpComment } from './MmpComment';
import { IMmpStatement } from './MmpStatement';
import { Parameters } from '../general/Parameters';

export class MmpDisjVarStatementsReorganizer {
	//#region reorganizeDisjointVarConstraintsStatements
	private static getMandatoryAndDummyDisjVarStatements(mmpProof: MmpProof, mandatoryDisjVarStatements: MmpDisjVarStatement[], dummyDisjVarStatements: MmpDisjVarStatement[]) {
		const disjVarStatements: MmpDisjVarStatement[] =
			mmpProof.mmpStatements.filter((statement: IMmpStatement) => statement instanceof MmpDisjVarStatement) as MmpDisjVarStatement[];
		disjVarStatements.forEach((disjVarStatement: MmpDisjVarStatement) => {
			if (mmpProof.mandatoryVars.has(disjVarStatement.disjointVars[0].value) &&
				mmpProof.mandatoryVars.has(disjVarStatement.disjointVars[1].value))
				mandatoryDisjVarStatements.push(disjVarStatement);
			else
				dummyDisjVarStatements.push(disjVarStatement);
		});
	}
	static sortDisjVarStatements(mandatoryDisjVarStatements: MmpDisjVarStatement[]) {
		mandatoryDisjVarStatements.sort((disjVarStatement1: MmpDisjVarStatement,
			disjVarStatement2: MmpDisjVarStatement) => {
			const var1: string = disjVarStatement1.disjointVars[0].value;
			const var2: string = disjVarStatement2.disjointVars[0].value;
			return var1.localeCompare(var2);
		});
	}
	//#region moveDisjVarStatements
	/** removes all the $d statements before the last MmpProofStep and returns the index
	 * after the last MmpProofStep, if it is defined (or the index after the last MmpStatement,
	 * but this could happen only if the proof does not have any MmpProofStep) */
	private static removeAllDisjVarStatementsBeforeTheLastMmpProofStep(mmpProof: MmpProof): number {
		let i = 0;
		while (i < mmpProof.mmpStatements.length && mmpProof.mmpStatements[i] != mmpProof.lastMmpProofStep)
			if (mmpProof.mmpStatements[i] instanceof MmpDisjVarStatement)
				mmpProof.mmpStatements.splice(i, 1);
			else
				i++;
		if (i < mmpProof.mmpStatements.length)
			i++;
		return i;
	}
	//#region addMandatoryAddCommentAddDummyDisjVarStatements
	static setStatement(mmpProof: MmpProof, i: number, mmpStatement: IMmpStatement) {
		if (i < mmpProof.mmpStatements.length)
			mmpProof.mmpStatements[i] = mmpStatement;
		else {
			mmpProof.mmpStatements.push(mmpStatement);

		}
	}
	static addDisjVarStatements(mmpProof: MmpProof,
		indexToStartAddingDisjVarStatements: number, disjVarStatements: MmpDisjVarStatement[]) {
		let i = indexToStartAddingDisjVarStatements;
		disjVarStatements.forEach((disjVarStatement: MmpDisjVarStatement) => {
			MmpDisjVarStatementsReorganizer.setStatement(mmpProof, i, disjVarStatement);
			i++;
		});
	}
	static addCommentForDummyConstraints(mmpProof: MmpProof, indexToInsertComment: number) {
		const commentForDummyConstraints: MmpComment = MmpComment.CreateMmpComment(
			Parameters.dummyConstraintsComment);
		MmpDisjVarStatementsReorganizer.setStatement(mmpProof, indexToInsertComment, commentForDummyConstraints);
		mmpProof.commentForDummyConstraints = commentForDummyConstraints;
	}

	/** adds the mandatory $d statements at the top of the list, then adds a comment
	 * to separate mandatory and dummy $d statements, and finally adds the dummy $d
	 * statements at the bottom of the list.
	 * Returns the index after the last inserted statement, if any (otherwise, the
	 * index after the last MmpProofStep) */
	private static addMandatoryAddCommentAddDummyDisjVarStatements(mmpProof: MmpProof,
		isCommentForDummyConstraintToBeInserted: boolean,
		indexAfterTheLastMmpProofStepOrAfterTheLastMmpStatement: number,
		mandatoryDisjVarStatements: MmpDisjVarStatement[], dummyDisjVarStatements: MmpDisjVarStatement[]):
		number {
		MmpDisjVarStatementsReorganizer.addDisjVarStatements(mmpProof,
			indexAfterTheLastMmpProofStepOrAfterTheLastMmpStatement, mandatoryDisjVarStatements);
		let indexForNextInsertion: number =
			indexAfterTheLastMmpProofStepOrAfterTheLastMmpStatement +
			mandatoryDisjVarStatements.length;
		if (isCommentForDummyConstraintToBeInserted && dummyDisjVarStatements.length > 0) {
			MmpDisjVarStatementsReorganizer.addCommentForDummyConstraints(mmpProof,
				indexAfterTheLastMmpProofStepOrAfterTheLastMmpStatement +
				mandatoryDisjVarStatements.length);
			indexForNextInsertion++;
		}
		MmpDisjVarStatementsReorganizer.addDisjVarStatements(mmpProof,
			indexForNextInsertion, dummyDisjVarStatements);
		indexForNextInsertion += dummyDisjVarStatements.length;
		return indexForNextInsertion;
	}

	//#endregion addMandatoryAddCommentAddDummyDisjVarStatements
	static moveDisjVarStatements(mmpProof: MmpProof, isCommentForDummyConstraintToBeInserted: boolean,
		mandatoryDisjVarStatements: MmpDisjVarStatement[],
		dummyDisjVarStatements: MmpDisjVarStatement[]) {
		const indexAfterTheLastMmpProofStepOrAfterTheLastMmpStatement: number =
			MmpDisjVarStatementsReorganizer.removeAllDisjVarStatementsBeforeTheLastMmpProofStep(mmpProof);
		const indexAfterTheLastValidStatement = MmpDisjVarStatementsReorganizer.addMandatoryAddCommentAddDummyDisjVarStatements(mmpProof,
			isCommentForDummyConstraintToBeInserted, indexAfterTheLastMmpProofStepOrAfterTheLastMmpStatement,
			mandatoryDisjVarStatements, dummyDisjVarStatements);
		// remove the remaining $d statements or comments
		mmpProof.mmpStatements.splice(indexAfterTheLastValidStatement);
	}
	//#endregion moveDisjVarStatements
	static reorganizeDisjointVarConstraintsStatements(mmpProof: MmpProof,
		isCommentForDummyConstraintToBeInserted: boolean) {
		const mandatoryDisjVarStatements: MmpDisjVarStatement[] = [];
		const dummyDisjVarStatements: MmpDisjVarStatement[] = [];
		MmpDisjVarStatementsReorganizer.getMandatoryAndDummyDisjVarStatements(
			mmpProof, mandatoryDisjVarStatements, dummyDisjVarStatements);
		MmpDisjVarStatementsReorganizer.sortDisjVarStatements(mandatoryDisjVarStatements);
		MmpDisjVarStatementsReorganizer.sortDisjVarStatements(dummyDisjVarStatements);
		MmpDisjVarStatementsReorganizer.moveDisjVarStatements(mmpProof, isCommentForDummyConstraintToBeInserted,
			mandatoryDisjVarStatements, dummyDisjVarStatements);


	}
	//#endregion reorganizeDisjointVarConstraintsStatements
}