
import { Grammar,Rule } from 'nearley';
import { MmToken } from './MmLexer';
import { InternalNode, ParseNode } from './ParseNode';
import { AxiomStatement } from "../mm/AxiomStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement } from "../mm/AssertionStatement";
import { concatWithSpaces } from '../mm/Utils';
import { WorkingVars } from '../mmp/WorkingVars';
import { FHyp } from '../mm/FHyp';



type NearleyLiteral = {
	literal: string;
}

type NearleyType = {
	type: string;
}

type NearleyItem = NearleyLiteral | NearleyType | string;


export class MmpRule extends Rule {
	label: string  // the label of the statement generating this rule
	// constructor(label: string, name: string, symbols: NearleyItem[], postprocess: Postprocessor) {
	constructor(label: string, name: string, symbols: NearleyItem[]) {
		// super(name, symbols, postprocess);
		super(name, symbols, (d) => { return new InternalNode(label, name, d); });

		this.label = label;
	}
}

export abstract class GrammarManager {
	//#region areParseNodesEqual
	static areInternalParseNodeEqual(parseNode1: InternalNode, parseNode2: ParseNode): boolean {
		let areEqual = !(parseNode2 instanceof MmToken) && parseNode1.parseNodes.length === parseNode2.parseNodes.length;
		let i = 0;
		while (areEqual && i < parseNode1.parseNodes.length) {
			areEqual = GrammarManager.areParseNodesEqual(parseNode1.parseNodes[i], (<InternalNode>parseNode2).parseNodes[i]);
			i++;
		}
		return areEqual;
	}
	static areParseNodesEqual(parseNode1: ParseNode, parseNode2: ParseNode): boolean {
		let areEqual: boolean;
		if (parseNode1 instanceof MmToken)
			areEqual = parseNode2 instanceof MmToken && parseNode1.value == parseNode2.value;
		else
			areEqual = GrammarManager.areInternalParseNodeEqual(parseNode1, parseNode2);
		return areEqual;
	}
	//#endregion areParseNodesEqual

	//#region areParseNodesCoherent
	static areCoherentInternalParseNode(parseNode1: InternalNode, parseNode2: ParseNode): boolean {
		let areCoherent: boolean;
		if (GrammarManager.isInternalParseNodeForWorkingVar(parseNode1) ||
			GrammarManager.isInternalParseNodeForWorkingVar(parseNode2))
			areCoherent = true;
		else {
			areCoherent = !(parseNode2 instanceof MmToken) &&
				parseNode1.kind == parseNode2.kind &&
				parseNode1.parseNodes.length === parseNode2.parseNodes.length;
			let i = 0;
			while (areCoherent && i < parseNode1.parseNodes.length) {
				areCoherent = GrammarManager.areParseNodesCoherent(
					parseNode1.parseNodes[i], (<InternalNode>parseNode2).parseNodes[i]);
				i++;
			}
		}
		return areCoherent;
	}
	/** two parse nodes are coherent if they are equal up to working vars */

	static areParseNodesCoherent(parseNode1: ParseNode, parseNode2: ParseNode): boolean {
		let areCoherent: boolean;
		if (parseNode1 instanceof MmToken)
			areCoherent = parseNode2 instanceof MmToken && parseNode1.value == parseNode2.value;
		else
			areCoherent = GrammarManager.areCoherentInternalParseNode(parseNode1, parseNode2);
		return areCoherent;
	}
	//#endregion areParseNodesCoherent

	static CreateRule(label: string, kind: string, symbols: NearleyItem[]): MmpRule {
		// return new Rule(kind, symbols,
		// 	(d) => { return { label: label, kind: kind, parseNodes: d }; }
		// );
		return new MmpRule(label, kind, symbols
			// (d) => { return new InternalNode(label, kind, d); }
		);
	}

	//#region CreateGrammar

	//#region addRulesForStatements
	static CreateLiteralForFHyp(statement: FHyp): Rule {
		const rule: Rule = GrammarManager.CreateRule(statement.Label, statement.Kind, [{ literal: statement.Variable }]);
		return rule;
	}

	static CreateRuleForSyntaxAxiom(statement: AxiomStatement): Rule {
		const ruleKind: string = statement.Content[0].value;
		const nearleyItems: NearleyItem[] = [];
		// if (statement.Label == "wal") {
		// 	const forBreakpoint = 3;
		// }
		for (let i = 1; i < statement.Content.length; i++) {
			const symbol: MmToken = statement.Content[i];
			// const syntaxKind: string | undefined = statement.ParentBlock?.varToKindMap.get(symbol.value);
			const syntaxKind: string | undefined = statement.ParentBlock?.kindOf(symbol.value);
			if (syntaxKind != undefined)
				// current symbol is a variable of kind syntaxKind
				nearleyItems.push(syntaxKind);
			else
				// current symbol is a constant
				nearleyItems.push({ literal: symbol.value });
		}
		// statement.Content.forEach((symbol: MmToken) => {
		// 	const syntaxKind: string | undefined = statement.ParentBlock?.varToKindMap.get(symbol.value);
		// 	if (syntaxKind != undefined)
		// 		// current symbol is a variable of kind syntaxKind
		// 		nearleyItems.push(syntaxKind);
		// 	else
		// 		// current symbol is a constant
		// 		nearleyItems.push({ literal: symbol.value });
		// });
		const rule: Rule = GrammarManager.CreateRule(statement.Label, ruleKind, nearleyItems);
		return rule;
	}

	static isSyntaxAxiom(statement: LabeledStatement, syntacticKinds: Set<string>): boolean {
		let isSyntaxAxiom: boolean = statement instanceof AxiomStatement;
		if (isSyntaxAxiom) {
			const kind: string = (<AxiomStatement>statement).Content[0].value;
			isSyntaxAxiom = isSyntaxAxiom && (
				syntacticKinds.has(kind) ||
				statement.ParentBlock!.hasKind(kind));
		}
		return isSyntaxAxiom;
		// isSyntaxAxiom &= ( syntacticKinds.has((<AxiomStatement>statement).Content[0].value));
		// throw new Error('Method not implemented.');
	}

	//TODO this is almost identical to GrammarManager.isSyntaxAxiom() , consider creating
	// a single method
	static isSyntaxAxiom2(assertionStatement: AssertionStatement): boolean {
		const result: boolean = assertionStatement.formula.length > 0 &&
			assertionStatement.formula[0] != GrammarManager.typeCodeForProvable;
		return result;
	}

	static addRulesForStatements(labelToStatementMap: Map<string, LabeledStatement>, rules: Rule[]) {
		// contains the syntacticKinds defined in the outermost scope
		const syntacticKinds: Set<string> = new Set<string>();

		labelToStatementMap.forEach((statement: LabeledStatement) => {
			if (statement instanceof FHyp) {
				if (!(syntacticKinds.has((<FHyp>statement).Kind)) && statement.ParentBlock?.ParentBlock == null)
					// this kind has not been added, yet and the statement is in the outermost block
					syntacticKinds.add((<FHyp>statement).Kind);
				const rule: Rule = GrammarManager.CreateLiteralForFHyp(statement);
				rules.push(rule);
				// } else if (statement instanceof AxiomStatement && syntacticKinds.has((<AxiomStatement>statement).Content[0].value)) {
			} else if (GrammarManager.isSyntaxAxiom(statement, syntacticKinds)) {
				// statement is syntax axiom
				const rule: Rule = GrammarManager.CreateRuleForSyntaxAxiom(<AxiomStatement>statement);
				rules.push(rule);
			}
		});
	}

	static addRulesForWorkingVars(workingVars: WorkingVars, rules: Rule[]) {
		workingVars.prefixToKindMap.forEach((kind: string) => {
			const tokenType = workingVars.tokenTypeFromKind(kind);
			const rule: Rule =
				GrammarManager.CreateRule("wvar_" + kind, kind, [{ type: tokenType }]);
			rules.push(rule);
		});
	}

	//TODO this is hardcoded, it could be done better, may be using $j comments
	static typeCodeForProvable = "|-";

	static CreateGrammar(labelToStatementMap: Map<string, LabeledStatement>,
		workingVars: WorkingVars): Grammar {

		const rules: Rule[] = [];

		rules.push(GrammarManager.CreateRule("TOP", "provable",
			[{ literal: GrammarManager.typeCodeForProvable }, "wff"]));

		GrammarManager.addRulesForStatements(labelToStatementMap, rules);

		GrammarManager.addRulesForWorkingVars(workingVars, rules);

		const grammar: Grammar = new Grammar(rules);
		grammar.start = "provable";

		return grammar;
	}
	//#endregion addRulesForStatements

	//#endregion CreateGrammar

	static isInternalParseNodeForWorkingVar(parseNode: ParseNode) {
		const result: boolean = (parseNode instanceof InternalNode) && (<InternalNode>parseNode).label.startsWith("wvar_");
		return result;
	}

	/** true iff parseNode is a ParseNode for a fHyp */
	static isInternalParseNodeForFHyp(parseNode: InternalNode, variables: Set<string>): boolean {
		const result: boolean = (parseNode.parseNodes.length == 1 && parseNode.parseNodes[0] instanceof MmToken &&
			variables.has(parseNode.parseNodes[0].value));
		return result;
	}


	static containsWorkingVar(uStepParseNode: InternalNode): boolean {
		let result = GrammarManager.isInternalParseNodeForWorkingVar(uStepParseNode);
		let i = 0;
		while (!result && i < uStepParseNode.parseNodes.length) {
			if (uStepParseNode.parseNodes[i] instanceof InternalNode)
				result = GrammarManager.containsWorkingVar(<InternalNode>uStepParseNode.parseNodes[i]);
			i++;
		}
		return result;
	}


	/**
	 * this method can be invoded only when parseNode is an InternalNode with
	 * a single child, that is a MmToken
	 * @param parseNode
	 * @returns 
	 */
	static getTokenValueFromInternalNode(parseNode: InternalNode): string {
		const workingVar: string = (<MmToken>(parseNode.parseNodes[0])).value;
		return workingVar;
	}

	static createInternalNodeForWorkingVar(workingVar: string, kind: string, tokenType: string):
		InternalNode {
		const parseNodes: MmToken[] = [new MmToken(workingVar, 0, 0, tokenType)];
		const internalNodeForWorkingVar: InternalNode = new InternalNode(
			"wvar_" + kind, kind, parseNodes);
		return internalNodeForWorkingVar;
	}

	/**
	 * builds the array of symbols starting froma a ParseNode
	 * @param parseNode the node for which the array of symbols is returned
	 * @returns 
	 */
	static buildStringArray(parseNode: ParseNode): string[] {
		let result: string[] = [];
		if (parseNode instanceof MmToken)
			// proofStepFormulaNode is leaf node, that is an MmToken
			result = [(<MmToken>parseNode).value];
		else {
			// proofStepFormulaNode is an internal node
			const internalNode = <InternalNode>parseNode;
			internalNode.parseNodes.forEach(parseNode => {
				result = result.concat(GrammarManager.buildStringArray(parseNode));
			});
		}
		return result;
	}

	/**
	 * rebuilds the origina formula, from the parseNode
	 * @param parseNode the node the represents the formula to be rebuilt
	 * @returns 
	 */
	static buildStringFormula(parseNode: ParseNode): string {
		let result = "";
		if (parseNode instanceof MmToken)
			// proofStepFormulaNode is leaf node, that is an MmToken
			result = (<MmToken>parseNode).value;
		else {
			// proofStepFormulaNode is an internal node
			const internalNode = <InternalNode>parseNode;
			internalNode.parseNodes.forEach(parseNode => {
				result = result + " " + this.buildStringFormula(parseNode);
			});
		}
		result = result.trim();
		return result;
	}

	/**
	 * rebuilds the original formula, from the parseNode, but substitutes
	 * variables with the given substitution
	 * @param parseNode the node the represents the formula to be rebuilt
	 * @param substitution the substitution to be applied to variables
	 */
	static buildStringFormulaWithSubstitution(parseNode: ParseNode, substitution: Map<string, string[]>): string {
		let result = "";
		if (parseNode instanceof MmToken) {
			// proofStepFormulaNode is leaf node, that is an MmToken
			const substituteWith = substitution.get((<MmToken>parseNode).value);
			if (substituteWith != undefined)
				result = concatWithSpaces(substituteWith);
			else
				result = (<MmToken>parseNode).value;
		} else {
			// proofStepFormulaNode is an internal node
			const internalNode = <InternalNode>parseNode;
			internalNode.parseNodes.forEach(parseNode => {
				result = result + " " + this.buildStringFormulaWithSubstitution(parseNode, substitution);
			});
		}
		result = result.trim();
		return result;
	}
}