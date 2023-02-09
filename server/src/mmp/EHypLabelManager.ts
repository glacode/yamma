import { integer } from 'vscode-languageserver';
import { MmpProofStep } from './MmpProofStep';

export interface BuildNewLabelArgs {
	/** the name of the current therem */
	theoremLabel: string
	/** current EHYp, for which the label may be updated */
	eHyp: MmpProofStep,
	/** if the current label is changed, this will be incremented */
	nextLabelIndexToBeAssigned: integer
}

export abstract class EHypLabelManager {

	//#region buildNewLabelIfNeeded
	static buildNewLabel(buildNewLabelArgs: BuildNewLabelArgs) {
		buildNewLabelArgs.eHyp.stepLabel = `${buildNewLabelArgs.theoremLabel}.${buildNewLabelArgs.nextLabelIndexToBeAssigned++}`;
	}

	/** label are created to be of the form <theoremName>.nn where nn is
	 * an incrementing suffix.
	 * But if a label exists with a prefix not equal
	 * to <theoremName>, it is left unchanged.
	 * If a label exists with a prefix equal to <theoremName> but
	 * with a suffix which is not a number, it is left unchanged.
	 * If a label exists with a prefix equal to <theoremName>, a
	 * suffix which is a number, but it is not the expected number,
	 * the suffix is updated to reflect its actual order.
	 */
	static buildNewLabelIfNeeded(buildNewLabelArgs: BuildNewLabelArgs) {
		const eHypLabel: string | undefined = buildNewLabelArgs.eHyp.stepLabel;
		if (eHypLabel == undefined || eHypLabel == buildNewLabelArgs.theoremLabel)
			// current eHyp has no label or it is equal to the theorem name
			EHypLabelManager.buildNewLabel(buildNewLabelArgs);
		else {
			// current eHyp has a label and it is not equal to the theorem name
			const dotIndex: number = eHypLabel.indexOf('.');
			const prefix: string = eHypLabel.substring(0, dotIndex);
			const suffix: string = eHypLabel.substring(dotIndex + 1, dotIndex);
			if (prefix == buildNewLabelArgs.theoremLabel && !isNaN(parseInt(suffix)))
				EHypLabelManager.buildNewLabel(buildNewLabelArgs);
		}
	}
	//#endregion buildNewLabelIfNeeded
}