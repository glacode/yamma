import { EHyp } from '../../mm/EHyp';
import { FHyp } from '../../mm/FHyp';
import { LabeledStatement } from '../../mm/LabeledStatement';
import { updateOccurrences } from '../../mm/Utils';
import { RpnStep } from '../RPNstep';
import { CreateLabelMapArgs, ILabelMapCreatorForCompressedProof } from './MmpCompressedProofCreator';

export class MmpSortedByReferenceLabelMapCreator implements ILabelMapCreatorForCompressedProof {


	//#region createLabelMap

	//#region createLabeledStatementToOccourencesMap
	private createLabeledStatementToOccourencesMap1(createLabelMapArgs: CreateLabelMapArgs): Map<LabeledStatement, number> {
		const labelToNumberOfOccourencesMap: Map<LabeledStatement, number> = new Map<LabeledStatement, number>();
		createLabelMapArgs.mmpPackedProofStatement?.packedProof.forEach((rpnStep: RpnStep) => {
			const labelCandidate: string = rpnStep.labelForCompressedProof;
			if (!createLabelMapArgs.mandatoryHypsLabels!.has(labelCandidate))
				// the current label is not for a mandatory hypothesis
				// updateOccurrences(labelToNumberOfOccourencesMap, rpnStep.labelForCompressedProof);
				updateOccurrences(labelToNumberOfOccourencesMap, rpnStep.labeledStatement);
		});
		return labelToNumberOfOccourencesMap;
	}
	/** reorders labelToNumberOfOccourencesMap, putting Hyps first */
	createLabelToNumberOfOccourencesMapWithHypsFirst(labelToNumberOfOccourencesMap: Map<LabeledStatement, number>) {
		const labelToNumberOfOccourencesMapWithHypsFirst: Map<LabeledStatement, number> = new Map<LabeledStatement, number>();
		for (const [labeledStatement, number] of labelToNumberOfOccourencesMap)
			if (labeledStatement instanceof EHyp || labeledStatement instanceof FHyp)
				labelToNumberOfOccourencesMapWithHypsFirst.set(labeledStatement, number);
		for (const [labeledStatement, number] of labelToNumberOfOccourencesMap)
			if (!(labeledStatement instanceof EHyp || labeledStatement instanceof FHyp))
				labelToNumberOfOccourencesMapWithHypsFirst.set(labeledStatement, number);
		return labelToNumberOfOccourencesMapWithHypsFirst;
	}
	private createLabeledStatementToOccourencesMap(createLabelMapArgs: CreateLabelMapArgs): Map<LabeledStatement, number> {
		const labelToNumberOfOccourencesMap1: Map<LabeledStatement, number> =
			this.createLabeledStatementToOccourencesMap1(createLabelMapArgs);
		const labelToNumberOfOccourencesMapWithHypsFirst =
			this.createLabelToNumberOfOccourencesMapWithHypsFirst(labelToNumberOfOccourencesMap1);
		return labelToNumberOfOccourencesMapWithHypsFirst;
	}
	//#endregion createLabeledStatementToOccourencesMap

	createLabelMap(
		createLabelMapArgs: CreateLabelMapArgs): Map<string, number> {
		const labelToNumberOfOccourencesMap: Map<LabeledStatement, number> =
			this.createLabeledStatementToOccourencesMap(createLabelMapArgs);
		const sortedLabelStatements: LabeledStatement[] = [...labelToNumberOfOccourencesMap.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([label, _]) => label);
		const labelSequence: Map<string, number> = new Map<string, number>();
		for (let i = 0; i < sortedLabelStatements.length; i++) {
			labelSequence.set(sortedLabelStatements[i].Label, i + 1);
		}
		return labelSequence;
	}
	//#endregion createLabelMap
}