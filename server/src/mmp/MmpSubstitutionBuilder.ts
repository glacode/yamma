import { Grammar } from 'nearley';
import { Diagnostic } from 'vscode-languageserver/node';
import { BlockStatement } from '../mm/BlockStatement';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmToken } from '../grammar/MmLexer';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { AssertionStatement } from "../mm/AssertionStatement";
import { WorkingVars } from './WorkingVars';
import { MmpProofStep } from "./MmpProofStep";
import { EHyp } from '../mm/EHyp';
import { WorkingVarsUnifierInitializer } from './WorkingVarsUnifierInitializer';
import { OrderedPairOfNodes, WorkingVarsUnifierFinder, UnificationAlgorithmState } from './WorkingVarsUnifierFinder';
import { MmpValidator } from './MmpValidator';
import { MmpParserErrorCode } from './MmpParser';


export interface SubstitutionResult {
	hasBeenFound: boolean,
	substitution: Map<string, InternalNode> | undefined
}

export class MmpSubstitutionBuilder {
	uProofStep: MmpProofStep;
	assertion: AssertionStatement;
	outermostBlock: BlockStatement;
	workingVars: WorkingVars;
	grammar: Grammar;
	// this is useful when USubstitutionBuilder is invoked by the MmpParser,
	// this is not used by the UProofTransformer
	diagnostics: Diagnostic[];

	private logicalSystemEHyps: EHyp[];
	private eHypUSteps: (MmpProofStep | undefined)[];

	/** when this is true, a working var cannot be a substitution of a "complex" formula,
	 * it must correspond to a logical variable;
	 * for instance, if the parse node for the formula ( ph - ps ) had to match with $W1,
	 * the SubstitutionBuilder should fail;
	 * instead, when this.requireWorkingVarsToBeASubstitutionOfALogicalVar is false
	 * the Substitution wil not fail if ( ph - ps ) had to match with $W1 (maybe the
	 * m.g.u. algoritm will fail, later on);
	 * the strongest requirement is used by the step derivation process
	*/
	requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar: boolean;

	constructor(uProofStep: MmpProofStep, assertion: AssertionStatement, outermostBlock: BlockStatement,
		workingVars: WorkingVars, grammar: Grammar, diagnostics: Diagnostic[],
		requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar?: boolean) {
		this.uProofStep = uProofStep;
		this.assertion = assertion;
		this.outermostBlock = outermostBlock;
		this.workingVars = workingVars;
		this.grammar = grammar;
		this.diagnostics = diagnostics;

		this.logicalSystemEHyps = <EHyp[]>(this.assertion.frame?.eHyps);
		this.eHypUSteps = this.uProofStep.eHypUSteps;

		if (requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar != undefined)
			this.requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar = requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar;
		else
			this.requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar = false;
	}
	//#region buildSubstitution

	//#region buildSubstitutionForBothInternalNode

	//#region buildSubstitutionForSingleFormula
	isSameKind(logicalSystemVariable: string, uStepParseNode: ParseNode): boolean {
		let isSameKind;
		const variableKind: string = <string>this.outermostBlock.varToKindMap.get(logicalSystemVariable);
		if (uStepParseNode instanceof MmToken) {
			const uStepVariableKind = this.outermostBlock.varToKindMap.get(uStepParseNode.value);
			isSameKind = (variableKind == uStepVariableKind);
		} else
			// uStepParseNode is an InternalNode
			isSameKind = (variableKind == uStepParseNode.kind);
		return isSameKind;
	}
	addSubstitutionOrCheckCoherence(logicalSystemVariable: string, uStepParseNode: InternalNode,
		substitution: Map<string, InternalNode>): boolean {
		const currentSubstitution: ParseNode | undefined = substitution.get(logicalSystemVariable);
		const isInternalParseNodeForWorkingVar: boolean = (currentSubstitution instanceof InternalNode &&
			GrammarManager.isInternalParseNodeForWorkingVar(currentSubstitution));
		if (isInternalParseNodeForWorkingVar)
			// if we added a substitution with a working var, here we remove it and add the (maybe) more
			// specific substitution
			substitution.delete(logicalSystemVariable);
		let isCoherentSubstitution: boolean;
		if (currentSubstitution === undefined || isInternalParseNodeForWorkingVar) {
			isCoherentSubstitution = true;
			substitution.set(logicalSystemVariable, uStepParseNode);
		} else
			isCoherentSubstitution = GrammarManager.areParseNodesCoherent(currentSubstitution, uStepParseNode);
		return isCoherentSubstitution;
	}
	buildSubstitutionForLeafNodeWithInternalNode(logicalSystemFormulaToken: MmToken, uStepParseNode: InternalNode,
		substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution = false;
		if (this.outermostBlock.v.has(logicalSystemFormulaToken.value)) {
			// logicalSystemFormulaToken.value is a variable
			if (this.isSameKind(logicalSystemFormulaToken.value, uStepParseNode))
				// const substituteWith: string[] = GrammarManager.buildStringArray(proofStepFormulaNode);
				hasFoundSubstitution = this.addSubstitutionOrCheckCoherence(
					logicalSystemFormulaToken.value, uStepParseNode, substitution);
			else
				hasFoundSubstitution = false;
		} else
			// logicalSystemFormulaToken.value is a constant
			hasFoundSubstitution = (uStepParseNode.parseNodes.length == 1 &&
				uStepParseNode.parseNodes[0] instanceof MmToken &&
				logicalSystemFormulaToken.value == uStepParseNode.parseNodes[0].value);
		return hasFoundSubstitution;
	}

	buildSubstitutionForLeafNode(logicalSystemFormulaToken: MmToken, uStepParseNode: ParseNode,
		substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution: boolean;
		if (uStepParseNode instanceof InternalNode)
			hasFoundSubstitution = this.buildSubstitutionForLeafNodeWithInternalNode(
				logicalSystemFormulaToken, uStepParseNode, substitution);
		else
			hasFoundSubstitution = (uStepParseNode instanceof MmToken) &&
				logicalSystemFormulaToken.value == uStepParseNode.value;
		return hasFoundSubstitution;
	}

	//#region buildSubstitutionForInternalNode

	private isInternalNodeForLogicalVariableNotAddedToSubstitutionYet(logicalSystemFormulaInternalNode: InternalNode,
		substitution: Map<string, InternalNode>): boolean {
		const result = logicalSystemFormulaInternalNode.parseNodes.length == 1 &&
			logicalSystemFormulaInternalNode.parseNodes[0] instanceof MmToken &&
			this.outermostBlock.v.has(logicalSystemFormulaInternalNode.parseNodes[0].value) &&
			substitution.get(logicalSystemFormulaInternalNode.parseNodes[0].value) == undefined;
		return result;
	}

	//#region buildSubstitutionForWorkingVarOfTheSameKind
	buildExactSubstitutionForWorkingVar(logicalSystemFormulaInternalNode: InternalNode,
		uStepInternalNode: InternalNode, substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution: boolean;
		if (GrammarManager.isInternalParseNodeForFHyp(logicalSystemFormulaInternalNode, this.outermostBlock.v)) {
			// uStepInternalNode is a working var, logicalSystemFormulaInternalNode is a
			// node for a logical variable that is already PRESENT in the substitution, and
			// we've required that working vars do exact match with substitutions
			const logicalVar: string = GrammarManager.getTokenValueFromInternalNode(logicalSystemFormulaInternalNode);
			const logicalVarSubstitution: InternalNode = substitution.get(logicalVar)!;
			hasFoundSubstitution = GrammarManager.areParseNodesEqual(logicalVarSubstitution, uStepInternalNode);
		}
		else
			// uStepParseNode is a working var, we've required that working vars do exact match with substitutions,
			// but logicalSystemFormulaInternalNode is not a node for a logical variable
			hasFoundSubstitution = false;
		return hasFoundSubstitution;
	}
	buildSubstitutionForWorkingVarOfTheSameKind(logicalSystemFormulaInternalNode: InternalNode,
		uStepInternalNode: InternalNode, substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution = true;
		if (this.isInternalNodeForLogicalVariableNotAddedToSubstitutionYet(logicalSystemFormulaInternalNode,
			substitution))
			// logicalSystemFormulaInternalNode.parseNodes.length == 1 &&
			// logicalSystemFormulaInternalNode.parseNodes[0] instanceof MmToken &&
			// substitution.get(logicalSystemFormulaInternalNode.parseNodes[0].value) == undefined)
			// logicalSystemFormulaInternalNode is an internal node for a logical variable
			// and no substitution has been added, for this variable, yet
			substitution.set((<MmToken>logicalSystemFormulaInternalNode.parseNodes[0]).value, uStepInternalNode);
		else if (this.requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar)
			// we should be here from a StepDerivation request
			hasFoundSubstitution = this.buildExactSubstitutionForWorkingVar(logicalSystemFormulaInternalNode,
				uStepInternalNode, substitution);
		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForWorkingVarOfTheSameKind

	buildSubstitutionForChildren(logicalSystemParseNodes: ParseNode[],
		uStepParseNodes: ParseNode[], substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution = true;
		// logicalSystemFormulaInternalNode.parseNodes.length == proofStepFormulaInternalNode.parseNodes.length
		let i = 0;
		while (hasFoundSubstitution && (i < logicalSystemParseNodes.length)) {
			hasFoundSubstitution &&= this.buildSubstitutionForParseNode(
				logicalSystemParseNodes[i], uStepParseNodes[i], substitution);
			i++;
		}
		return hasFoundSubstitution;
	}

	buildSubstitutionForInternalNodesOfTheSameKindNoWorkingVar(logicalSystemFormulaInternalNode: InternalNode,
		uStepInternalNode: InternalNode, substitution: Map<string, InternalNode>): boolean {
		// this method is called when logicalSystemFormulaInternalNode and uStepInternalNode
		// are of the same kind and uStepInternalNode is NOT a working var
		let hasFoundSubstitution: boolean;
		if (logicalSystemFormulaInternalNode.parseNodes.length === 1 &&
			logicalSystemFormulaInternalNode.parseNodes[0] instanceof MmToken)
			hasFoundSubstitution = this.buildSubstitutionForLeafNodeWithInternalNode(
				logicalSystemFormulaInternalNode.parseNodes[0], uStepInternalNode, substitution);
		else
			// either logicalSystemFormulaInternalNode.parseNodes.length > 1 or
			// logicalSystemFormulaInternalNode.parseNodes[0] is an InternalNode
			if (logicalSystemFormulaInternalNode.parseNodes.length !=
				uStepInternalNode.parseNodes.length)
				//TODO1 add diagnostics for every hasFoundSubstitution = false case
				hasFoundSubstitution = false;
			else {
				hasFoundSubstitution = this.buildSubstitutionForChildren(logicalSystemFormulaInternalNode.parseNodes,
					uStepInternalNode.parseNodes, substitution);
			}
		return hasFoundSubstitution;
	}

	buildSubstitutionForBothInternalNode(logicalSystemFormulaInternalNode: InternalNode,
		uStepInternalNode: InternalNode, substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution: boolean;
		if (logicalSystemFormulaInternalNode.kind != uStepInternalNode.kind)
			hasFoundSubstitution = false;
		else if (GrammarManager.isInternalParseNodeForWorkingVar(uStepInternalNode))
			// if uStepParseNode is a working var, here we assume that a substitution for the
			// working var could be found by the m.g.u. algorithm, that will run later on,
			// thus we don't fail here; if no unification for the working var can be found,
			// the m.g.u. algorithm will fail later on
			hasFoundSubstitution = this.buildSubstitutionForWorkingVarOfTheSameKind(logicalSystemFormulaInternalNode,
				uStepInternalNode, substitution);
		else
			// logicalSystemFormulaInternalNode.kind == proofStepFormulaInternalNode.kind
			hasFoundSubstitution = this.buildSubstitutionForInternalNodesOfTheSameKindNoWorkingVar(
				logicalSystemFormulaInternalNode, uStepInternalNode, substitution);
		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForBothInternalNode

	buildSubstitutionForInternalNode(logicalSystemFormulaInternalNode: InternalNode,
		uStepParseNode: ParseNode, substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution: boolean;
		if (uStepParseNode instanceof MmToken)
			hasFoundSubstitution = false;
		else
			// uStepParseNode is an internal node
			hasFoundSubstitution = this.buildSubstitutionForBothInternalNode(logicalSystemFormulaInternalNode,
				uStepParseNode, substitution);
		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForInternalNode

	buildSubstitutionForParseNode(parseNodeForLogicalSystemFormula: ParseNode, uStepParseNode: ParseNode,
		substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution: boolean;
		if (parseNodeForLogicalSystemFormula instanceof MmToken) {
			hasFoundSubstitution = this.buildSubstitutionForLeafNode(parseNodeForLogicalSystemFormula,
				uStepParseNode, substitution);
		}
		else
			// parseNodeForLogicalSystemFormula is an InternalNode
			hasFoundSubstitution = this.buildSubstitutionForInternalNode(
				<InternalNode>parseNodeForLogicalSystemFormula, uStepParseNode, substitution);
		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForSingleFormula

	buildSubstitutionForSingleLine(logicalSystemFormulaInternalNode: InternalNode, uStepFormula: MmToken[] | undefined,
		uStepParseNode: InternalNode | undefined, substitution: Map<string, InternalNode>): boolean {
		let foundSubstitution = true;  // it will not be assigned later, if uStepFormula is undefined
		if (uStepFormula != undefined && uStepParseNode == undefined)
			// the current formula was not parsable
			foundSubstitution = false;
		else if (uStepParseNode != undefined)
			// the current formula was parsable
			foundSubstitution = this.buildSubstitutionForInternalNode(logicalSystemFormulaInternalNode, uStepParseNode,
				substitution);
		return foundSubstitution;
	}


	// it is assumed to be eHypUSteps.length  <= logicalSystemEHyps.length and the missing
	// refs are assumed to be at the end
	addSubstitutionForEHypsMoreOrEqual(substitution: Map<string, InternalNode>): any {
		let hasFoundSubstitution = true;
		let i = 0;
		while (hasFoundSubstitution && i < this.logicalSystemEHyps.length) {
			if (i < this.eHypUSteps.length && this.eHypUSteps[i] !== undefined)
				// eHypUSteps[i] is an actual step
				hasFoundSubstitution = this.buildSubstitutionForSingleLine(
					this.logicalSystemEHyps[i].parseNode!, this.eHypUSteps[i]!.stepFormula, this.eHypUSteps[i]!.parseNode,
					substitution);
			i++;
		}
		return hasFoundSubstitution;
	}

	// if logicalSystemEHyps.length < eHypUSteps.length no substitution can be found.
	// if eHypUSteps.length  <= logicalSystemEHyps.length, the missing
	// refs are assumed to be at the end
	buildSubstitutionForEHyps(substitution: Map<string, InternalNode>): boolean {
		// const logicalSystemEHyps: EHyp[] = <EHyp[]>(this.assertion.frame?.eHyps);
		let hasFoundSubstitution;
		if (this.logicalSystemEHyps.length < this.eHypUSteps.length)
			hasFoundSubstitution = false;
		else
			hasFoundSubstitution = this.addSubstitutionForEHypsMoreOrEqual(substitution);
		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForEHyps

	//#region tryToUnifyWorkingVars
	//#region addDiagnosticsForWorkingVarsIfTheCase
	addDiagnosticsForWorkingVar(strWorkingVar: string, parseNode: ParseNode, message: string) {
		if (parseNode instanceof MmToken && parseNode.value == strWorkingVar)
			// current ParseNode is an instance of the working var token
			MmpValidator.addDiagnosticError(message, parseNode.range,
				MmpParserErrorCode.workingVarUnificationError, this.diagnostics);
		else if (parseNode instanceof InternalNode)
			parseNode.parseNodes.forEach((childNode: ParseNode) => {
				this.addDiagnosticsForWorkingVar(strWorkingVar, childNode, message);
			});
	}
	private addDiagnosticsForWorkingVarsIfTheCase(workingVarsUnifierFinder: WorkingVarsUnifierFinder) {
		if (workingVarsUnifierFinder.currentState == UnificationAlgorithmState.occourCheckFailure) {
			const occourCheckOrderedPair: OrderedPairOfNodes =
				workingVarsUnifierFinder.occourCheckOrderedPair!;
			const parseNode1: ParseNode = workingVarsUnifierFinder.occourCheckOrderedPair!.parseNode1;
			const parseNode2: ParseNode = workingVarsUnifierFinder.occourCheckOrderedPair!.parseNode2;
			const message = WorkingVarsUnifierFinder.buildErrorMessageForOccourCheckOrderedPair(
				occourCheckOrderedPair);
			MmpValidator.addDiagnosticError(message, this.uProofStep.stepLabelToken!.range,
				MmpParserErrorCode.unificationError, this.diagnostics);
			const strWorkingVar: string = GrammarManager.getTokenValueFromInternalNode(
				occourCheckOrderedPair.parseNode1);
			this.addDiagnosticsForWorkingVar(strWorkingVar, parseNode1, message);
			this.addDiagnosticsForWorkingVar(strWorkingVar, parseNode2, message);
		}
	}
	//#endregion addDiagnosticsForWorkingVarsIfTheCase
	private tryToUnifyWorkingVars(substitution: Map<string, InternalNode>): boolean {
		const workingVarsUnifierInitializer: WorkingVarsUnifierInitializer =
			new WorkingVarsUnifierInitializer(this.uProofStep, this.assertion, substitution, this.outermostBlock,
				this.grammar);
		const startingPairsForMGUAlgorthm: OrderedPairOfNodes[] =
			workingVarsUnifierInitializer.buildStartingPairsForMGUAlgorithm();
		const workingVarsUnifierFinder: WorkingVarsUnifierFinder =
			new WorkingVarsUnifierFinder(startingPairsForMGUAlgorthm);
		workingVarsUnifierFinder.findMostGeneralUnifier();
		const result: boolean = workingVarsUnifierFinder.currentState == UnificationAlgorithmState.complete;
		this.addDiagnosticsForWorkingVarsIfTheCase(workingVarsUnifierFinder);
		return result;
	}
	//#endregion tryToUnifyWorkingVars

	buildSubstitutionForExistingParseNodes(): SubstitutionResult {
		const substitution: Map<string, InternalNode> = new Map<string, InternalNode>();
		let hasBeenFound = this.buildSubstitutionForEHyps(substitution);
		if (hasBeenFound && this.assertion.parseNode)
			hasBeenFound = this.buildSubstitutionForSingleLine(this.assertion.parseNode,
				this.uProofStep.stepFormula, this.uProofStep.parseNode, substitution);
		return { hasBeenFound: hasBeenFound, substitution: substitution };
	}


	//#region addWorkingVarsForVarsWithoutASubstitution

	//#region addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode

	addWorkingVarsForLogicalVarsWithoutASubstitutionForUndefinedInternalNode(logicalSystemFormulaInternalNode: InternalNode,
		substitution: Map<string, InternalNode>) {
		if (this.isInternalNodeForLogicalVariableNotAddedToSubstitutionYet(logicalSystemFormulaInternalNode,
			substitution)) {
			const variable: string = GrammarManager.getTokenValueFromInternalNode(logicalSystemFormulaInternalNode);
			const kind: string = logicalSystemFormulaInternalNode.kind;
			const newWorkingVar: string = <string>this.workingVars.getNewWorkingVar(kind);
			const tokenType: string = this.workingVars.tokenTypeFromKind(kind);
			const parseNode: InternalNode = GrammarManager.createInternalNodeForWorkingVar(newWorkingVar,
				kind, tokenType);
			substitution.set(variable, parseNode);
		}
		logicalSystemFormulaInternalNode.parseNodes.forEach((parseNode: ParseNode) => {
			this.addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(parseNode, substitution);
		});
	}
	addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(parseNodeForLogicalSystemFormula: ParseNode | undefined,
		substitution: Map<string, InternalNode>) {
		// if (parseNodeForLogicalSystemFormula instanceof MmToken)
		// 	this.addWorkingVarsForLogicalVarsWithoutASubstitutionFor(
		// 		<MmToken>parseNodeForLogicalSystemFormula, substitution);
		// else
		if (parseNodeForLogicalSystemFormula instanceof InternalNode)
			// parseNodeForLogicalSystemFormula is an InternalNode
			this.addWorkingVarsForLogicalVarsWithoutASubstitutionForUndefinedInternalNode(
				<InternalNode>parseNodeForLogicalSystemFormula, substitution);
	}
	//#endregion addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode

	addWorkingVarsForLogicalVarsWithoutASubstitution(substitution: Map<string, InternalNode>) {
		for (let i = 0; i < this.logicalSystemEHyps.length; i++) {
			const eHyp: EHyp = this.logicalSystemEHyps[i];
			// if (this.eHypUSteps[i]?.parseNode == undefined)
			this.addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(eHyp.parseNode, substitution);
		}
		//ogni caso: ogni logical var che non è assegnata, la assegni a una nuova Working Var
		// if (this.uProofStep.parseNode === undefined)
		this.addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(this.assertion.parseNode, substitution);
	}
	//#endregion addWorkingVarsForVarsWithoutASubstitution

	/**
	 * tries to find substitution for the uProofStep given in the constructor. If the uProofStep can be unified
	 * with the given logical assertion, a substitution is returned and it is complete (all logical vars
	 * have a substitution; some logical vars may be substituted with a Working Var)
	 * @returns 
	 */
	buildSubstitution(): SubstitutionResult {
		// const substitution: Map<string, InternalNode> = new Map<string, InternalNode>();
		// const frameEHyps: EHyp[] = <EHyp[]>assertion.frame?.eHyps;
		const substitutionResult: SubstitutionResult = this.buildSubstitutionForExistingParseNodes();
		if (substitutionResult.hasBeenFound) {
			this.addWorkingVarsForLogicalVarsWithoutASubstitution(<Map<string, InternalNode>>substitutionResult.substitution);
			if (!this.requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar)
				// this is NOT invoked by a derivation (WorkingVars Unification should be tried)
				substitutionResult.hasBeenFound =
					this.tryToUnifyWorkingVars(<Map<string, InternalNode>>substitutionResult.substitution);
		}
		return substitutionResult;
	}

	//#endregion buildSubstitution


	//#region buildACompleteSubstitutionEvenIfNonUnifiable
	buildCompleteSubstitutionForExistingParseNodes(substitution: Map<string, InternalNode>,
		nonUnifiableLogicalParseNodes: InternalNode[]): Map<string, InternalNode> {

		for (let i = 0; i < this.logicalSystemEHyps.length; i++) {
			if (this.eHypUSteps[i] !== undefined &&
				this.eHypUSteps[i]!.parseNode != undefined) {
				const hasFoundSubstitution: boolean = this.buildSubstitutionForInternalNode(
					this.logicalSystemEHyps[i].parseNode!, this.eHypUSteps[i]!.parseNode!,
					substitution);
				if (!hasFoundSubstitution)
					nonUnifiableLogicalParseNodes.push(this.logicalSystemEHyps[i].parseNode!);
			}
		}
		if (this.uProofStep.parseNode != undefined && this.assertion.parseNode) {
			const hasFoundSubstitution: boolean = this.buildSubstitutionForInternalNode(
				this.assertion.parseNode, this.uProofStep.parseNode, substitution);
			if (!hasFoundSubstitution)
				nonUnifiableLogicalParseNodes.push(this.assertion.parseNode);
		}
		return substitution;
	}
	addWorkingVarsForLogicalVarsWithoutASubstitutionUsingNonUnifiableSteps(
		substitution: Map<string, InternalNode>, nonUnifiableLogicalParseNodes: InternalNode[]) {
		for (let i = 0; i < this.logicalSystemEHyps.length; i++) {
			const eHyp: EHyp = this.logicalSystemEHyps[i];
			if (this.eHypUSteps[i]?.parseNode == undefined && eHyp.parseNode)
				this.addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(eHyp.parseNode, substitution);
		}
		if (this.uProofStep.parseNode === undefined && this.assertion.parseNode)
			this.addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(this.assertion.parseNode, substitution);
		nonUnifiableLogicalParseNodes.forEach((nonUnifiableLogicalParseNode: InternalNode) => {
			this.addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(nonUnifiableLogicalParseNode, substitution);
		});
	}
	/**
	 * returns a substitution for the uProofStep given in the constructor. It will return a substitution
	 * even if the uProofStep cannot be unified. The substitution returned is complete (all logical vars
	 * have a substitution; some logical vars may be substituted with a Working Var).
	 * This method can be invoked the best possible Diagnostic, when a unification error is encountered.
	 */
	buildACompleteSubstitutionEvenIfNonUnifiable(): Map<string, InternalNode> {
		// if (this.logicalSystemEHyps.length != this.eHypUSteps.length)
		// 	throw new Error("This method should only be invoked by the MmpParser, to add Diagnostics, when " +
		// 		"the number of hyps match");
		const substitution: Map<string, InternalNode> = new Map<string, InternalNode>();
		const nonUnifiableLogicalParseNodes: InternalNode[] = [];
		this.buildCompleteSubstitutionForExistingParseNodes(substitution, nonUnifiableLogicalParseNodes);
		this.addWorkingVarsForLogicalVarsWithoutASubstitutionUsingNonUnifiableSteps(
			substitution, nonUnifiableLogicalParseNodes);
		return substitution;
	}
	//#endregion buildACompleteSubstitutionEvenIfNonUnifiable
}