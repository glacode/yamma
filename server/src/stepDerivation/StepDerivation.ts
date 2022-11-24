import { Grammar } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode } from '../grammar/ParseNode';
import { BlockStatement } from '../mm/BlockStatement';
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement } from "../mm/AssertionStatement";
import { MmpProofStep } from '../mmp/MmpProofStep';
import { UProof } from '../mmp/UProof';
import { USubstitutionBuilder } from '../mmp/USubstitutionBuilder';
import { WorkingVars } from '../mmp/WorkingVars';
import { EHypsDerivation } from './EHypsDerivation';

/** tries to derive a label for the given MmpProofStep */
export class StepDerivation {
	uProof: UProof;
	mmpProofStepIndex: number;
	mmpProofStep: MmpProofStep;
	labelToStatementMap: Map<string, LabeledStatement>;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;
	constructor(uProof: UProof, mmpProofStepIndex: number, mmpProofStep: MmpProofStep, labelToStatementMap: Map<string, LabeledStatement>,
		outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars,
		maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		this.uProof = uProof;
		this.mmpProofStepIndex = mmpProofStepIndex;
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
		const numberOfHypothesisDispositions: number = Math.pow(this.mmpProofStepIndex, assertion.frame!.eHyps.length);
		return numberOfHypothesisDispositions;
	}
	private isWorstCaseTooSlow(assertion: AssertionStatement): boolean {
		const numberOfHypothesisDispositions: number = this.computeNumberOfHypothesisDispositions(assertion);
		const isTooSlow: boolean = (numberOfHypothesisDispositions > this.maxNumberOfHypothesisDispositionsForStepDerivation);
		return isTooSlow;
	}
	//#endregion isWorstCaseTooSlow

	//#region tryCurrentAssertion

	//#region tryAllPossibleEHypsPermutations

	//#region buildSubstitutionForCurrentHyp
	// private buildSubstitutionForCurrentLogicalEHyp(assertion: AssertionStatement, currentLogicalHypIndex: number,
	// 	currentProofStepEHypsCandidate: (MmpProofStep | undefined)[]): boolean {
	// 	if (this.)
	// 		//TODO1
	// 		const logicalEHypIndex: number = assertion.eHypsOrderForStepDerivation[currentLogicalHypIndex];
	// 	const currentLogicalEHyp: EHyp = assertion.frame?.eHyps[logicalEHypIndex];
	// 	let isCandidateUnified = false;
	// 	const proofStepEHypCandidateIndex = 0;
	// 	while (!isCandidateUnified && proofStepEHypCandidateIndex < this.mmpProofStepIndex) {
	// 		const currentUStatement: IUStatement = this.uProof.uStatements[proofStepEHypCandidateIndex];
	// 		if (currentUStatement instanceof MmpProofStep)
	// 			isCandidateUnified = this.tryToUnify(currentLogicalEHyp, substitution);

	// 	}


	// 	throw new Error('Method not implemented.');
	// }
	//#endregion buildSubstitutionForCurrentHyp

	tryEHypsDerivation(assertion: AssertionStatement, uSubstitutionBuilder: USubstitutionBuilder,
		substitution: Map<string, InternalNode>): void {
		const eHypsDerivation: EHypsDerivation = new EHypsDerivation(this.uProof, this.mmpProofStepIndex,
			this.mmpProofStep, assertion, this.labelToStatementMap, this.outermostBlock,
			this.grammar, this.workingVars, this.maxNumberOfHypothesisDispositionsForStepDerivation,
			uSubstitutionBuilder,substitution);
		// const eHypsDerivationResult: IEHypsDerivationResult = eHypsDerivation.searchEHyps();
		eHypsDerivation.searchEHyps();
		if (eHypsDerivation.eHypsDerivationResult.isSuccessful) {
			this.mmpProofStep.stepLabel = assertion.Label;
			// a valid permutation of mmpProofSteps has been found
			this.mmpProofStep.eHypUSteps = eHypsDerivation.eHypsDerivationResult.eHypsMmpProofSteps!;
		}

		// let substitutionFound: boolean = true;
		// const originalProofStepEHypProofSteps = this.mmpProofStep.eHypUSteps;
		// /** currentLogicalHypIndex will be used to index logical eHyps from longest to shortest formula */
		// let currentLogicalHypIndex = 0;
		// // const logicalEHypsPermutationOrderedByFormulaLength: number[] = assertion.eHypsPermutationOrderedByFormulaLength;
		// const currentProofStepEHypsCandidate: (MmpProofStep | undefined)[] =
		// 	new Array<(MmpProofStep | undefined)>(this.mmpProofStep.eHypUSteps.length);
		// while (substitutionFound && currentLogicalHypIndex < assertion.frame!.eHyps.length) {
		// 	substitutionFound = this.buildSubstitutionForCurrentLogicalEHyp(assertion, currentLogicalHypIndex);
		// 	currentLogicalHypIndex++;
		// }
		// if (!substitutionFound)
		// 	// no proofStepEHyps have been found, that unify with the current assertion
		// 	this.mmpProofStep.eHypUSteps = originalProofStepEHypProofSteps;
	}
	//#endregion tryAllPossibleEHypsPermutations

	private tryCurrentAssertion(assertion: AssertionStatement) {
		const substitution: Map<string, InternalNode> = new Map<string, InternalNode>();
		const uSubstitutionBuilder: USubstitutionBuilder = new USubstitutionBuilder(
			this.mmpProofStep, assertion, this.outermostBlock, this.workingVars, this.grammar, []);
		// const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
		const substitutionFound: boolean =
			uSubstitutionBuilder.buildSubstitutionForSingleLine(assertion.parseNode, this.mmpProofStep.formula,
				this.mmpProofStep.parseNode, substitution);
		if (substitutionFound) {
			// assertion.parseNode has been succesfully unified with this.mmpProofStep.parseNode
			this.tryEHypsDerivation(assertion, uSubstitutionBuilder, substitution);
		}
	}
	//#endregion tryCurrentAssertion

	private tryCurrentLabeledStatement(labeledStatement: LabeledStatement) {
		if (labeledStatement instanceof AssertionStatement &&
			!GrammarManager.isSyntaxAxiom2(labeledStatement) &&
			!this.isWorstCaseTooSlow(labeledStatement))
			this.tryCurrentAssertion(labeledStatement);
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
				for (const [_label, labeledStatement] of this.labelToStatementMap) {
					this.tryCurrentLabeledStatement(labeledStatement);
				}
		}
	}
	//#endregion deriveLabelAndHypothesis

}

