import { Grammar } from 'nearley';
import { Diagnostic, TextEdit } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
// import { MmpStatement } from './MmpStatements';
import { InternalNode } from '../grammar/ParseNode';

import { AssertionStatement } from "../mm/AssertionStatement";
import { MmpProof } from './MmpProof';
import { IMmpStatement, TextForProofStatement } from "./MmpStatement";
import { MmpSubstitutionApplier } from './MmpSubstitutionApplier';
import { MmpSubstitutionBuilder, SubstitutionResult } from './MmpSubstitutionBuilder';
import { WorkingVarsUnifierApplier } from './WorkingVarsUUnifierApplier';
import { WorkingVars } from './WorkingVars';
import { OrderedPairOfNodes, WorkingVarsUnifierFinder } from './WorkingVarsUnifierFinder';
import { WorkingVarsUnifierInitializer } from './WorkingVarsUnifierInitializer';
import { DisjointVarsManager } from '../mm/DisjointVarsManager';
import { MmpProofStep } from "./MmpProofStep";
import { StepDerivation } from '../stepDerivation/StepDerivation';
import { MmpParser } from './MmpParser';
import { MmpSearchStatement } from './MmpSearchStatement';
import { GrammarManager } from '../grammar/GrammarManager';
import { BuildNewLabelArgs, EHypLabelManager } from './EHypLabelManager';

// Parser for .mmp files
export class MmpProofTransformer {
	// textDocument: TextDocument
	mmpParser: MmpParser;
	uProof: MmpProof;
	labelToNonSyntaxAssertionMap: Map<string, AssertionStatement>;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	private maxNumberOfHypothesisDispositionsForStepDerivation: number;
	// the list of statements, after createMmpStatements() has been invoked
	// mmpStatements: MmpStatement[] = []
	// maps each proof step id to the proof step,  after createMmpStatements() has been invoked
	// refToProofStepMap: Map<string, MmpProofStep>;
	// the list of diagnostics, after createMmpStatements() has been invoked
	diagnostics: Diagnostic[] = []
	// the list of TextEdit, after createMmpStatements() has been invoked
	textEditArray: TextEdit[] = []

	// if a substitution for the logical vars is found, _orderedPairsOfNodes will contain the
	// working var substitution for the first round of the MGU finder, for the working vars 

	private _orderedPairsOfNodesForMGUalgorithm: OrderedPairOfNodes[];

	public get orderedPairOfNodes() {
		return this._orderedPairsOfNodesForMGUalgorithm;
	}

	//#region constructor
	// constructor(uProof: UProof, labelToNonSyntaxAssertionMap: Map<string, AssertionStatement>,
	// 	outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars,
	// 	maxNumberOfHypothesisDispositionsForStepDerivation: number) {
	constructor(mmpParser: MmpParser, maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		this.mmpParser = mmpParser;
		this.uProof = mmpParser.uProof!;
		this.labelToNonSyntaxAssertionMap = mmpParser.mmParser.labelToNonSyntaxAssertionMap;
		this.outermostBlock = mmpParser.outermostBlock;
		this.grammar = mmpParser.grammar;
		this.workingVars = mmpParser.workingVars;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;
		this._orderedPairsOfNodesForMGUalgorithm = [];
	}

	//#region transformUProof

	//#region transformUSteps


	//#region addStartingPairsForMGUFinder

	//#region addStartingPairsForMGUFinderForParseNode

	// addStartingPairsForMGUFinderForParseNodeWithLogicalNodeSubstituted(uStepParseNode: ParseNode,
	// 	newNodeWithSubstitution: ParseNode) {
	// 	if (GrammarManager.isInternalParseNodeForWorkingVar(uStepParseNode)) {
	// 		// uStepParseNode is a ParseNode for a Working Var
	// 		// uStepParseNode AND logicalSystemFormulaParseNode are internal nodes; for the case uStepParseNode instanceof MmToken nothing has
	// 		// to be done, because when we get here a substitution for logical vars has been found and then leaf nodes match successfully
	// 		if (!GrammarManager.areParseNodesEqual(uStepParseNode, newNodeWithSubstitution)) {
	// 			const orderedPairOfNodes: OrderedPairOfNodes = {
	// 				parseNode1: <InternalNode>uStepParseNode,
	// 				parseNode2: <InternalNode>newNodeWithSubstitution
	// 			};
	// 			this._orderedPairsOfNodesForMGUalgorithm.push(orderedPairOfNodes);
	// 		}
	// 	} else if (uStepParseNode instanceof InternalNode)
	// 		// uStepParseNode AND logicalSystemFormulaParseNode are internal nodes;
	// 		// for the case uStepParseNode instanceof MmToken nothing has to be done, because when we get here a substitution
	// 		// for logical vars has been found and then leaf nodes match successfully
	// 		for (let i = 0; i < uStepParseNode.parseNodes.length; i++) {
	// 			if ((<InternalNode>newNodeWithSubstitution).parseNodes[i] == undefined) {
	// 				const a = 3;
	// 			}
	// 			this.addStartingPairsForMGUFinderForParseNodeWithLogicalNodeSubstituted(uStepParseNode.parseNodes[i],
	// 				(<InternalNode>newNodeWithSubstitution).parseNodes[i]);
	// 		}
	// }
	// addStartingPairsForMGUFinderForParseNode(uStepParseNode: ParseNode, logicalSystemFormulaParseNode: ParseNode,
	// 	substitution: Map<string, InternalNode>) {
	// 	const newNodeWithSubstitution = USubstitutionApplier.createParseNode(logicalSystemFormulaParseNode,
	// 		substitution, this.outermostBlock);
	// 	this.addStartingPairsForMGUFinderForParseNodeWithLogicalNodeSubstituted(uStepParseNode, newNodeWithSubstitution);
	// }
	// //#endregion addStartingPairsForMGUFinderForParseNode

	// addStartingPairsForMGUFinderForEHyps(eHypUSteps: UProofStep[], logicalSystemEHyps: EHyp[],
	// 	substitution: Map<string, InternalNode>) {
	// 	for (let i = 0; i < eHypUSteps.length; i++) {
	// 		const uStepEHyp: UProofStep = eHypUSteps[i];
	// 		const logicalSystemEHyp = logicalSystemEHyps[i];
	// 		if (uStepEHyp.parseNode != undefined)
	// 			this.addStartingPairsForMGUFinderForParseNode(<ParseNode>uStepEHyp.parseNode, logicalSystemEHyp!.parseNode(this.grammar), substitution);
	// 	}
	// }

	/**
	 * builds startingPairsForMGUFinder, that will be used to find the most general unifier
	 * for the working vars; when we get here, uProofStep has already been completed and substitution is complete
	 * @param substitution 
	 */
	addStartingPairsForMGUFinder(uProofStep: MmpProofStep, assertion: AssertionStatement,
		substitution: Map<string, InternalNode>) {
		// this.addStartingPairsForMGUFinderForEHyps(<UProofStep[]>uProofStep.eHypUSteps, assertion.frame!.eHyps, substitution);
		// if (uProofStep.parseNode != undefined)
		// 	this.addStartingPairsForMGUFinderForParseNode(uProofStep.parseNode, assertion.parseNode(this.grammar), substitution);

		const workingVarsUnifierInitializer: WorkingVarsUnifierInitializer =
			new WorkingVarsUnifierInitializer(uProofStep, assertion, substitution, this.outermostBlock,
				this.grammar);
		const startingPairsForMGUAlgorthm: OrderedPairOfNodes[] =
			workingVarsUnifierInitializer.buildStartingPairsForMGUAlgorithm();
		this._orderedPairsOfNodesForMGUalgorithm =
			this._orderedPairsOfNodesForMGUalgorithm.concat(...startingPairsForMGUAlgorthm);

	}
	//#endregion addStartingPairsForMGUFinder

	//#region setIsProvenIfTheCase
	foundDisjVarConstraintViolation(uProofStep: MmpProofStep): boolean {
		const disjointVarsManager: DisjointVarsManager =
			new DisjointVarsManager(uProofStep.assertion!, uProofStep.substitution!,
				this.outermostBlock, false);
		disjointVarsManager.checkDisjVarsConstraintsViolation();
		return disjointVarsManager.foundDisjVarsConstraintViolation;
	}
	missingDisjVarConstraints(uProofStep: MmpProofStep): boolean {
		const disjointVarsManager: DisjointVarsManager =
			new DisjointVarsManager(uProofStep.assertion!, uProofStep.substitution!,
				this.outermostBlock, false);
		disjointVarsManager.checkMissingDisjVarsConstraints(this.uProof);
		//TODO you should add this logic:
		//- if a dv constraints does not involve a mandatory var, don't consider it
		//- if at least one constraint involves a mandatory var, but the configuration
		//is for "GenerateDvConstraints", don't consider it
		//In other words, result should be true iff at least one constraint involves a mandatory var and
		//the configuration is Report
		const result = disjointVarsManager.missingDisjVarConstraints!.map.size > 0;
		return result;
	}
	setIsProvenIfTheCase(uProofStep: MmpProofStep, numberOfLogicalEHyps: number) {
		let isProven = uProofStep.parseNode != undefined && uProofStep.eHypUSteps.length == numberOfLogicalEHyps;
		let i = 0;
		while (i < uProofStep.eHypUSteps.length && isProven) {
			isProven &&= uProofStep.eHypUSteps[i] != undefined && uProofStep.eHypUSteps[i]!.isProven;
			i++;
		}
		if (isProven) {
			const foundDisjVarConstraintViolation: boolean = this.foundDisjVarConstraintViolation(uProofStep);
			if (!foundDisjVarConstraintViolation) {
				const missingDisjVarConstraints: boolean = this.missingDisjVarConstraints(uProofStep);
				if (!missingDisjVarConstraints)
					uProofStep.setIsProven();
			}
		}
	}
	//#endregion setIsProvenIfTheCase

	transformEHyp(currentMmpStatement: MmpProofStep, currentIndexInEHypLabel: number): number {
		let nextLabelIndexToBeAssigned: number = currentIndexInEHypLabel;
		if (this.uProof.theoremLabel != undefined) {
			const buildNewLabelArgs: BuildNewLabelArgs = {
				theoremLabel: this.uProof.theoremLabel.value,
				eHyp: currentMmpStatement,
				nextLabelIndexToBeAssigned: currentIndexInEHypLabel,
			};
			EHypLabelManager.buildNewLabelIfNeeded(buildNewLabelArgs);
			nextLabelIndexToBeAssigned = buildNewLabelArgs.nextLabelIndexToBeAssigned;
		}
		return nextLabelIndexToBeAssigned;
	}

	//#region transformUStep
	tryToDeriveEHypsOnly(uStepIndex: number, mmpProofStep: MmpProofStep) {
		if (mmpProofStep.assertion instanceof AssertionStatement
			&& !GrammarManager.isSyntaxAxiom2(mmpProofStep.assertion)) {
			const uSubstitutionBuilder: MmpSubstitutionBuilder = new MmpSubstitutionBuilder(
				mmpProofStep, mmpProofStep.assertion, this.outermostBlock, this.workingVars, this.grammar, [], true);
			const stepDerivation: StepDerivation = new StepDerivation(this.mmpParser, uStepIndex, mmpProofStep,
				this.maxNumberOfHypothesisDispositionsForStepDerivation);
			stepDerivation.tryEHypsDerivation(mmpProofStep.assertion, uSubstitutionBuilder,
				new Map<string, InternalNode>());
		}
	}
	deriveLabelAndHypotesisWithoutWorkingVars(uStepIndex: number, mmpProofStep: MmpProofStep) {
		const stepLabel: string | undefined = mmpProofStep.stepLabel;
		mmpProofStep.stepLabel = undefined;
		if (this.outermostBlock.mmParser != undefined) {
			const stepDerivation: StepDerivation = new StepDerivation(this.mmpParser, uStepIndex, mmpProofStep,
				this.maxNumberOfHypothesisDispositionsForStepDerivation);
			stepDerivation.deriveLabelAndHypothesis();
		}
		if (mmpProofStep.stepLabel == undefined)
			// the step derivation didn't find a label that completely justified the step
			mmpProofStep.stepLabel = stepLabel;
	}
	private deriveLabelAndHypotesis(uStepIndex: number, mmpProofStep: MmpProofStep) {
		if (mmpProofStep.hasWorkingVars && mmpProofStep.stepLabel != undefined)
			this.tryToDeriveEHypsOnly(uStepIndex, mmpProofStep);
		else
			this.deriveLabelAndHypotesisWithoutWorkingVars(uStepIndex, mmpProofStep);
	}
	//TODO1
	//#region tryToDeriveEhypsIfIncomplete
	/** eHyps derivation should be tried BEFORE a unification attempt,
	 * if the current step is parsable, and the ehyps are not complete */
	private isEHypsCompletionToBeTriedBeforUnification(mmpProofStep: MmpProofStep, length: number): boolean {
		const isToBeTried = mmpProofStep.parseNode != undefined &&
			(mmpProofStep.eHypUSteps.length != length || mmpProofStep.eHypUSteps.indexOf(undefined) != -1);
		return isToBeTried;
	}
	private tryEHypsDerivation(mmpStepIndex: number, mmpProofStep: MmpProofStep, assertion: AssertionStatement) {
		const stepDerivation: StepDerivation = new StepDerivation(this.mmpParser, mmpStepIndex, mmpProofStep,
			this.maxNumberOfHypothesisDispositionsForStepDerivation);
		stepDerivation.tryCurrentAssertion(assertion);
	}
	private tryToDeriveEhypsIfIncomplete(mmpStepIndex: number, mmpProofStep: MmpProofStep, assertion?: AssertionStatement) {
		if (assertion?.frame != undefined &&
			this.isEHypsCompletionToBeTriedBeforUnification(mmpProofStep, assertion.frame.eHyps.length)) {
			this.tryEHypsDerivation(mmpStepIndex, mmpProofStep, assertion);
		}
	}
	//#endregion tryToDeriveEhypsIfIncomplete

	//#region tranformProofStepWithValidAssertionLabel
	// private tryToDeriveADifferentStepLabel(uStepIndex: number, mmpProofStep: MmpProofStep) {
	// 	// this method is invoked only when uProofStep.stepLabel is defined
	// 	const stepLabel: string = mmpProofStep.stepLabel!;
	// 	mmpProofStep.stepLabel = undefined;
	// 	this.deriveStepLabel(uStepIndex, mmpProofStep);
	// 	if (mmpProofStep.stepLabel == undefined)
	// 		// the step derivation didn't find a label that completely justified the step
	// 		mmpProofStep.stepLabel = stepLabel;
	// }
	tranformProofStepWithValidAssertionLabel(uStepIndex: number, uProofStep: MmpProofStep,
		assertion: AssertionStatement): number {
		// if (assertion instanceof AssertionStatement && !GrammarManager.isSyntaxAxiom2(assertion)) {
		let nextUStepIndexToBeTransformed = uStepIndex + 1;
		const uSubstitutionBuilder: MmpSubstitutionBuilder = new MmpSubstitutionBuilder(uProofStep,
			assertion, this.outermostBlock, this.workingVars, this.grammar, []);
		const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
		if (substitutionResult.hasBeenFound) {
			uProofStep.substitution = substitutionResult.substitution!;
			this.setIsProvenIfTheCase(uProofStep, assertion.frame!.eHyps.length);
			if (uProofStep.stepRef == "")
				uProofStep.stepRef = this.uProof.getNewRef();
			const uSubstitutionApplier: MmpSubstitutionApplier = new MmpSubstitutionApplier(
				<Map<string, InternalNode>>substitutionResult.substitution, uStepIndex,
				this.uProof, assertion, this.outermostBlock, this.workingVars, this.grammar);
			nextUStepIndexToBeTransformed = uSubstitutionApplier.applySubstitution() + 1;
			this.addStartingPairsForMGUFinder(uProofStep, assertion,
				<Map<string, InternalNode>>substitutionResult.substitution);
		} else
			// no valid substitution has been found
			this.deriveLabelAndHypotesis(uStepIndex, uProofStep);
		//TODO1 add "else" to try to correct eHypsOrder
		return nextUStepIndexToBeTransformed;
	}
	//#endregion tranformProofStepWithValidAssertionLabel

	/**
	 * adds one step to the new proof and returns the index of the next step to be transformed
	 * (this is needed because new proof steps could have been added)
	 * @param uStepIndex 
	 * @param newProof 
	 */
	protected transformUStep(uStepIndex: number): number {
		let nextUStepIndexToBeTransformed = uStepIndex + 1;
		const uProofStep: MmpProofStep = <MmpProofStep>this.uProof.uStatements[uStepIndex];
		if (uProofStep.assertion == undefined)
			this.deriveLabelAndHypotesis(uStepIndex, uProofStep);
		this.tryToDeriveEhypsIfIncomplete(uStepIndex, uProofStep, uProofStep.assertion);
		if (!uProofStep.containsUnknownStepRef && uProofStep.assertion instanceof AssertionStatement
			&& !GrammarManager.isSyntaxAxiom2(uProofStep.assertion)) {
			// the proof step has a label for a valid assertion
			nextUStepIndexToBeTransformed = this.tranformProofStepWithValidAssertionLabel(
				uStepIndex, uProofStep, uProofStep.assertion);


			// }
		}
		return nextUStepIndexToBeTransformed;
	}
	//#endregion transformUStep

	protected transformUSteps() {
		let i = 0;
		let currentIndexInEHypLabel = 1;
		while (i < this.uProof.uStatements.length) {
			const currentMmpStatement: IMmpStatement = this.uProof.uStatements[i];
			if (currentMmpStatement instanceof MmpProofStep && currentMmpStatement.isEHyp) {
				currentIndexInEHypLabel = this.transformEHyp(currentMmpStatement, currentIndexInEHypLabel);
				i++;
			} else if (currentMmpStatement instanceof MmpProofStep) {
				// !currentMmpStatement.isEHyp
				i = this.transformUStep(i);
			} else {
				if (currentMmpStatement instanceof TextForProofStatement ||
					currentMmpStatement instanceof MmpSearchStatement)
					this.uProof.uStatements.splice(i, 1);
				else
					i++;
			}
		}
	}
	//#endregion transformUSteps

	protected unifyWorkingVars() {
		const workingVarsUnifierFinder: WorkingVarsUnifierFinder =
			// new WorkingVarsUnifierFinder(this.uProof, this.labelToStatementMap, this._orderedPairsOfNodesForMGUalgorithm);
			new WorkingVarsUnifierFinder(this._orderedPairsOfNodesForMGUalgorithm, new Set<string>());
		const unifier: Map<string, InternalNode> | undefined = workingVarsUnifierFinder.findMostGeneralUnifier();
		if (unifier !== undefined) {
			const uUnifierApplier: WorkingVarsUnifierApplier =
				new WorkingVarsUnifierApplier(unifier, this.uProof, this.mmpParser.formulaToParseNodeCache);
			uUnifierApplier.applyUnifier();
		}
	}

	transformUProof() {
		this.transformUSteps();
		this.unifyWorkingVars();
		// const newProof: UProof = new UProof(uProof.maxRefAlreadyAssigned + 1);

		// for (let i = 0; i < uProof.uStatements.length; i++) {
		// 	if (uProof.uStatements[i] instanceof UProofStep && !(<UProofStep>uProof.uStatements[i]).isEHyp) {
		// 		// this.addUStep(uStatement, uProof.refToUStatementMap, newProof);
		// 		this.transformUStep(i, uProof);
		// 	}
		// }
	}
	//#endregion transformUProof

}