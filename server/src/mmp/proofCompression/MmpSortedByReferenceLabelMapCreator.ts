import { updateOccurrences } from '../../mm/Utils';
import { RpnStep } from '../RPNstep';
import { CreateLabelMapArgs, ILabelMapCreatorForCompressedProof } from './MmpCompressedProofCreator';

export class MmpSortedByReferenceLabelMapCreator implements ILabelMapCreatorForCompressedProof {


	//#region createLabelMap
	private createLabelToOccourencesMap(createLabelMapArgs: CreateLabelMapArgs): Map<string, number> {
		const labelToNumberOfOccourencesMap: Map<string, number> = new Map<string, number>();
		createLabelMapArgs.mmpPackedProofStatement?.packedProof.forEach((rpnStep: RpnStep) => {
			const labelCandidate: string = rpnStep.labelForCompressedProof;
			if (!createLabelMapArgs.mandatoryHypsLabels!.has(labelCandidate))
				// the current label is not for a mandatory hypothesis
				updateOccurrences(labelToNumberOfOccourencesMap, rpnStep.labelForCompressedProof);
		});
		return labelToNumberOfOccourencesMap;
	}

	createLabelMap(
		createLabelMapArgs: CreateLabelMapArgs): Map<string, number> {
		const labelToNumberOfOccourencesMap: Map<string, number> =
			this.createLabelToOccourencesMap(createLabelMapArgs);
		const sortedLabels = [...labelToNumberOfOccourencesMap.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([label, _]) => label);
		const labelSequence: Map<string, number> = new Map<string, number>();
		for (let i = 0; i < sortedLabels.length; i++) {
			labelSequence.set(sortedLabels[i], i + 1);
		}
		return labelSequence;
	}
	//#endregion createLabelMap
}