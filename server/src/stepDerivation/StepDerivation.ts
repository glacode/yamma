import { Grammar } from 'nearley';
import { InternalNode } from '../grammar/ParseNode';
import { BlockStatement } from '../mm/BlockStatement';
import { AssertionStatement } from "../mm/AssertionStatement";
import { MmpProofStep } from '../mmp/MmpProofStep';
import { MmpProof } from '../mmp/MmpProof';
import { MmpSubstitutionBuilder } from '../mmp/MmpSubstitutionBuilder';
import { WorkingVars } from '../mmp/WorkingVars';
import { EHypsDerivation } from './EHypsDerivation';
import { MmpParser } from '../mmp/MmpParser';

/** tries to derive a label for the given MmpProofStep */
export class StepDerivation {
	private uProof: MmpProof;
	labelToNonSyntaxAssertionMap: Map<string, AssertionStatement>;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	constructor(mmpParser: MmpParser, private mmpProofStepIndex: number,
		private mmpProofStep: MmpProofStep,
		private maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		this.uProof = mmpParser.mmpProof!;
		this.labelToNonSyntaxAssertionMap = mmpParser.mmParser.labelToNonSyntaxAssertionMap;
		this.outermostBlock = mmpParser.outermostBlock;
		this.grammar = mmpParser.grammar;
		this.workingVars = mmpParser.workingVars;
	}

	//#region deriveLabelAndHypothesis

	private isDeriveToBeTried(): boolean {
		const result = !this.mmpProofStep.hasWorkingVars && this.outermostBlock.mmParser != undefined &&
			this.outermostBlock.mmParser?.areAllParseNodesComplete;
		return result;
	}

	//#region tryCurrentAssertion

	//#region isWorstCaseTooSlow
	computeNumberOfHypothesisDispositions(assertion: AssertionStatement): number {
		// const numberOfHypothesisDispositions: number = Math.pow(this.mmpProofStepIndex, assertion.frame!.eHyps.length);
		const numberOfHypothesisDispositions: number = Math.pow(this.mmpProofStepIndex,
			assertion.eHypsWithAdditionalVariablesToBeUnifiedForStepDerivation!);
		return numberOfHypothesisDispositions;
	}
	private isWorstCaseTooSlow(assertion: AssertionStatement): boolean {
		const numberOfHypothesisDispositions: number = this.computeNumberOfHypothesisDispositions(assertion);
		const isTooSlow: boolean = (numberOfHypothesisDispositions > this.maxNumberOfHypothesisDispositionsForStepDerivation);
		return isTooSlow;
	}
	//#endregion isWorstCaseTooSlow

	//#region tryCurrentAssertionActually

	//#region tryAllPossibleEHypsPermutations

	//#endregion buildSubstitutionForCurrentHyp

	tryEHypsDerivation(assertion: AssertionStatement, uSubstitutionBuilder: MmpSubstitutionBuilder,
		substitution: Map<string, InternalNode>): void {
		const eHypsDerivation: EHypsDerivation = new EHypsDerivation(this.uProof, this.mmpProofStepIndex,
			this.mmpProofStep, assertion, this.labelToNonSyntaxAssertionMap, this.outermostBlock,
			this.grammar, this.workingVars, this.maxNumberOfHypothesisDispositionsForStepDerivation,
			uSubstitutionBuilder, substitution);
		// const eHypsDerivationResult: IEHypsDerivationResult = eHypsDerivation.searchEHyps();
		eHypsDerivation.searchEHyps();
		if (eHypsDerivation.eHypsDerivationResult.isSuccessful) {
			this.mmpProofStep.stepLabel = assertion.Label;
			// a valid permutation of mmpProofSteps has been found
			this.mmpProofStep.eHypUSteps = eHypsDerivation.eHypsDerivationResult.eHypsMmpProofSteps;
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

	private tryCurrentAssertionActually(assertion: AssertionStatement) {
		const substitution: Map<string, InternalNode> = new Map<string, InternalNode>();
		const uSubstitutionBuilder: MmpSubstitutionBuilder = new MmpSubstitutionBuilder(
			this.mmpProofStep, assertion, this.outermostBlock, this.workingVars, this.grammar, [], true);
		// const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
		const substitutionFound: boolean =
			uSubstitutionBuilder.buildSubstitutionForSingleLine(assertion.parseNode!, this.mmpProofStep.formula,
				this.mmpProofStep.parseNode, substitution);
		if (substitutionFound) {
			// assertion.parseNode has been succesfully unified with this.mmpProofStep.parseNode
			// const totalSize: number = this.labelToNonSyntaxAssertionMap.size;
			// consoleLogWithTimestamp(assertion.statementNumber + " / " + totalSize + " - " + assertion.Label);
			this.tryEHypsDerivation(assertion, uSubstitutionBuilder, substitution);
			// consoleLogWithTimestamp(assertion.statementNumber + " / " + totalSize + " - " + assertion.Label);
		}
	}
	//#endregion tryCurrentAssertionActually

	tryCurrentAssertion(labeledStatement: AssertionStatement) {
		// if (labeledStatement instanceof AssertionStatement &&
		// 	!GrammarManager.isSyntaxAxiom2(labeledStatement) &&
		// 	!this.isWorstCaseTooSlow(labeledStatement))
		// 	this.tryCurrentAssertion(labeledStatement);
		if (!this.isWorstCaseTooSlow(labeledStatement) && labeledStatement.parseNode)
			this.tryCurrentAssertionActually(labeledStatement);
	}
	//#endregion tryCurrentAssertion

	/** tries all possibles theorems in the theory, to see if one unifies the
	 * MmpProofStep, using as hypothesis the preceding steps.
	 * If a valid, complete, unification is found, then this.mmpProofStep is completed with
	 * the label and the hypSteps that unify; otherwise, this.mmpProofStep is left unchanged
	  */
	deriveLabelAndHypothesis(): void {
		if (this.isDeriveToBeTried()) {
			const nonSyntaxAssertions: IterableIterator<AssertionStatement> = this.labelToNonSyntaxAssertionMap.values();
			let nonSyntaxAssertion: IteratorResult<AssertionStatement, any> = nonSyntaxAssertions.next();
			while (!nonSyntaxAssertion.done && this.mmpProofStep.stepLabel == undefined) {
				this.tryCurrentAssertion(nonSyntaxAssertion.value);
				nonSyntaxAssertion = nonSyntaxAssertions.next();
			}
		}
		// (const [_label, labeledStatement] of this.labelToNonSyntaxAssertionMap)
	}
	//#endregion deriveLabelAndHypothesis
}

