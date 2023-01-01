import { Grammar } from 'nearley';
import { Diagnostic, TextEdit } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
// import { MmpStatement } from './MmpStatements';
import { InternalNode } from '../grammar/ParseNode';

import { AssertionStatement } from "../mm/AssertionStatement";
import { MmpProof } from './UProof';
import { IUStatement, TextForProofStatement } from "./UStatement";
import { USubstitutionApplier } from './USubstitutionApplier';
import { USubstitutionBuilder, SubstitutionResult } from './USubstitutionBuilder';
import { WorkingVarsUnifierApplier } from './WorkingVarsUUnifierApplier';
import { WorkingVars } from './WorkingVars';
import { OrderedPairOfNodes, WorkingVarsUnifierFinder } from './WorkingVarsUnifierFinder';
import { WorkingVarsUnifierInitializer } from './WorkingVarsUnifierInitializer';
import { DisjointVarsManager } from '../mm/DisjointVarsManager';
import { MmpProofStep } from "./MmpProofStep";
import { StepDerivation } from '../stepDerivation/StepDerivation';
import { MmpParser } from './MmpParser';

// Parser for .mmp files
export class UProofTransformer {
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

	//#region transformUStep
	private deriveStepLabelIfMissing(uStepIndex: number, mmpProofStep: MmpProofStep) {
		// if (mmpProofStep.stepLabel == undefined && this.outermostBlock.mmParser != undefined
		// 	&& this.outermostBlock.mmParser.areAllParseNodesComplete) {
		if (mmpProofStep.stepLabel == undefined && this.outermostBlock.mmParser != undefined) {
			const stepDerivation: StepDerivation = new StepDerivation(this.mmpParser, uStepIndex, mmpProofStep,
				this.maxNumberOfHypothesisDispositionsForStepDerivation);
			stepDerivation.deriveLabelAndHypothesis();
		}
	}
	/**
	 * adds one step to the new proof and returns the index of the next step to be transformed
	 * (this is needed because new proof steps could have been added)
	 * @param uStepIndex 
	 * @param newProof 
	 */
	protected transformUStep(uStepIndex: number): number {
		// protected transformUStep(uProofStep: UProofStep, newProof: UProof) {
		let nextUStepIndexToBeTransformed = uStepIndex + 1;
		const uProofStep: MmpProofStep = <MmpProofStep>this.uProof.uStatements[uStepIndex];
		// const assertion: AssertionStatement | undefined = uProofStep.getAssertion(this.labelToStatementMap);
		if (!uProofStep.skipUnification) {
			this.deriveStepLabelIfMissing(uStepIndex, uProofStep);
			const assertion: AssertionStatement | undefined = uProofStep.assertion;
			if (assertion instanceof AssertionStatement) {
				const uSubstitutionBuilder: USubstitutionBuilder = new USubstitutionBuilder(uProofStep,
					assertion, this.outermostBlock, this.workingVars, this.grammar, []);
				const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
				// const substitutionResult: SubstitutionResult =
				// 	USubstitutionManager.buildSubstitution(uProofStep,
				// 		assertion, this.outermostBlock, this.workingVars, this.grammar);
				if (substitutionResult.hasBeenFound) {
					// nextUStepIndexToBeTransformed = USubstitutionManager.applySubstitution(
					// 	<Map<string, InternalNode>>substitutionResult.substitution, uStepIndex,
					// 	assertion, this.outermostBlock, this.workingVars, this.grammar, newProof) + 1;
					uProofStep.substitution = substitutionResult.substitution!;
					this.setIsProvenIfTheCase(uProofStep, assertion.frame!.eHyps.length);
					if (uProofStep.stepRef == "")
						uProofStep.stepRef = this.uProof.getNewRef();
					const uSubstitutionApplier: USubstitutionApplier = new USubstitutionApplier(
						<Map<string, InternalNode>>substitutionResult.substitution, uStepIndex,
						this.uProof, assertion, this.outermostBlock, this.workingVars, this.grammar);
					nextUStepIndexToBeTransformed = uSubstitutionApplier.applySubstitution() + 1;
					this.addStartingPairsForMGUFinder(uProofStep, assertion,
						<Map<string, InternalNode>>substitutionResult.substitution);
				}
			}
		}
		return nextUStepIndexToBeTransformed;
	}
	//#endregion transformUStep

	protected transformUSteps() {
		let i = 0;
		while (i < this.uProof.uStatements.length) {
			const currentMmpStatement: IUStatement = this.uProof.uStatements[i];
			if (currentMmpStatement instanceof MmpProofStep && !currentMmpStatement.isEHyp) {
				// this.addUStep(uStatement, uProof.refToUStatementMap, newProof);
				i = this.transformUStep(i);
			} else {
				if (currentMmpStatement instanceof TextForProofStatement)
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
			new WorkingVarsUnifierFinder(this._orderedPairsOfNodesForMGUalgorithm);
		const unifier: Map<string, InternalNode> | undefined = workingVarsUnifierFinder.findMostGeneralUnifier();
		if (unifier !== undefined) {
			const uUnifierApplier: WorkingVarsUnifierApplier = new WorkingVarsUnifierApplier(unifier, this.uProof);
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