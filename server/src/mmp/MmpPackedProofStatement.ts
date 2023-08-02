import { MmpProof } from './MmpProof';
import { IMmpStatement } from './MmpStatement';
import { ProofNode } from './ProofNode';
import { RpnStep } from './RPNstep';

export class MmpPackedProofStatement implements IMmpStatement {
	public packedProof: RpnStep[];
	constructor(private mmpProof: MmpProof, private charactersPerLine: number) {
		this.packedProof = this.createPackedProof();
	}

	//#region createPackedProof
	createPackedProof(): RpnStep[] {
		const proofNode: ProofNode = ProofNode.proofNodeForMmpProofStep(this.mmpProof.lastMmpProofStep!);
		this.packedProof = RpnStep.packedProof(proofNode,this.mmpProof.outermostBlock);
		return this.packedProof;
	}
	//#endregion createPackedProof


	//#region toText
	rpnPackedStepLabels(): string[] {
		const packedStepLabels: string[] = [];
		this.packedProof.forEach((rpnStep: RpnStep) => {
			const packedStepLabel: string = rpnStep.toText();
			packedStepLabels.push(packedStepLabel);
		});
		return packedStepLabels;
	}

	buildLabelRows(labels: string[], charactersPerLine: number): string[] {
		const labelRows: string[] = [];
		const start = '$=  ';
		const leftPadding = '    ';
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
	toText(): string {
		const labels: string[] = this.rpnPackedStepLabels();
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
		throw new Error('Method not implemented.');
	}
	//#endregion toText
}