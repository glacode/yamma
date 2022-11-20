import { Grammar } from 'nearley';
import { BlockStatement } from '../mm/BlockStatement';
import { AssertionStatement, LabeledStatement } from '../mm/Statements';
import { MmpProofStep } from '../mmp/MmpProofStep';
import { UProof } from '../mmp/UProof';
import { WorkingVars } from '../mmp/WorkingVars';

export interface IEHypsDerivationResult {
	isSuccessful: boolean | undefined;
	eHypsMmpProofSteps: MmpProofStep[] | undefined;
}

export class EHypsDerivation {
	uProof: UProof;
	mmpProofStepIndex: number;
	mmpProofStep: MmpProofStep;
	assertion: AssertionStatement;
	labelToStatementMap: Map<string, LabeledStatement>;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;

	constructor(uProof: UProof, mmpProofStepIndex: number, mmpProofStep: MmpProofStep, assertion: AssertionStatement,
		labelToStatementMap: Map<string, LabeledStatement>,
		outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars,
		maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		this.uProof = uProof;
		this.mmpProofStepIndex = mmpProofStepIndex;
		this.mmpProofStep = mmpProofStep;
		this.assertion = assertion;
		this.labelToStatementMap = labelToStatementMap;
		this.outermostBlock = outermostBlock;
		this.grammar = grammar;
		this.workingVars = workingVars;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;
	}

	/** tries all permutations of previous mmp proof steps, to see if one can be unified with the  */
	searchEHyps(): IEHypsDerivationResult {
		throw new Error('Method not implemented.');
	}
}