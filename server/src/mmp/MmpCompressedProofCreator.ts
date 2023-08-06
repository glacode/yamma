import { MmpCompressedProofStatementFromPackedProof } from './MmpCompressedProofStatementFromPackedProof';
import { MmpProof } from './MmpProof';
import { IMmpStatement, UProofStatementStep } from './MmpStatement';
import { UCompressedProofStatement } from './UCompressedProofStatement';

export interface IMmpCompressedProofCreator {
	createMmpCompressedProof(mmpProof: MmpProof, leftMargin?: number,
		charactersPerLine?: number): IMmpStatement;
}

export interface ILabelMapCreatorForCompressedProof {
	createLabelMap(
		mandatoryHypsLabels?: Map<string, number>,
		proofInNormalMode?: UProofStatementStep[],
	): Map<string, number>;
}

export class MmpCompressedProofCreatorFromUncompressedProof implements IMmpCompressedProofCreator {
	constructor(private labelMapCreator?: ILabelMapCreatorForCompressedProof) {
	}
	createMmpCompressedProof(mmpProof: MmpProof, leftMargin: number,
		charactersPerLine: number): IMmpStatement {
		const proofStatement = new UCompressedProofStatement(mmpProof, leftMargin,
			charactersPerLine, this.labelMapCreator);
		return proofStatement;
	}
}

export class MmpCompressedProofCreatorFromPackedProof implements IMmpCompressedProofCreator {
	constructor(private labelMapCreator?: ILabelMapCreatorForCompressedProof) {
	}
	createMmpCompressedProof(mmpProof: MmpProof, leftMargin: number,
		charactersPerLine: number): IMmpStatement {
		const proofStatement = new MmpCompressedProofStatementFromPackedProof(
			mmpProof, leftMargin, charactersPerLine, this.labelMapCreator);
		return proofStatement;
	}
}