import { Grammar } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { BlockStatement } from '../mm/BlockStatement';
import { AssertionStatement, EHyp, LabeledStatement } from '../mm/Statements';
import { MmpProofStep } from '../mmp/MmpProofStep';
import { UProof } from '../mmp/UProof';
import { IUStatement } from '../mmp/UStatement';
import { SubstitutionResult, USubstitutionBuilder } from '../mmp/USubstitutionBuilder';
import { WorkingVars } from '../mmp/WorkingVars';

/** tries to derive a label for the given MmpProofStep */
export class StepDerivation {
	uProof: UProof;
	uStepIndex: number;
	mmpProofStep: MmpProofStep;
	labelToStatementMap: Map<string, LabeledStatement>;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;
	constructor(uProof: UProof, uStepIndex: number, mmpProofStep: MmpProofStep, labelToStatementMap: Map<string, LabeledStatement>,
		outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars,
		maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		this.uProof = uProof;
		this.uStepIndex = uStepIndex;
		this.mmpProofStep = mmpProofStep;
		this.labelToStatementMap = labelToStatementMap;
		this.outermostBlock = outermostBlock;
		this.grammar = grammar;
		this.workingVars = workingVars;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;
	}

	//#region deriveLabelAndHypothesis

	private isDeriveToBeTried(): boolean {
		const result = !this.mmpProofStep.hasWorkingVars;
		return result;
	}

	//#region tryCurrentLabeledStatement

	//#region isWorstCaseTooSlow
	computeNumberOfHypothesisDispositions(assertion: AssertionStatement): number {
		const numberOfHypothesisDispositions: number = Math.pow(this.uStepIndex,assertion.frame!.eHyps.length);
		return numberOfHypothesisDispositions;
	}
	private isWorstCaseTooSlow(assertion: AssertionStatement): boolean {
		const numberOfHypothesisDispositions: number = this.computeNumberOfHypothesisDispositions(assertion);
		const isTooSlow: boolean = (numberOfHypothesisDispositions > this.maxNumberOfHypothesisDispositionsForStepDerivation);
		return isTooSlow;
	}
	//#endregion isWorstCaseTooSlow

	//#region tryCurrentAssertion

	//#region buildSubstitutionForCurrentHyp
	private buildSubstitutionForCurrentLogicalEHyp(assertion: AssertionStatement, currentLogicalHypIndex: number,
		currentProofStepEHypsCandidate: (MmpProofStep | undefined)[]): boolean {
		if (this.)
			//TODO1
			const logicalEHypIndex: number = assertion.eHypsPermutationOrderedByFormulaLength[currentLogicalHypIndex];
		const currentLogicalEHyp: EHyp = assertion.frame?.eHyps[logicalEHypIndex];
		let isCandidateUnified = false;
		const proofStepEHypCandidateIndex = 0;
		while (!isCandidateUnified && proofStepEHypCandidateIndex < this.uStepIndex) {
			const currentUStatement: IUStatement = this.uProof.uStatements[proofStepEHypCandidateIndex];
			if (currentUStatement instanceof MmpProofStep)
				isCandidateUnified = this.tryToUnify(currentLogicalEHyp, substitution);

		}


		throw new Error('Method not implemented.');
	}
	//#endregion buildSubstitutionForCurrentHyp

	private tryCurrentAssertion(label: string, assertion: AssertionStatement) {
		const uSubstitutionBuilder: USubstitutionBuilder = new USubstitutionBuilder(
			this.mmpProofStep, assertion, this.outermostBlock, this.workingVars, this.grammar, []);
		const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
		let substitutionFound: boolean = substitutionResult.hasBeenFound;
		/** currentLogicalHypIndex will be used to index logical eHyps from longest to shortest formula */
		let currentLogicalHypIndex = 0;
		const originalProofStepEHypProofSteps = this.mmpProofStep.eHypUSteps;
		// const logicalEHypsPermutationOrderedByFormulaLength: number[] = assertion.eHypsPermutationOrderedByFormulaLength;
		const currentProofStepEHypsCandidate: (MmpProofStep | undefined)[] =
			new Array<(MmpProofStep | undefined)>(this.mmpProofStep.eHypUSteps.length);
		while (substitutionFound && currentLogicalHypIndex < assertion.frame!.eHyps.length) {
			substitutionFound = this.buildSubstitutionForCurrentLogicalEHyp(assertion, currentLogicalHypIndex);
			currentLogicalHypIndex++;
		}
		// const substitutionResult: SubstitutionResult =
		// 	USubstitutionManager.buildSubstitution(uProofStep,
		// 		assertion, this.outermostBlock, this.workingVars, this.grammar);
		if (substitutionFound) {
			this.mmpProofStep.stepLabel = label;
		} else
			// no proofStepEHyps have been found, that unify with the current assertion
			this.mmpProofStep.eHypUSteps = originalProofStepEHypProofSteps;
	}
	//#endregion tryCurrentAssertion

	private tryCurrentLabeledStatement(label: string, assertion: AssertionStatement) {
		if (labeledStatement instanceof AssertionStatement &&
			!GrammarManager.isSyntaxAxiom2(labeledStatement) &&
			!this.isWorstCaseTooSlow()) {
			this.tryCurrentAssertion(label, labeledStatement);
			if (this.mmpProofStep.stepLabel != undefined)
				break;
		}
	}
	//#endregion tryCurrentLabeledStatement

	/** tries all possibles theorems in the theory, to see if one unifies the
	 * MmpProofStep, using as hypothesis the preceding steps.
	 * If a valid, complete, unification is found, then this.mmpProofStep is completed with
	 * the label and the hypSteps that unify; otherwise, this.mmpProofStep is left unchanged
	  */
	deriveLabelAndHypothesis(): void {
		if (this.isDeriveToBeTried()) {
			// this.mmpProofStep.eHypUSteps.push(<MmpProofStep>this.uProof.uStatements[0]);
			// this.mmpProofStep.eHypUSteps.push(<MmpProofStep>this.uProof.uStatements[1]);
			// this.mmpProofStep.stepLabel = 'ax-mp';
			//TODO1 remove the commented code below
			if (this.mmpProofStep.stepLabel == undefined)
				for (const [label, labeledStatement] of this.labelToStatementMap) {
					this.tryCurrentLabeledStatement(label, labeledStatement);

				}
		}
	}
	//#endregion deriveLabelAndHypothesis

}

