import { Grammar } from 'nearley';
import { BlockStatement } from '../mm/BlockStatement';
import { MmToken } from '../grammar/MmLexer';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { AssertionStatement } from "../mm/AssertionStatement";
import { UProof } from './UProof';
import { WorkingVars } from './WorkingVars';
import { MmpProofStep } from "./MmpProofStep";
import { EHyp } from '../mm/EHyp';

export class USubstitutionApplier {
	substitution: Map<string, InternalNode>;
	uStepIndex: number;
	assertion: AssertionStatement;
	outermostBlock: BlockStatement;
	workingVars: WorkingVars;
	grammar: Grammar;
	uProof: UProof;

	private uProofStep: MmpProofStep;
	private logicalSystemEHyps: EHyp[];
	private eHypUSteps: (MmpProofStep | undefined)[];

	constructor(substitution: Map<string, InternalNode>, uStepIndex: number, uProof: UProof, assertion: AssertionStatement, outermostBlock: BlockStatement,
		workingVars: WorkingVars, grammar: Grammar) {
		this.substitution = substitution;
		this.uStepIndex = uStepIndex;
		this.assertion = assertion;
		this.outermostBlock = outermostBlock;
		this.workingVars = workingVars;
		this.grammar = grammar;
		this.uProof = uProof;

		this.uProofStep = <MmpProofStep>this.uProof.uStatements[uStepIndex];
		this.logicalSystemEHyps = <EHyp[]>(this.assertion.frame?.eHyps);
		this.eHypUSteps = this.uProofStep.eHypUSteps;
	}

	//#region createParseNode

	//TODO this one is probably to be removed, it's called nowhere
	static createParseNodeForMmToken(parseNodeForLogicalSystemFormula: MmToken,
		substitution: Map<string, InternalNode>): ParseNode {
		const symbol = parseNodeForLogicalSystemFormula.value;
		//TODO probably this step should be done at InternalNode level, not at the leaf node level
		let newParseNode: ParseNode | undefined = substitution.get(symbol);
		if (newParseNode === undefined) {
			// 	// symbol is a variable of kind variableKind
			// 	const newWorkingVar: string = <string>workingVars.getNewWorkingVar(variableKind);
			// 	newMmToken = new MmToken(newWorkingVar, 0, 0);
			// 	newMmToken.type = variableKind;
			// } else
			// symbol is a constant of the theory
			newParseNode = new MmToken(symbol, 0, 0);
		}
		return newParseNode;
	}

	static isInternalNodeForLogicalVariable(parseNodeForLogicalSystemFormula: ParseNode,
		outermostBlock: BlockStatement): boolean {
		const result: boolean = parseNodeForLogicalSystemFormula instanceof InternalNode &&
			parseNodeForLogicalSystemFormula.parseNodes.length === 1 &&
			parseNodeForLogicalSystemFormula.parseNodes[0] instanceof MmToken &&
			outermostBlock.v.has(parseNodeForLogicalSystemFormula.parseNodes[0].value);
		// substitution.get(parseNodeForLogicalSystemFormula.parseNodes[0].value) != undefined;
		return result;
	}

	static createParseNodeForLogicalVariable(internalNodeForLogicalVariable: InternalNode,
		substitution: Map<string, InternalNode>): InternalNode {
		const symbol = (<MmToken>internalNodeForLogicalVariable.parseNodes[0]).value;
		//if we get here, symbol should be a logical variable, and
		//a substitution should always be found
		const newParseNode: InternalNode = <InternalNode>substitution.get(symbol);
		if (newParseNode == undefined) {
			console.log(`Error! The USubstitutionBuilder is trying to ` +
				`build a build a ParseNode, but the given substitution does not contain ` +
				`a substitution value for the logical variable '${symbol}'`);
			throw new Error(`Error! The USubstitutionBuilder is trying to ` +
				`build a build a ParseNode, but the given substitution does not contain ` +
				`a substitution value for the logical variable '${symbol}'`);
		}
		return newParseNode;
	}

	static createParseNodeForInternalNode(parseNodeForLogicalSystemFormula: InternalNode,
		substitution: Map<string, InternalNode>, outermostBlock: BlockStatement): InternalNode {
		const parseNodes: ParseNode[] = [];
		//TODO probably you should check for a substitution here, not at the leaf level
		parseNodeForLogicalSystemFormula.parseNodes.forEach((parseNode: ParseNode) => {
			const newParseNode: ParseNode = USubstitutionApplier.createParseNode(parseNode, substitution,
				outermostBlock);
			parseNodes.push(newParseNode);
		});
		// const newInternalNode: InternalNode = {
		// 	kind: parseNodeForLogicalSystemFormula.kind,
		// 	label: parseNodeForLogicalSystemFormula.label,
		// 	parseNodes: parseNodes
		// };
		const newInternalNode: InternalNode = new InternalNode(
			parseNodeForLogicalSystemFormula.label,
			parseNodeForLogicalSystemFormula.kind,
			parseNodes);
		return newInternalNode;
	}

	static createParseNode(parseNodeForLogicalSystemFormula: ParseNode, substitution: Map<string, InternalNode>,
		outermostBlock: BlockStatement): ParseNode {
		let newParseNode: ParseNode;
		if (USubstitutionApplier.isInternalNodeForLogicalVariable(parseNodeForLogicalSystemFormula,
			outermostBlock)) {
			newParseNode = USubstitutionApplier.createParseNodeForLogicalVariable(
				<InternalNode>parseNodeForLogicalSystemFormula, substitution);
		} else if (parseNodeForLogicalSystemFormula instanceof MmToken)
			// we get here only if the MmToken represents a constant, thus there's no
			// need to clone it and we can use the same token of the logicalSystemFormula
			// newParseNode = USubstitutionApplier.createParseNodeForMmToken(parseNodeForLogicalSystemFormula,
			// 	substitution);
			newParseNode = USubstitutionApplier.createParseNodeForMmToken(parseNodeForLogicalSystemFormula,
				substitution);
		else
			// parseNodeForLogicalSystemFormula is an InternalNode
			newParseNode = USubstitutionApplier.createParseNodeForInternalNode(parseNodeForLogicalSystemFormula,
				substitution, outermostBlock);
		return newParseNode;
	}
	//#endregion createParseNode

	// applise the 
	// applySubstitutionToExistingNode(parseNode: ParseNode,
	// 	parseNodeForLogicalSystemFormula: ParseNode): ParseNode {
	// 	let newParseNode: ParseNode = parseNode;
	// 	if (parseNode instanceof MmToken && this.workingVars.isWorkingVar(parseNode.value)) {
	// 		const nodeForSubstitution: ParseNode | undefined = this.substitution.get(parseNode.value);
	// 		if (nodeForSubstitution != undefined)
	// 			// parseNode is a working var for which a substitution was found
	// 			newParseNode = nodeForSubstitution;
	// 	}
	// 	return newParseNode;
	// }

	applySubstitutionToSingleNode(uProofStep: MmpProofStep,
		parseNodeForLogicalSystemFormula: InternalNode) {
		if (uProofStep.parseNode == undefined)
			uProofStep.parseNode = USubstitutionApplier.createParseNodeForInternalNode(parseNodeForLogicalSystemFormula,
				this.substitution, this.outermostBlock);
		// else
		// 	uProofStep.parseNode = this.applySubstitutionToExistingNode(
		// 		uProofStep.parseNode, parseNodeForLogicalSystemFormula);
		// this.uProof.addUProofStep(uProofStep);
	}
	//#endregion applySubstitutionToSingleNode

	//#region applySubstitutionToEHypsAndAddMissingOnes
	// it is assumed to be eHypUSteps.length  <= logicalSystemEHyps.length and the missing
	// refs are assumed to be at the end
	applySubstitutionToEHypsAndAddMissingOnes(): number {
		let indexToInsertNewEHyps = this.uStepIndex;
		for (let i = 0; i < this.logicalSystemEHyps.length; i++) {
			const logicalSystemEHyp: EHyp = this.logicalSystemEHyps[i];
			if (i < this.eHypUSteps.length) {
				if (this.eHypUSteps[i] === undefined)
					this.eHypUSteps[i] = this.uProof.createEmptyUStepAndAddItBeforeIndex(indexToInsertNewEHyps++);
				if (this.eHypUSteps[i]!.parseNode === undefined)
					this.eHypUSteps[i]!.parseNode =
						USubstitutionApplier.createParseNodeForInternalNode(logicalSystemEHyp.parseNode,
							this.substitution, this.outermostBlock);
				// else
				// 	this.eHypUSteps[i]!.parseNode = this.applySubstitutionToExistingNode(
				// 		<ParseNode>this.eHypUSteps[i]!.parseNode, logicalSystemEHyp.parseNode(this.grammar));
			} else {
				// eHypUSteps.length <_ i
				const newEHypUStep = this.uProof.createEmptyUStepAndAddItBeforeIndex(indexToInsertNewEHyps++);
				newEHypUStep.parseNode = USubstitutionApplier.createParseNodeForInternalNode(logicalSystemEHyp.parseNode,
					this.substitution, this.outermostBlock);
				this.eHypUSteps.push(newEHypUStep);
			}
		}
		return indexToInsertNewEHyps;
	}
	//#endregion applySubstitutionToEHypsAndAddMissingOnes

	/**
	 * Applies a substitution to a single MmpProofStep:
	 * - if the formula is missing, it's added (with working vars)
	 * - if an $e hypothesis is missing, it's added (with working vars)
	 * - new $e hypothesis and the MmpProofStep are added at the end of to the UProof
	 * Returns the new index for the MmpProofStep that was indexed by uStepIndex (this
	 * can be increased, if new hypothesis are added) 
	 */
	applySubstitution(): number {
		const updatedeUStepIndex: number = this.applySubstitutionToEHypsAndAddMissingOnes();
		this.applySubstitutionToSingleNode(this.uProofStep, this.assertion.parseNode);
		return updatedeUStepIndex;
	}
}