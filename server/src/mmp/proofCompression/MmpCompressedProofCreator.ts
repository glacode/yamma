import { MmpFifoLabelMapCreator } from './MmpFifoLabelMapCreator';
import { MmpProof } from '../MmpProof';
import { IMmpStatement, UProofStatementStep } from '../MmpStatement';
import { MmpCompressedProofStatementFromPackedProof } from './MmpCompressedProofStatementFromPackedProof';
import { MmpPackedProofStatement } from './MmpPackedProofStatement';
import { LabelsOrderInCompressedProof } from '../../mm/ConfigurationManager';
import { MmpSortedByReferenceLabelMapCreator } from './MmpSortedByReferenceLabelMapCreator';
import { MmpSortedByReferenceWithKnapsackLabelMapCreator } from './MmpSortedByReferenceWithKnapsackLabelMapCreator';

export interface IMmpCompressedProofCreator {
	createMmpCompressedProof(mmpProof: MmpProof, leftMargin?: number,
		charactersPerLine?: number): IMmpStatement;
}

export interface CreateLabelMapArgs {
	mandatoryHypsLabels: Set<string>,
	proofInNormalMode?: UProofStatementStep[],
	mmpPackedProofStatement?: MmpPackedProofStatement
}

export interface ILabelMapCreatorForCompressedProof {
	createLabelMap(
		createLabelMapArgs: CreateLabelMapArgs
	): Map<string, number>;
}

export class MmpCompressedProofCreatorFromPackedProof implements IMmpCompressedProofCreator {

	private _labelMapCreator: ILabelMapCreatorForCompressedProof
	constructor(labelMapCreator?: ILabelMapCreatorForCompressedProof) {
		if (labelMapCreator != undefined)
			this._labelMapCreator = labelMapCreator;
		else
			this._labelMapCreator = new MmpFifoLabelMapCreator();
	}
	createMmpCompressedProof(mmpProof: MmpProof, leftMargin: number,
		charactersPerLine: number): MmpCompressedProofStatementFromPackedProof {
		const proofStatement = new MmpCompressedProofStatementFromPackedProof(
			mmpProof, leftMargin, charactersPerLine, this._labelMapCreator);
		return proofStatement;
	}

	static getLabelMapCreatorForCompressedProof(
		labelsOrderInCompressedProof: LabelsOrderInCompressedProof,
		compressedProofLeftColumn: number, compressedProofRightColumn: number):
		ILabelMapCreatorForCompressedProof {
		let labelMapCreatorForCompressedProof: ILabelMapCreatorForCompressedProof;
		switch (labelsOrderInCompressedProof) {
			case LabelsOrderInCompressedProof.fifo:
				labelMapCreatorForCompressedProof = new MmpFifoLabelMapCreator();
				break;
			case LabelsOrderInCompressedProof.mostReferencedFirst:
				labelMapCreatorForCompressedProof = new MmpSortedByReferenceLabelMapCreator();
				break;
			default:
				labelMapCreatorForCompressedProof =
					new MmpSortedByReferenceWithKnapsackLabelMapCreator(
						compressedProofLeftColumn, compressedProofRightColumn);
				break;
		}
		return labelMapCreatorForCompressedProof;
	}
}