import { MmpProof } from './MmpProof';
import { MmpProofStep } from './MmpProofStep';
import { IMmpStatement } from './MmpStatement';

export abstract class RefNumberManager {
	static renumberMmpProofStep(mmpProofStep: MmpProofStep, oldRefToProofStepMap: Map<string, MmpProofStep>, ref: number) {
		if (mmpProofStep.stepRef != '')
			oldRefToProofStepMap.set(mmpProofStep.stepRef, mmpProofStep);
		// const strRef: string = (mmpProofStep.isEHyp ? 'h' + ref.toString() : ref.toString());
		const strRef: string = ref.toString();
		mmpProofStep.stepRef = strRef;
	}
	public static renumber(mmpProof: MmpProof) {
		const oldRefToProofStepMap: Map<string, MmpProofStep> = new Map<string, MmpProofStep>();
		const mmpStatements: IMmpStatement[] = mmpProof.mmpStatements;
		let ref = 1;
		mmpStatements.forEach((mmpStatement: IMmpStatement) => {
			if (mmpStatement instanceof MmpProofStep  && !mmpStatement.isQed ) {
				RefNumberManager.renumberMmpProofStep(mmpStatement, oldRefToProofStepMap, ref++);
			}
		});
	}
	//#endregion renumber
}

