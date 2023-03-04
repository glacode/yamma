import { Grammar } from 'nearley';
import { BlockStatement } from '../mm/BlockStatement';
import { GrammarManager } from './GrammarManager';
import { MmToken } from './MmLexer';
import { AxiomStatement } from "../mm/AxiomStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { UProofStatementStep } from '../mmp/MmpStatement';

export class InternalNode {
	label: string;
	kind: string;
	parseNodes: ParseNode[]

	constructor(label: string, kind: string, parseNodes: ParseNode[]) {
		this.label = label;
		this.kind = kind;
		this.parseNodes = parseNodes;
	}

	/** true iff this node represents an $f statement */
	isNodeForFStatement(logicalVars: Set<string>): boolean {
		const result: boolean = this.parseNodes.length == 1 && this.parseNodes[0] instanceof MmToken
			&& logicalVars.has(this.parseNodes[0].value);
		return result;
	}


	/**
	 * if this InternalNode is the parsing node of an $f statement, it
	 * returns the label of the the $f statement; undefined otherwise
	 */
	labelForFStatement(logicalVars: Set<string>): string | undefined {
		let label: string | undefined;
		if (this.isNodeForFStatement(logicalVars)) {
			label = this.label;
		}
		return label;
	}

	
	public get stringFormula() : string {
		const result : string = GrammarManager.buildStringFormula(this);
		return result;
	}

	/**
	 * returns the set (populated in RPN order) of the labels of the mandatory
	 * $f statements for the current parse node
	 */
	fStatementLabels(logicalVars: Set<string>): Set<string> {
		const result: Set<string> = new Set<string>();
		this.parseNodes.forEach((parseNode: ParseNode) => {
			if (parseNode instanceof InternalNode) {
				const subLabels: Set<string> = parseNode.fStatementLabels(logicalVars);
				subLabels.forEach((label: string) => {
					//TODO check if adding an already existing label, keeps the ordering anyway
					result.add(label);
				});
			}
		});
		const labelForFStatement: string | undefined = this.labelForFStatement(logicalVars);
		if (labelForFStatement != undefined)
			// the current node represents a $f statement
			result.add(labelForFStatement);
		return result;
	}

	/**
	 * returns the array (populated in RPN order) of the labels and relative parse nodes
	 * of the mandatory* $f statements for the current parse node
	 */
	// fStatementUProofStatementSteps(logicalVars: Set<string>): Set<UProofStatementStep> {
	// 	const result: Set<UProofStatementStep> = new Set<UProofStatementStep>();
	// 	this.parseNodes.forEach((parseNode: ParseNode) => {
	// 		if (parseNode instanceof InternalNode) {
	// 			const subSteps: Set<UProofStatementStep> = parseNode.fStatementUProofStatementSteps(logicalVars);
	// 			subSteps.forEach((subStep: UProofStatementStep) => {
	// 				//TODO check if adding an already existing label, keeps the ordering anyway
	// 				result.add(subStep);
	// 			});
	// 		}
	// 	});
	// 	const labelForFStatement: string | undefined = this.labelForFStatement(logicalVars);
	// 	if (labelForFStatement != undefined)
	// 		// the current node represents a $f statement
	// 		result.add({ label: labelForFStatement, parseNode: this });
	// 	return result;
	// }

	/**
	 * true iff any of the nodes in the subtree is a MmToken that has the given value
	 * @param value 
	 */
	containsTokenValue(value: string): boolean {
		let i = 0;
		let containsTokenValue = false;
		while (!containsTokenValue && i < this.parseNodes.length) {
			containsTokenValue = this.parseNodes[i].containsTokenValue(value);
			i++;
		}
		return containsTokenValue;
	}

	/**
	 * Returns the set of alla tokens with value in the given symbols set
	 * @param logicalVariables
	 */
	mmTokensContaining(symbols: Set<string>): Set<MmToken> {
		let result: Set<MmToken> = new Set<MmToken>();
		this.parseNodes.forEach((parseNode: ParseNode) => {
			if (parseNode instanceof MmToken) {
				if (symbols.has(parseNode.value))
					result = result.add(parseNode);
			} else {
				// parseNode instance of InternalNode
				const subNodeTokens: Set<MmToken> = parseNode.mmTokensContaining(symbols);
				subNodeTokens.forEach((token: MmToken) => {
					result.add(token);
				});
			}
		});
		return result;
	}

	/**
	 * Returns the set of alla tokens values within the given symbols' set
	 * @param symbols 
	 */
	symbolsSubsetOf(symbols: Set<string>): Set<string> {
		let result: Set<string> = new Set<string>();
		this.parseNodes.forEach((parseNode: ParseNode) => {
			if (parseNode instanceof MmToken) {
				if (symbols.has(parseNode.value))
					result = result.add(parseNode.value);
			} else {
				// parseNode instance of InternalNode
				const subNodeResult: Set<string> = parseNode.symbolsSubsetOf(symbols);
				subNodeResult.forEach((symbol: string) => {
					result.add(symbol);
				});
			}
		});
		return result;
	}

	/** the logical variables contained in this parse node */
	logicalVariables(outermostBlockStatement: BlockStatement) : Set<string> {
		const result: Set<string> = this.symbolsSubsetOf(outermostBlockStatement.v);
		return result;
	}

	get proofArrayWithoutAnySubstitution(): UProofStatementStep[] {
		const proof: UProofStatementStep[] = [];
		this.parseNodes.forEach((child: ParseNode) => {
			if (child instanceof InternalNode) {
				const childProof: UProofStatementStep[] = child.proofArrayWithoutAnySubstitution;
				proof.push(...childProof);
			}
		});
		proof.push({ label: this.label, parseNode: this });
		return proof;
	}

	proofArrayWithSubstitution(substitutionInRpnOrder: Map<string, InternalNode>): UProofStatementStep[] {
		const proof: UProofStatementStep[] = [];
		substitutionInRpnOrder.forEach((substitution: InternalNode) => {
			const subProof: UProofStatementStep[] = substitution.proofArrayWithoutAnySubstitution;
			proof.push(...subProof);
		});
		proof.push({ label: this.label, parseNode: this });
		return proof;
	}
	//#region buildSubstitutionInRpnOrder

	//#region buildSubstitution
	buildSubstitutionForLogicalParseNode(logicalSystemParseNode: InternalNode, statementMandatoryVars: Set<string>,
		substitution: Map<string, InternalNode>) {
		if (logicalSystemParseNode.parseNodes.length === 1 && logicalSystemParseNode.parseNodes[0] instanceof MmToken &&
			statementMandatoryVars.has(logicalSystemParseNode.parseNodes[0].value))
			// outermostBlock.v.has(logicalSystemParseNode.parseNodes[0].value))
			// this is an internal node for a mandatory variable
			substitution.set(logicalSystemParseNode.parseNodes[0].value, this);
		else
			// this is not an internal node for a mandatory variable
			for (let i = 0; i < logicalSystemParseNode.parseNodes.length; i++)
				if (logicalSystemParseNode.parseNodes[i] instanceof InternalNode)
					(<InternalNode>this.parseNodes[i]).buildSubstitutionForLogicalParseNode(
						(<InternalNode>logicalSystemParseNode.parseNodes[i]), statementMandatoryVars, substitution);
	}
	buildSubstitution(outermostBlock: BlockStatement, grammar: Grammar): Map<string, InternalNode> {
		const substitution: Map<string, InternalNode> = new Map<string, InternalNode>();
		// const labeledStatement: LabeledStatement = outermostBlock.getLabeledStatement(this.label)!;
		const labeledStatement: LabeledStatement = outermostBlock.mmParser!.labelToStatementMap.get(this.label)!;
		if (labeledStatement instanceof AxiomStatement) {
			const logicalSystemParseNode: InternalNode = labeledStatement.parseNodeForSyntaxAxiom(grammar);
			const mandatoryVars: Set<string> = labeledStatement.mandatoryVars(outermostBlock);
			this.buildSubstitutionForLogicalParseNode(logicalSystemParseNode, mandatoryVars, substitution);
		}
		return substitution;
	}
	//#endregion buildSubstitution

	reorderSubstitution(substitution: Map<string, InternalNode>,
		outermostBlock: BlockStatement): Map<string, InternalNode> {
		const vars: Set<string> = new Set<string>(substitution!.keys());
		const mandatoryVarsInRPNorder: string[] = outermostBlock.getVariablesInRPNorder(vars);
		const result = new Map<string, InternalNode>();
		mandatoryVarsInRPNorder.forEach((logicalVar: string) => {
			result.set(logicalVar, <InternalNode>substitution.get(logicalVar));
		});
		return result;
	}

	//TODO check not to invoke this method when this parse node contains working vars
	/**
	 * returns a substitution for a logical syntax assertion. It is meant to be invoked only when
	 * a normal proof is computed, thus it is assumed to be a valid parse node,
	 * for the assertion, and then no check is done for failed unification.
	 * Notice the difference from
	 * the methods provided by USubstitutionBuilder: that class performes a substitution for a full
	 * UProofStep (with its EHyps), whereas this method builds a substitution for a syntax axiom
	 */
	buildSubstitutionInRpnOrder(outermostBlock: BlockStatement, grammar: Grammar): Map<string, InternalNode> {
		const substitution: Map<string, InternalNode> = this.buildSubstitution(outermostBlock, grammar);
		const substitutionInRpnOrder: Map<string, InternalNode> =
			this.reorderSubstitution(substitution, outermostBlock);
		return substitutionInRpnOrder;
	}
	//#endregion buildSubstitutionInRpnOrder


	/**
	 * returns the syntactic proof corresponding to the internal node
	 */
	// proofArray(): UProofStatementStep[] {
	// 	//esempio: wex deve prima mettere la substitution di ph e dopo deve mettere la substitution di x
	// 	const proof: UProofStatementStep[] = [];
	// 	this.parseNodes.forEach((child: ParseNode) => {
	// 		if (child instanceof InternalNode) {
	// 			const childProof: UProofStatementStep[] = child.proofArray();
	// 			proof.push(...childProof);
	// 		}

	// 	});
	// 	proof.push({ label: this.label, parseNode: this });
	// 	return proof;
	// }
	//TODO1 mar 4 this below is wrong, because it loses the RPN order in subnodes; it must be recursive
	proofArray(outermostBlock: BlockStatement, grammar: Grammar): UProofStatementStep[] {
		//esempio: wal deve prima mettere la substitution di ph e dopo deve mettere la substitution di x
		// this.getParseNodeForLogicalSyntaxAssertion(outermostBlock, grammar);
		const substitutionInRpnOrder: Map<string, InternalNode> = this.buildSubstitutionInRpnOrder(
			outermostBlock, grammar);
		const proof: UProofStatementStep[] = this.proofArrayWithSubstitution(substitutionInRpnOrder);
		// parseNodeForLogicalSyntaxAssertion.fStatementUProofStatementSteps
		// const proof: UProofStatementStep[] = [];
		// this.parseNodes.forEach((child: ParseNode) => {
		// 	if (child instanceof InternalNode) {
		// 		const childProof: UProofStatementStep[] = child.proofArray();
		// 		proof.push(...childProof);
		// 	}

		// });
		// proof.push({ label: this.label, parseNode: this });
		return proof;
	}
}

export type ParseNode = InternalNode | MmToken;