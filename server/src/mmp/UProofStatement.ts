import { IMmpStatement, UProofStatementStep } from './MmpStatement';



/** Proof statement in 'normal' (non compressed) mode */
export class UProofStatement implements IMmpStatement {
	proof: UProofStatementStep[];
	constructor(proof: UProofStatementStep[], private charactersPerLine: number) {
		this.proof = proof;
	}

	public static labelsArray(proof: UProofStatementStep[]): string[] {
		const labels: string[] = [];
		proof.forEach((uProofStatementStep: UProofStatementStep) => {
			labels.push(uProofStatementStep.label);
		});
		return labels;
	}

	//#region toText
	//#region buildLabelRows
	buildLabelRows(labels: string[], charactersPerLine: number): string[] {
		const labelRows: string[] = [];
		const start = '$=    ';
		const leftPadding = '      ';
		let currentRow = start;
		labels.forEach((label: string) => {
			if (currentRow.length + label.length + 1 > charactersPerLine) {
				// the current label cannot be added to the current line
				labelRows.push(currentRow);
				currentRow = leftPadding;
			} else if (currentRow != start && currentRow != leftPadding)
				// current row contains some label, but there is room to accept the current label
				currentRow += ' ';
			currentRow += label;
		});
		if (currentRow != start && currentRow != leftPadding)
			// the last label did not complete a row, and then the last row has not been added, yet
			labelRows.push(currentRow);
		return labelRows;
	}
	//#endregion buildLabelRows
	toText(): string {
		// const labels: string[] = [];
		// this.proof.forEach((uProofStatementStep: UProofStatementStep) => {
		// 	labels.push(uProofStatementStep.label);
		// });
		const labels: string[] = UProofStatement.labelsArray(this.proof);

		// const labelRows: string[] = this.buildLabelRows(labels, Parameters.defaultRightMarginForNormalProofs);
		const labelRows: string[] = this.buildLabelRows(labels, this.charactersPerLine);
		const labelsString = labelRows.join('\n');
		let text = '\n' + labelsString;
		const lastRowOfLabels: string = labelRows[labelRows.length - 1];
		// if (lastRowOfLabels.length > Parameters.defaultRightMarginForNormalProofs - 3)
		if (lastRowOfLabels.length > this.charactersPerLine - 3)
			text += '\n$.';
		else
			text += ' $.\n';
		// const text = "\n$=    " + labelsString + " $.";
		return text;
	}
	//#endregion toText
}
