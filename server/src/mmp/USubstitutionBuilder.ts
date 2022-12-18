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


export interface SubstitutionResult {
	hasBeenFound: boolean,
	substitution: Map<string, InternalNode> | undefined
}

export class USubstitutionBuilder {
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
	buildSubstitutionForLeafNode(logicalSystemFormulaToken: MmToken, uStepParseNode: InternalNode,
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
	//#region buildSubstitutionForInternalNode

	isAWorkingVarOfTheSameKind(logicalSystemFormulaInternalNode: InternalNode, uStepParseNode: InternalNode):
		boolean {
		const result = logicalSystemFormulaInternalNode.kind == uStepParseNode.kind &&
			GrammarManager.isInternalParseNodeForWorkingVar(uStepParseNode);
		// if (logicalSystemFormulaInternalNode.kind == uStepParseNode.kind &&
		// 	uStepParseNode.parseNodes.length === 1) {
		// 	const subNode: ParseNode = uStepParseNode.parseNodes[0];
		// 	result = subNode instanceof MmToken && this.workingVars.isWorkingVar(subNode.value);
		// }
		return result;
	}

	isInternalNodeForLogicalVariableNotAddedToSubstitutionYet(logicalSystemFormulaInternalNode: InternalNode,
		substitution: Map<string, InternalNode>): boolean {
		const result = logicalSystemFormulaInternalNode.parseNodes.length == 1 &&
			logicalSystemFormulaInternalNode.parseNodes[0] instanceof MmToken &&
			this.outermostBlock.v.has(logicalSystemFormulaInternalNode.parseNodes[0].value) &&
			substitution.get(logicalSystemFormulaInternalNode.parseNodes[0].value) == undefined;
		return result;
	}

	//TODO1 refactor this function (too nested)
	buildSubstitutionForInternalNode(logicalSystemFormulaInternalNode: InternalNode,
		uStepParseNode: ParseNode, substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution: boolean;
		// if (!(uStepParseNode instanceof MmToken) && uStepParseNode.parseNodes.length )
		if (uStepParseNode instanceof MmToken)
			hasFoundSubstitution = false;
		else {
			// uStepParseNode is an internal node
			if (this.isAWorkingVarOfTheSameKind(logicalSystemFormulaInternalNode, <InternalNode>uStepParseNode)) {
				// if uStepParseNode is a working var, here we assume that a substitution for the
				// working var could be found by the m.g.u. algorithm, that will run later on,
				// thus we don't fail here; if no unification for the working var can be found,
				// the m.g.u. algorithm will fail later on
				hasFoundSubstitution = true;
				if (this.isInternalNodeForLogicalVariableNotAddedToSubstitutionYet(logicalSystemFormulaInternalNode,
					substitution)) {
					// logicalSystemFormulaInternalNode.parseNodes.length == 1 &&
					// logicalSystemFormulaInternalNode.parseNodes[0] instanceof MmToken &&
					// substitution.get(logicalSystemFormulaInternalNode.parseNodes[0].value) == undefined)
					// logicalSystemFormulaInternalNode is an internal node for a logical variable
					// and no substitution has been added, for this variable, yet
					substitution.set((<MmToken>logicalSystemFormulaInternalNode.parseNodes[0]).value, uStepParseNode);
				} else if (this.requireWorkingVarsToBeAnExactSubstitutionOfALogicalVar) {
					// uStepParseNode is a working vari,
					if (GrammarManager.isInternalParseNodeForFHyp(logicalSystemFormulaInternalNode, this.outermostBlock.v)) {
						// uStepParseNode is a working var, logicalSystemFormulaInternalNode is a
						// node for a logical variable that is already PRESENT in the substitution, and
						// we've required that working vars do exact match with substitutions
						const logicalVar: string = GrammarManager.getTokenValueFromInternalNode(logicalSystemFormulaInternalNode);
						const logicalVarSubstitution: InternalNode = substitution.get(logicalVar)!;
						hasFoundSubstitution = GrammarManager.areParseNodesEqual(logicalVarSubstitution, uStepParseNode);
					}
					else
						// uStepParseNode is a working var, we've required that working vars do exact match with substitutions,
						// but logicalSystemFormulaInternalNode is not a node for a logical variable
						hasFoundSubstitution = false;
				}
			}
			else {
				if (logicalSystemFormulaInternalNode.kind != uStepParseNode.kind)
					hasFoundSubstitution = false;
				else
					// logicalSystemFormulaInternalNode.kind == proofStepFormulaInternalNode.kind
					if (logicalSystemFormulaInternalNode.parseNodes.length === 1 &&
						logicalSystemFormulaInternalNode.parseNodes[0] instanceof MmToken)
						hasFoundSubstitution = this.buildSubstitutionForLeafNode(
							logicalSystemFormulaInternalNode.parseNodes[0], uStepParseNode, substitution);
					else
						// logicalSystemFormulaInternalNode.parseNodes.length > 1
						if (logicalSystemFormulaInternalNode.parseNodes.length !=
							uStepParseNode.parseNodes.length)
							hasFoundSubstitution = false;
						else {
							hasFoundSubstitution = true;
							// logicalSystemFormulaInternalNode.parseNodes.length > 1 and 
							// logicalSystemFormulaInternalNode.parseNodes.length == proofStepFormulaInternalNode.parseNodes.length
							//TODO1 speed up: break the loop when hasFoundSubstitution== false
							for (let i = 0; i < logicalSystemFormulaInternalNode.parseNodes.length; i++)
								hasFoundSubstitution &&= this.buildSubstitutionForParseNode(
									logicalSystemFormulaInternalNode.parseNodes[i],
									uStepParseNode.parseNodes[i], substitution);
						}
			}
		}
		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForInternalNode

	buildSubstitutionForParseNode(parseNodeForLogicalSystemFormula: ParseNode, uStepParseNode: ParseNode,
		substitution: Map<string, InternalNode>): boolean {
		let hasFoundSubstitution: boolean;
		if (parseNodeForLogicalSystemFormula instanceof MmToken) {
			if (uStepParseNode instanceof InternalNode)
				hasFoundSubstitution = this.buildSubstitutionForLeafNode(
					parseNodeForLogicalSystemFormula, uStepParseNode, substitution);
			else
				hasFoundSubstitution = (uStepParseNode instanceof MmToken) &&
					parseNodeForLogicalSystemFormula.value == uStepParseNode.value;
		}
		else
			// parseNodeForLogicalSystemFormula is an InternalNode
			hasFoundSubstitution = this.buildSubstitutionForInternalNode(
				<InternalNode>parseNodeForLogicalSystemFormula, uStepParseNode, substitution);
		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForSingleFormula

	//#region buildSubstitutionForEHyps
	// buildSubstitutionForUndefinedEHyps(frameEHyps: EHyp[], grammar: Grammar, outermostBlock: BlockStatement,
	// 	workingVars: WorkingVars, substitution: Map<string, InternalNode>) {
	// 	frameEHyps.forEach((frameEHyp: EHyp) => {
	// 		this.buildSubstitutionForUndefinedParseNode(frameEHyp.parseNode(grammar), substitution);
	// 	});
	// }

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
			// if (i >= this.eHypUSteps.length || this.eHypUSteps[i] === undefined ||
			// 	this.eHypUSteps[i]?.parseNode === undefined) {
			// 	this.buildSubstitutionForUndefinedParseNode(
			// 		this.logicalSystemEHyps[i].parseNode(this.grammar), substitution);
			// } else
			if (i < this.eHypUSteps.length && this.eHypUSteps[i] !== undefined)
				// eHypUSteps[i] is an actual step
				hasFoundSubstitution = this.buildSubstitutionForSingleLine(
					this.logicalSystemEHyps[i].parseNode, this.eHypUSteps[i]!.stepFormula, this.eHypUSteps[i]!.parseNode,
					substitution
				);
			// hasFoundSubstitution = this.buildSubstitutionForInternalNode(
			// 	this.logicalSystemEHyps[i].parseNode, this.eHypUSteps[i]!.parseNode!,
			// 	substitution);
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

		// case eHypRefs == undefined && frameEHyps.length == 0

		return hasFoundSubstitution;
	}
	//#endregion buildSubstitutionForEHyps


	buildSubstitutionForExistingParseNodes(): SubstitutionResult {
		const substitution: Map<string, InternalNode> = new Map<string, InternalNode>();
		let hasBeenFound = this.buildSubstitutionForEHyps(substitution);
		if (hasBeenFound)
			// if (this.uProofStep.parseNode != undefined)
			// 	hasBeenFound = this.buildSubstitutionForInternalNode(
			// 		this.assertion.parseNode, this.uProofStep.parseNode, substitution);
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
			// const parseNode: InternalNode = USubstitutionApplier.createParseNodeForInternalNode(
			// 	logicalSystemFormulaInternalNode, substitution);
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
	addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(parseNodeForLogicalSystemFormula: ParseNode,
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
		if (substitutionResult.hasBeenFound)
			this.addWorkingVarsForLogicalVarsWithoutASubstitution(<Map<string, InternalNode>>substitutionResult.substitution);
		// if (hasBeenFound)
		// 	// the step assertion is either missing or it can be unified with the assertion logical statement
		// 	hasBeenFound = this.buildSubstitutionForEHyps(
		// 		frameEHyps, uProofStep.eHypUSteps, grammar, outermostBlock, workingVars, substitution);
		// const substitution: Map<string, string[]> = new Map<string, string[]>();

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
					this.logicalSystemEHyps[i].parseNode, this.eHypUSteps[i]!.parseNode!,
					substitution);
				if (!hasFoundSubstitution)
					nonUnifiableLogicalParseNodes.push(this.logicalSystemEHyps[i].parseNode);
			}
		}
		if (this.uProofStep.parseNode != undefined) {
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
			if (this.eHypUSteps[i]?.parseNode == undefined)
				this.addWorkingVarsForLogicalVarsWithoutASubstitutionForSingleParseNode(eHyp.parseNode, substitution);
		}
		if (this.uProofStep.parseNode === undefined)
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