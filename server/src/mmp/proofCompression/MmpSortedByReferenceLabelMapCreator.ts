import { EHyp } from '../../mm/EHyp';
import { FHyp } from '../../mm/FHyp';
import { LabeledStatement } from '../../mm/LabeledStatement';
import { RpnStep } from '../RPNstep';
import { CreateLabelMapArgs, ILabelMapCreatorForCompressedProof } from './MmpCompressedProofCreator';
import { MapEntry } from './MmpLabelMapCreatorLikeMmj2';

export class MmpSortedByReferenceLabelMapCreator implements ILabelMapCreatorForCompressedProof {


	//#region createLabelMap

	//#region createLabeledStatementToOccourencesMap
	private createLabeledStatementToOccourencesMap1(createLabelMapArgs: CreateLabelMapArgs): Map<LabeledStatement, MapEntry> {
		const labelToNumberOfOccourencesMap: Map<LabeledStatement, MapEntry> = new Map<LabeledStatement, MapEntry>();
		createLabelMapArgs.mmpPackedProofStatement?.packedProof.forEach((rpnStep: RpnStep) => {
			const labelCandidate: string = rpnStep.labelForCompressedProof;
			if (!rpnStep.isBackRefStep &&
				!createLabelMapArgs.mandatoryHypsLabels!.has(labelCandidate)) {
				// the current step is NOT a backRef step and the current label is not for a mandatory hypothesis
				// updateOccurrences(labelToNumberOfOccourencesMap, rpnStep.labeledStatement);
				const currentNumberOfOccourences: number = labelToNumberOfOccourencesMap.get(rpnStep.labeledStatement)?.numberOfOccurences || 0;
				const currentIndex: number = labelToNumberOfOccourencesMap.get(rpnStep.labeledStatement)?.index ||
					labelToNumberOfOccourencesMap.size + 1;
				const mapEntry: MapEntry = {
					index: currentIndex,
					numberOfOccurences: currentNumberOfOccourences + 1
				};
				labelToNumberOfOccourencesMap.set(rpnStep.labeledStatement, mapEntry);
			}
		});
		return labelToNumberOfOccourencesMap;
	}
	//#region createLabelToNumberOfOccourencesMapWithHypsFirst
	/** reorders labelToNumberOfOccourencesMap, putting Hyps first */
	buildEntry(numberOfOccurences: number, index: number): MapEntry {
		const mapEntry: MapEntry = {
			index: index,
			numberOfOccurences: numberOfOccurences
		};
		return mapEntry;
	}
	private createLabelToNumberOfOccourencesMapWithHypsFirst(labelToNumberOfOccourencesMap: Map<LabeledStatement, MapEntry>) {
		const labelToNumberOfOccourencesMapWithHypsFirst: Map<LabeledStatement, MapEntry> = new Map<LabeledStatement, MapEntry>();
		for (const [labeledStatement, mapEntry] of labelToNumberOfOccourencesMap)
			if (labeledStatement instanceof EHyp || labeledStatement instanceof FHyp)
				labelToNumberOfOccourencesMapWithHypsFirst.set(labeledStatement,
					this.buildEntry(mapEntry.numberOfOccurences, labelToNumberOfOccourencesMapWithHypsFirst.size + 1));
		for (const [labeledStatement, mapEntry] of labelToNumberOfOccourencesMap)
			if (!(labeledStatement instanceof EHyp || labeledStatement instanceof FHyp))
				labelToNumberOfOccourencesMapWithHypsFirst.set(labeledStatement,
					this.buildEntry(mapEntry.numberOfOccurences, labelToNumberOfOccourencesMapWithHypsFirst.size + 1));
		return labelToNumberOfOccourencesMapWithHypsFirst;
	}
	//#endregion createLabelToNumberOfOccourencesMapWithHypsFirst

	/** returns a Map whith number of occourences; they are in the order of RpnSteps in the packed proof, but
	 *  with Hyps at the beginning */
	protected createLabeledStatementToOccourencesMap(createLabelMapArgs: CreateLabelMapArgs): Map<LabeledStatement, MapEntry> {
		const labelToNumberOfOccourencesMap1: Map<LabeledStatement, MapEntry> =
			this.createLabeledStatementToOccourencesMap1(createLabelMapArgs);
		const labelToNumberOfOccourencesMapWithHypsFirst =
			this.createLabelToNumberOfOccourencesMapWithHypsFirst(labelToNumberOfOccourencesMap1);
		return labelToNumberOfOccourencesMapWithHypsFirst;
	}
	//#endregion createLabeledStatementToOccourencesMap

	createLabelMap(
		createLabelMapArgs: CreateLabelMapArgs): Map<string, number> {
		const labelToNumberOfOccourencesMap: Map<LabeledStatement, MapEntry> =
			this.createLabeledStatementToOccourencesMap(createLabelMapArgs);
		const sortedLabelStatements: LabeledStatement[] = [...labelToNumberOfOccourencesMap.entries()]
			.sort((a, b) => (a[1].numberOfOccurences == b[1].numberOfOccurences) ?
				a[1].index - b[1].index : b[1].numberOfOccurences - a[1].numberOfOccurences)  //this mimics the mmj2 behaviour
			.map(([label, _]) => label);
		const labelSequence: Map<string, number> = new Map<string, number>();
		for (let i = 0; i < sortedLabelStatements.length; i++) {
			labelSequence.set(sortedLabelStatements[i].Label, i + 1);
		}
		return labelSequence;
	}
	//#endregion createLabelMap
}