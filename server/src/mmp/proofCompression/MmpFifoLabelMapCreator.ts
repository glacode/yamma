import { CreateLabelMapArgs, ILabelMapCreatorForCompressedProof } from './MmpCompressedProofCreator';
import { UProofStatementStep } from '../MmpStatement';

export class MmpFifoLabelMapCreator implements ILabelMapCreatorForCompressedProof {
	createLabelMap(createLabelMapArgs: CreateLabelMapArgs): Map<string, number> {
		const labelSequence: Map<string, number> = new Map<string, number>();
		createLabelMapArgs.proofInNormalMode!.forEach((uProofStatementStep: UProofStatementStep) => {
			const label = uProofStatementStep.label;
			if (createLabelMapArgs.mandatoryHypsLabels!.get(label) == undefined && labelSequence.get(label) == undefined) {
				// the current label in the normal proof is not a label for a mandatory hypothesis and it
				// has not been added to the label sequence, yet
				const i = labelSequence.size + 1;
				labelSequence.set(label, i);
			}
		});
		return labelSequence;
	}
}