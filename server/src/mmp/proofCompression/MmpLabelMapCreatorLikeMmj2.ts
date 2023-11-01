import { EHyp } from '../../mm/EHyp';
import { FHyp } from '../../mm/FHyp';
import { LabeledStatement } from '../../mm/LabeledStatement';
import { RpnStep } from '../RPNstep';
import { CreateLabelMapArgs, ILabelMapCreatorForCompressedProof } from './MmpCompressedProofCreator';

export interface MapEntry {
	index: number;
	numberOfOccurences: number;
}

export class MmpLabelMapCreatorLikeMmj2 implements ILabelMapCreatorForCompressedProof {

	constructor(private rpnProofLeftColumn: number, private rpnProofRightColumn: number) {

	}


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
	private createLabeledStatementToOccourencesMap(createLabelMapArgs: CreateLabelMapArgs): Map<LabeledStatement, MapEntry> {
		const labelToNumberOfOccourencesMap1: Map<LabeledStatement, MapEntry> =
			this.createLabeledStatementToOccourencesMap1(createLabelMapArgs);
		const labelToNumberOfOccourencesMapWithHypsFirst =
			this.createLabelToNumberOfOccourencesMapWithHypsFirst(labelToNumberOfOccourencesMap1);
		return labelToNumberOfOccourencesMapWithHypsFirst;
	}
	//#endregion createLabeledStatementToOccourencesMap

	private labelsToLabelMap(labels: string[]): Map<string, number> {
		const labelMap: Map<string, number> = new Map<string, number>();
		// const labelStatements: LabeledStatement[] = [...labeledStatementsMap.entries()].map(([label, _]) => label);
		for (let i = 0; i < labels.length; i++) {
			// labelMap.set(labelStatements[i].Label, i + 1);
			labelMap.set(labels[i], i + 1);
		}
		return labelMap;
	}

	//#region applyKnapSackFit

	//#region processBlock

	//#region knapsackFit
	allocateDoubleArray(dim1: number, dim2: number): number[][] {
		// const doubleArray: number[][] = new Array<number[]>(dim1);
		const doubleArray: number[][] = [];
		for (let index = 0; index < dim1; index++) {
			const newRow: number[] = [];
			for (let i = 0; i < dim2; i++)
				newRow.push(0);
			doubleArray.push(newRow);
		}
		return doubleArray;
	}
	knapsackFit(lengthBlock: [LabeledStatement, MapEntry][], size: number): [LabeledStatement, MapEntry][] {
		const worth: number[][] = this.allocateDoubleArray(lengthBlock.length + 1, size + 1);
		// final int[][] worth = new int[items.size() + 1][size + 1];
		for (let i = 0; i < lengthBlock.length; i++) {
			const value = lengthBlock[i][0].Label.length + 1;
			for (let s = 0; s <= size; s++)
				worth[i + 1][s] = s >= value
					? Math.max(worth[i][s], value + worth[i][s - value])
					: worth[i][s];
		}
		// for (int i = 0; i < items.size(); i++) {
		//     final int value = values[items.get(i)];
		// 	for (int s = 0; s <= size; s++)
		// 	worth[i + 1][s] = s >= value
		// 		? Math.max(worth[i][s], value + worth[i][s - value])
		// 		: worth[i][s];
		// }
		const included: [LabeledStatement, MapEntry][] = [];
		let s: number = size;
		for (let i = lengthBlock.length - 1; i >= 0; i--) {
			if (worth[i + 1][s] != worth[i][s]) {
				included.unshift(lengthBlock[i]);
				s -= lengthBlock[i][0].Label.length + 1;
				if (s == 0)
					break;
			}
		}
		return included;
	}
	//#endregion knapsackFit

	removeItemsFromLenghBlock(included: [LabeledStatement, MapEntry][], lengthBlock: [LabeledStatement, MapEntry][]) {
		included.forEach((item: [LabeledStatement, MapEntry]) => {
			const index: number = lengthBlock.indexOf(item);   // it should always find it
			lengthBlock.splice(index, 1);
		});
	}

	processBlock(parenStmt: string[], lengthBlock: [LabeledStatement, MapEntry][], width: number, linePos: number): number {
		lengthBlock.sort((a, b) => a[1].index - b[1].index); // restart with proof order
		while (lengthBlock.length > 0) {
			let noSpace = true;
			const included: [LabeledStatement, MapEntry][] = this.knapsackFit(lengthBlock, width - linePos);
			included.forEach((statement: [LabeledStatement, MapEntry]) => {
				noSpace = false;
				const currentLabel: string = statement[0].Label;
				const l: number = currentLabel.length + 1;
				linePos += l;
				parenStmt.push(currentLabel);
			});
			this.removeItemsFromLenghBlock(included, lengthBlock);
			if (noSpace || linePos >= width - 1)
				linePos = 0;
		}
		return linePos;
	}
	//#endregion processBlock

	/** mimics the mmj2 behavior:
	 * - LabeledStatements with the same number of characters in the capital letter represent, are processed
	 * in the same processBlock
	 * - each processBlock applies a knapsack algorithm for each line, until the block is completed
	 */
	private applyKnapSackFit(numberOfMandatoryHyps: number, labelStatementsSortedByNumberOfOccourences:
		[LabeledStatement, MapEntry][]): string[] {
		const parenStmt: string[] = [];
		let i: number = numberOfMandatoryHyps;
		let cutoff = 20;
		while (cutoff <= i) {
			i -= cutoff;
			cutoff *= 5;
		}
		let pos: [LabeledStatement, MapEntry] | undefined;
		let linePos = 2;
		// this is the code for with, in mmj2
		// final int width = proofWorksheet.proofAsstPreferences.rpnProofRightCol
		// 	.get() - proofWorksheet.getRPNProofLeftCol() + 1;
		const width = this.rpnProofRightColumn - this.rpnProofLeftColumn + 1;
		const lengthBlock: [LabeledStatement, MapEntry][] = [];
		while ((pos = labelStatementsSortedByNumberOfOccourences.shift()) != null) {
			if (i++ == cutoff) {
				i = 1;
				cutoff *= 5;
				// linePos = processBlock(parenStmt, proofOrdered, values, lengthBlock, width, linePos);
				linePos = this.processBlock(parenStmt, lengthBlock, width, linePos);
			}
			lengthBlock.push(pos);
		}
		this.processBlock(parenStmt, lengthBlock, width, linePos);
		return parenStmt;
	}
	//#endregion applyKnapSackFit

	createLabelMap(
		createLabelMapArgs: CreateLabelMapArgs): Map<string, number> {
		const labelToNumberOfOccourencesMap: Map<LabeledStatement, MapEntry> =
			this.createLabeledStatementToOccourencesMap(createLabelMapArgs);
		// const sortedLabelStatements: LabeledStatement[] = [...labelToNumberOfOccourencesMap.entries()]
		// 	.sort((a, b) => (a[1].numberOfOccurences == b[1].numberOfOccurences) ?
		// 		a[1].index - b[1].index : b[1].numberOfOccurences - a[1].numberOfOccurences)  //this mimics the mmj2 behaviour
		// 	.map(([label, _]) => label);
		const labelStatementsSortedByNumberOfOccourences: [LabeledStatement, MapEntry][] = [...labelToNumberOfOccourencesMap.entries()].sort(
			(a, b) => b[1].numberOfOccurences - a[1].numberOfOccurences);
		const labels: string[] =
			this.applyKnapSackFit(createLabelMapArgs.mandatoryHypsLabels.size,
				labelStatementsSortedByNumberOfOccourences);
		const labelMap: Map<string, number> = this.labelsToLabelMap(labels);
		return labelMap;
	}
	//#endregion createLabelMap
}