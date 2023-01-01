import { Grammar } from 'nearley';
import { BlockStatement } from '../mm/BlockStatement';
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement, IEHypOrderForStepDerivation } from "../mm/AssertionStatement";
import { MmpProofStep } from '../mmp/MmpProofStep';
import { MmpProof } from '../mmp/MmpProof';
import { WorkingVars } from '../mmp/WorkingVars';
import { MmpSubstitutionBuilder } from '../mmp/MmpSubstitutionBuilder';
import { InternalNode } from '../grammar/ParseNode';
import { IMmpStatement } from '../mmp/MmpStatement';
import { MmpSubstitutionApplier } from '../mmp/MmpSubstitutionApplier';
import { EHyp } from '../mm/EHyp';

export interface IEHypsDerivationResult {
	isSuccessful: boolean | undefined;
	eHypsMmpProofSteps: (MmpProofStep | undefined)[];
}

export class EHypsDerivation {
	uProof: MmpProof;
	mmpProofStepIndex: number;
	mmpProofStep: MmpProofStep;
	assertion: AssertionStatement;
	labelToStatementMap: Map<string, LabeledStatement>;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;
	uSubstitutionBuilder: MmpSubstitutionBuilder;
	substitution: Map<string, InternalNode>;

	eHypsDerivationResult: IEHypsDerivationResult;

	constructor(uProof: MmpProof, mmpProofStepIndex: number, mmpProofStep: MmpProofStep, assertion: AssertionStatement,
		labelToStatementMap: Map<string, LabeledStatement>,
		outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars,
		maxNumberOfHypothesisDispositionsForStepDerivation: number,
		uSubstitutionBuilder: MmpSubstitutionBuilder, substitution: Map<string, InternalNode>) {
		this.uProof = uProof;
		this.mmpProofStepIndex = mmpProofStepIndex;
		this.mmpProofStep = mmpProofStep;
		this.assertion = assertion;
		this.labelToStatementMap = labelToStatementMap;
		this.outermostBlock = outermostBlock;
		this.grammar = grammar;
		this.workingVars = workingVars;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;
		this.uSubstitutionBuilder = uSubstitutionBuilder;
		this.substitution = substitution;

		this.eHypsDerivationResult = this.initializeEHypsDerivationResult(assertion.frame!.eHyps.length);
	}
	private initializeEHypsDerivationResult(assertionEHypsNum: number): IEHypsDerivationResult {
		const emptyArray: MmpProofStep[] = new Array<MmpProofStep>(assertionEHypsNum);
		const eHypsDerivationResult: IEHypsDerivationResult = {
			isSuccessful: undefined,
			eHypsMmpProofSteps: emptyArray
		};
		return eHypsDerivationResult;
	}

	//#region searchEHyps

	//#region searchEHypsRecursive

	//#region searchCurrentEHypWithAdditionalVarsToBeUnified

	//#region isEHypUnifiableWithCurrentProofStep
	private isEHypUnifiableWithCurrentProofStep(currentEHyp: EHyp, eHypProofStepCandidate: MmpProofStep): boolean {
		const substitutionFound: boolean =
			this.uSubstitutionBuilder.buildSubstitutionForSingleLine(currentEHyp.parseNode, eHypProofStepCandidate.formula,
				eHypProofStepCandidate.parseNode, this.substitution);
		return substitutionFound;
	}
	//#endregion isEHypUnifiableWithCurrentProofStep

	removeSubstitutionForCurrentEHypIndex(currentEHypIndexForStepDerivation: number) {
		const eHypOrderForStepDerivation: IEHypOrderForStepDerivation =
			this.assertion.eHypsOrderForStepDerivation![currentEHypIndexForStepDerivation];
		eHypOrderForStepDerivation.additionalVariablesToBeUnified.forEach((logicalVariable: string) => {
			this.substitution.delete(logicalVariable);
		});
	}
	tryEHypProofStepCandidate(currentEHypIndexForStepDerivation: number, currentEHypRealIndex: number,
		currentEHyp: EHyp, eHypProofStepCandidate: MmpProofStep) {
		const isUnifiable: boolean = this.isEHypUnifiableWithCurrentProofStep(currentEHyp, eHypProofStepCandidate);
		if (isUnifiable) {
			if (currentEHypIndexForStepDerivation >= this.assertion.frame!.eHyps.length - 1)
				// there is no more EHyp to unify
				this.eHypsDerivationResult.isSuccessful = true;
			else
				this.searchEHypsRecursive(currentEHypIndexForStepDerivation + 1);
		}
		if (this.eHypsDerivationResult.isSuccessful)
			this.eHypsDerivationResult.eHypsMmpProofSteps[currentEHypRealIndex] = eHypProofStepCandidate;
		else
			this.removeSubstitutionForCurrentEHypIndex(currentEHypIndexForStepDerivation);
	}

	/** this method is invoked when the current EHyp requires additional logical
	 * vars to be unified; in this case, the formula for the EHyp is not completely
	 * determined, thus we need to cycle through all previous MmpProofStep's to
	 * see if one unifies (using the additional logical variables)
	 */
	private searchCurrentEHypWithAdditionalVarsToBeUnified(currentEHypIndexForStepDerivation: number,
		currentEHypRealIndex: number, currentEHyp: EHyp) {
		let i = 0;
		while (!this.eHypsDerivationResult.isSuccessful && i < this.mmpProofStepIndex) {
			// a previous MmpProofStep that can be unified with the current EHyp
			// has not been found yet
			const eHypProofStepCandidate: IMmpStatement = this.uProof.uStatements[i];
			if (eHypProofStepCandidate instanceof MmpProofStep)
				this.tryEHypProofStepCandidate(currentEHypIndexForStepDerivation, currentEHypRealIndex,
					currentEHyp, eHypProofStepCandidate);
			i++;
		}
	}
	//#endregion searchCurrentEHypWithAdditionalVarsToBeUnified

	//#region searchCurrentEHypWithoutAdditionalVarsToBeUnified
	buildFormulaForCurrentEHypProofStep(currentEHyp: EHyp): string {
		const parseNode: InternalNode =
			MmpSubstitutionApplier.createParseNodeForInternalNode(currentEHyp.parseNode, this.substitution, this.outermostBlock);
		const formula: string = parseNode.stringFormula;
		return formula;
	}
	/** invoked when the current EHypStep does not require additional logical
	 * variables to be unified; the expected formula is completely determined, thus
	 * a single trial in a look up table is enough
	*/
	private searchCurrentEHypWithoutAdditionalVarsToBeUnified(currentEHypIndexForStepDerivation: number,
		currentEHypRealIndex: number, currentEHyp: EHyp) {
		const formulaForCurrentEHypProofStep: string = this.buildFormulaForCurrentEHypProofStep(currentEHyp);
		const eHypProofStepIndex: number | undefined = this.uProof.formulaToProofStepMap.get(formulaForCurrentEHypProofStep);
		if (eHypProofStepIndex != undefined && eHypProofStepIndex < this.mmpProofStepIndex) {
			// a previous MmpProof step has been found that unifies with the current EHyp
			const eHypProofStep: MmpProofStep = <MmpProofStep>this.uProof.uStatements[eHypProofStepIndex];
			this.eHypsDerivationResult.eHypsMmpProofSteps[currentEHypRealIndex] = eHypProofStep;
			if (currentEHypIndexForStepDerivation >= this.assertion.frame!.eHyps.length - 1)
				// there is no more EHyp to unify
				this.eHypsDerivationResult.isSuccessful = true;
			else
				this.searchEHypsRecursive(currentEHypIndexForStepDerivation + 1);
		} else
			// no previous MmpProof step has been found that unifies with the current EHyp
			this.eHypsDerivationResult.isSuccessful = false;
	}
	//#endregion searchCurrentEHypWithoutAdditionalVarsToBeUnified


	searchEHypsRecursive(currentEHypIndexForStepDerivation: number) {
		const currentEHypRealIndex: number =
			this.assertion.eHypsOrderForStepDerivation![currentEHypIndexForStepDerivation].eHypIndex;
		const currentEHyp: EHyp = this.assertion.frame!.eHyps[currentEHypRealIndex];
		if (this.assertion.eHypsOrderForStepDerivation![currentEHypIndexForStepDerivation]
			.additionalVariablesToBeUnified.size > 0)
			// current EHyp requires some additional logical variable to be unified
			this.searchCurrentEHypWithAdditionalVarsToBeUnified(currentEHypIndexForStepDerivation,
				currentEHypRealIndex, currentEHyp);
		else
			// current EHyp is completeley determined by previous substitutions
			this.searchCurrentEHypWithoutAdditionalVarsToBeUnified(currentEHypIndexForStepDerivation,
				currentEHypRealIndex, currentEHyp);
	}
	//#endregion searchEHypsRecursive


	/** tries all permutations of previous mmp proof steps, to see if one can be unified with the given
	 * assertion
	 */
	searchEHyps(): IEHypsDerivationResult {
		if (this.assertion.frame!.eHyps.length == 0)
			// the logical assertion has no EHyp
			this.eHypsDerivationResult = {
				isSuccessful: true,
				eHypsMmpProofSteps: []
			};
		else if (this.assertion.eHypsOrderForStepDerivation != undefined)
			// // the logical assertion has at least one EHyp, and 
			this.searchEHypsRecursive(0);
		return this.eHypsDerivationResult!;
	}
	//#endregion searchEHyps
}