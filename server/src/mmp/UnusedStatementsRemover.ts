import { MmpProof } from './MmpProof';
import { MmpProofStep } from './MmpProofStep';
import { IMmpStatement } from './MmpStatement';

export abstract class UnusedStatementsRemover {
	//#region removeUnusedStatements

	//#region getUsedStatements
	static getUsedStatementsRecursively(currentMmpProofStep: MmpProofStep, usedSatements: Set<IMmpStatement>) {
		usedSatements.add(currentMmpProofStep);
		currentMmpProofStep.eHypUSteps.forEach((mmpProofStep?: MmpProofStep) => {
			if (mmpProofStep)
				this.getUsedStatementsRecursively(mmpProofStep, usedSatements);
		});
	}
	static getUsedStatements(mmpProof: MmpProof):
		Set<IMmpStatement> {
		const usedSatements: Set<IMmpStatement> = new Set<IMmpStatement>();
		if (mmpProof.lastMmpProofStep != undefined)
			this.getUsedStatementsRecursively(mmpProof.lastMmpProofStep, usedSatements);
		return usedSatements;
	}
	//#endregion getUsedStatements
	static removeUnusedStatements(mmpProof: MmpProof) {
		const usedStatements: Set<IMmpStatement> = this.getUsedStatements(mmpProof);
		mmpProof.mmpStatements = mmpProof.mmpStatements.filter((mmpStatement: IMmpStatement) => {
			return !(mmpStatement instanceof MmpProofStep) || usedStatements.has(mmpStatement);
		});
	}
	//#endregion removeUnusedStatements
}

