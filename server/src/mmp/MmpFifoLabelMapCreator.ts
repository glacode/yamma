import { ILabelMapCreatorForCompressedProof } from './MmpCompressedProofCreator';
import { UProofStatementStep } from './MmpStatement';

export class MmpFifoLabelMapCreator implements ILabelMapCreatorForCompressedProof {
	createLabelMap(mandatoryHypsLabels: Map<string, number>,
		proofInNormalMode: UProofStatementStep[]): Map<string, number> {
		const labelSequence: Map<string, number> = new Map<string, number>();
		proofInNormalMode.forEach((uProofStatementStep: UProofStatementStep) => {
			const label = uProofStatementStep.label;
			if (mandatoryHypsLabels.get(label) == undefined && labelSequence.get(label) == undefined) {
				// the current label in the normal proof is not a label for a mandatory hypothesis and it
				// has not been added to the label sequence, yet
				const i = mandatoryHypsLabels.size + labelSequence.size + 1;
				labelSequence.set(label, i);
			}
		});
		return labelSequence;
	}
}