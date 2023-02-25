import { integer } from 'vscode-languageserver';
import { MmpProof } from './MmpProof';
import { MmpProofStep } from './MmpProofStep';
import { IMmpStatement } from './MmpStatement';

export abstract class ProofStepDuplicateRemover {

	//#region removeDuplicates

	private static removeMmpProofStepIfTheCase(mmpProofStep: MmpProofStep, index: integer,
		mmpProof: MmpProof, oldRefToNewRefMap: Map<string, MmpProofStep>): number {
		let duplicatedMmpProofStep: MmpProofStep | undefined;
		let nextIndex: number = index + 1;
		if (mmpProofStep.formula != undefined && mmpProofStep.label == undefined &&
			mmpProofStep.parseNode != undefined) {
			const normalizedFormula: string = mmpProofStep.parseNode.stringFormula;
			// const normalizedFormula: string = concatTokenValuesWithSpaces(mmpProofStep.formula!);
			const duplicatedMmpProofStepIndex: number | undefined = mmpProof.adjustedStepIndexForThisFormula(normalizedFormula);
			if (duplicatedMmpProofStepIndex != undefined && duplicatedMmpProofStepIndex < index) {
				// mmpProofStep duplicates mmpProof.uStatements[duplicatedMmpProofStepIndex]
				duplicatedMmpProofStep = <MmpProofStep>mmpProof.mmpStatements[duplicatedMmpProofStepIndex];
				if (mmpProofStep.stepRef != undefined)
					oldRefToNewRefMap.set(mmpProofStep.stepRef, duplicatedMmpProofStep);
				mmpProof.mmpStatements.splice(index, 1);
				nextIndex = index;
			}
		}
		return nextIndex;
	}

	//#region updateEHypsIfNeeded
	private static updateEHypIfNeeded(stepRef: string, i: number, oldRefToNewRefMap: Map<string, MmpProofStep>,
		eHypUSteps: (MmpProofStep | undefined)[]) {
		const newEHyp: MmpProofStep | undefined = oldRefToNewRefMap.get(stepRef);
		if (newEHyp != undefined)
			eHypUSteps[i] = newEHyp;
	}
	private static updateEHypsIfNeeded(mmpProofStep: MmpProofStep, oldRefToNewRefMap: Map<string, MmpProofStep>) {
		for (let i = 0; i < mmpProofStep.eHypUSteps.length; i++) {
			const eHyp: MmpProofStep | undefined = mmpProofStep.eHypUSteps[i];
			if (eHyp != undefined)
				ProofStepDuplicateRemover.updateEHypIfNeeded(eHyp.stepRef, i, oldRefToNewRefMap, mmpProofStep.eHypUSteps);
		}
	}
	//#endregion updateEHypsIfNeeded

	/** removes all MmpProofStep's that have the same formula
	 * of some preceding step. All references are adjusted accordingly.
	 */
	public static removeStepDuplicates(mmpProof: MmpProof) {
		const oldRefToNewRefMap: Map<string, MmpProofStep> = new Map<string, MmpProofStep>();
		let i = 0;
		while (i < mmpProof.mmpStatements.length) {
			const mmpStatement: IMmpStatement = mmpProof.mmpStatements[i];
			if (mmpStatement instanceof MmpProofStep) {
				i = ProofStepDuplicateRemover.removeMmpProofStepIfTheCase(mmpStatement, i, mmpProof, oldRefToNewRefMap);
				ProofStepDuplicateRemover.updateEHypsIfNeeded(mmpStatement, oldRefToNewRefMap);
			} else
				// mmpStatement is not a MmpProofStep
				i++;
		}
		mmpProof.mmpStatements.forEach((mmpStatement: IMmpStatement, index: integer) => {
			if (mmpStatement instanceof MmpProofStep) {
				ProofStepDuplicateRemover.removeMmpProofStepIfTheCase(mmpStatement, index, mmpProof, oldRefToNewRefMap);
				ProofStepDuplicateRemover.updateEHypsIfNeeded(mmpStatement, oldRefToNewRefMap);
			}
		});
	}
	//#endregion removeDuplicates
}