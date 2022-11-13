import { Grammar } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { BlockStatement } from '../mm/BlockStatement';
import { AssertionStatement, LabeledStatement } from '../mm/Statements';
import { MmpProofStep } from './MmpProofStep';
import { UProof } from './UProof';
import { SubstitutionResult, USubstitutionBuilder } from './USubstitutionBuilder';
import { WorkingVars } from './WorkingVars';

/** tries to derive a label for the given MmpProofStep */
export class LabelSelector {
	uProof: UProof;
	uStepIndex: number;
	mmpProofStep: MmpProofStep;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	constructor(uProof: UProof, uStepIndex: number, mmpProofStep: MmpProofStep,
		outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars) {
		this.uProof = uProof;
		this.uStepIndex = uStepIndex;
		this.mmpProofStep = mmpProofStep;
		this.outermostBlock = outermostBlock;
		this.grammar = grammar;
		this.workingVars = workingVars;
	}

	//#region deriveLabelAndHypothesis

	private isDeriveToBeTried(): boolean {
		const result = !this.mmpProofStep.hasWorkingVars;
		return result;
	}


	//#region tryCurrentAssertion
	tryCurrentAssertion(label: string, assertion: AssertionStatement) {
		//TODO1 add iteration over all possible eHyps (previous steps)
		const uSubstitutionBuilder: USubstitutionBuilder = new USubstitutionBuilder(
			this.mmpProofStep, assertion, this.outermostBlock, this.workingVars, this.grammar, []);
		const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
		// const substitutionResult: SubstitutionResult =
		// 	USubstitutionManager.buildSubstitution(uProofStep,
		// 		assertion, this.outermostBlock, this.workingVars, this.grammar);
		if (substitutionResult.hasBeenFound) {
			// throw new Error('Method not implemented.');
			this.mmpProofStep.stepLabel = label;
		}
	}
	//#endregion tryCurrentAssertion

	/** tries all possibles theorems in the theory, to see if one unifies the
	 * MmpProofStep, using as hypothesis the preceding steps
	  */
	deriveLabelAndHypothesis(): void {
		if (this.isDeriveToBeTried()) {
			// this.mmpProofStep.eHypUSteps.push(<MmpProofStep>this.uProof.uStatements[0]);
			// this.mmpProofStep.eHypUSteps.push(<MmpProofStep>this.uProof.uStatements[1]);
			// this.mmpProofStep.stepLabel = 'ax-mp';
			//TODO1 remove the commented code below
			if (this.mmpProofStep.stepLabel == undefined)
				this.outermostBlock.labelToStatementMap.forEach((labeledStatement: LabeledStatement, label: string) => {
					if (labeledStatement instanceof AssertionStatement &&
						!GrammarManager.isSyntaxAxiom2(labeledStatement)) {
						this.tryCurrentAssertion(label, labeledStatement);
						if (this.mmpProofStep.stepLabel != undefined)
							return;
					}
				});
		}
	}
	//#endregion deriveLabelAndHypothesis

}

