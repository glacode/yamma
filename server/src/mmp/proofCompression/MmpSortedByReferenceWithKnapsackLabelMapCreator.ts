import { LabeledStatement } from '../../mm/LabeledStatement';
import { CreateLabelMapArgs } from './MmpCompressedProofCreator';
import { MapEntry, MmpSortedByReferenceLabelMapCreator } from './MmpSortedByReferenceLabelMapCreator';

/** This class orders the labels of the compressed proof, according to the following rules:
 * 1. LabeledStatements are ordered w.r.t. the number of occurrences in the packed proof
 * (mandatory Hyps are not considered; backRef statements are not considered). In the event
 * of a tie in the number of occurrences, Hyps are placed first.
 * 2. the list of LabeledStatements are then split in groups (blocks) where statements are
 * indexed by uppercase letters (representing integers) of the same length
 * 3. the knapsack algorithm is applied to each of these blocks (but within every single
 * block, labels are reordered in proof order)
 */
export class MmpSortedByReferenceWithKnapsackLabelMapCreator extends MmpSortedByReferenceLabelMapCreator {

	constructor(private compressedProofLeftColumn: number, private compressedProofRightColumn: number) {
		super();
	}


	//#region createLabelMap

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
		// below, mmj2 has + 1 , but it is wrong, because we add a space to every label, thus one more char is needed
		const width = this.compressedProofRightColumn - this.compressedProofLeftColumn + 2;
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