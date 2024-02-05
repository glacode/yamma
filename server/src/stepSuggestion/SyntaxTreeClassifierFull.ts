import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmParser } from '../mm/MmParser';
import { IFormulaClassifier } from './IFormulaClassifier';

/** given a formula and a MmParser, returns the syntax tree of the formula,
as a string representation in rpn format; this classifier works with any
theory, it is NOT set.mm specific.

For instance, given set.mm, '|- ( ph -> ps )'
with maxlevel = 0 it will return 'TOP'
with maxlevel = 1 it will return 'wi TOP'
with maxlevel = 2 it will return 'wff wff wi TOP'
with maxlevel = 3 it will still return 'wff wff wi TOP'

whereas given '|- E. x e. A ph'
with maxlevel = 2 it will return setvar class wff wrex TOP'

whereas given '|- E. x e. A B = B'
with maxlevel = 1 it will return 'wrex TOP'
with maxlevel = 2 it will return 'setvar class wceq wrex TOP'
*/
export class SyntaxTreeClassifierFull implements IFormulaClassifier {
	maxLevel: number;
	id: string;
	// constructor(mmParser: MmParser) {
	// 	this.mmParser = mmParser;
	// 	this.grammar = this.mmParser.outermostBlock.grammar!;
	/**
	 * 
	 * @param maxLevel the zero-based max level of the syntax tree produced;
	 * 0 is for root (for instance, in set.mm it will always be 'TOP')
	 */
	constructor(maxLevel: number) {
		// full, 4 levels
		this.maxLevel = maxLevel;
		this.id = 'full' + maxLevel;
	}

	//#region classify

	/** builds a rpn string representing the syntax tree of the given formula */
	private buildRpnSyntaxTreeFromParseNode(parseNode: ParseNode, mmParser: MmParser, currentLevel: number, maxLevel: number): string {
		let treeString = '';
		let nodeLabelOrCluster: string | undefined;
		// we don't want to consider FHyps labels
		// if (currentLevel <= maxLevel && parseNode instanceof InternalNode && !this._fHypLabels.has(parseNode.label)) {
		// if (currentLevel <= maxLevel && parseNode instanceof InternalNode &&
		// 	!GrammarManager.isInternalParseNodeForWorkingVar(parseNode)) {
		if (currentLevel <= maxLevel && parseNode instanceof InternalNode) {
			if (GrammarManager.isInternalParseNodeForWorkingVar(parseNode)) {
				// working vars are clustered, i.e. replaced with their kind
				nodeLabelOrCluster = parseNode.kind;
			}
			else if (GrammarManager.isInternalParseNodeForFHyp(parseNode, mmParser.outermostBlock.v)) {
				// FHyps labels are clustered, i.e. replaced with their kind
				nodeLabelOrCluster = parseNode.kind;
				// const theoryVariable: string = GrammarManager.getTokenValueFromInternalNode(parseNode);
				// nodeLabelOrCluster = mmParser.outermostBlock.kindOf(theoryVariable);
			} else {
				// parseNode is an InternalNode and it is neither a working var, nor
				// a Fhyp
				nodeLabelOrCluster = parseNode.label;
				// !GrammarManager.isInternalParseNodeForFHyp(parseNode, this.mmParser.outermostBlock.v)

				parseNode.parseNodes.forEach((childNode: ParseNode) => {
					const subTree: string = this.buildRpnSyntaxTreeFromParseNode(childNode, mmParser, currentLevel + 1, maxLevel);
					if (subTree != '') {
						if (treeString != '')
							treeString += ' ';
						treeString += subTree;
					}
				});
				if (treeString != '')
					treeString += ' ';
			}
			// treeString += parseNode.label;
			treeString += nodeLabelOrCluster;
		}
		// if (currentLevel <= maxLevel && parseNode instanceof InternalNode &&
		// 	// !GrammarManager.isInternalParseNodeForFHyp(parseNode, this.mmParser.outermostBlock.v)
		// 	!GrammarManager.isInternalParseNodeForFHyp(parseNode, mmParser.outermostBlock.v)
		// 	&& !GrammarManager.isInternalParseNodeForWorkingVar(parseNode)) {
		// 	parseNode.parseNodes.forEach((childNode: ParseNode) => {
		// 		const subTree: string = this.buildRpnSyntaxTreeFromParseNode(childNode, mmParser, currentLevel + 1, maxLevel);
		// 		if (subTree != '') {
		// 			if (treeString != '')
		// 				treeString += ' ';
		// 			treeString += subTree;
		// 		}
		// 	});
		// 	if (treeString != '')
		// 		treeString += ' ';
		// 	treeString += parseNode.label;
		// }
		return treeString;
	}
	// buildRpnSyntaxTreeFromFormula(assertionStatementWithSubstitution: string[], grammar: Grammar): string {
	classify(parseNode: ParseNode, mmParser: MmParser): string {
		// const parseNode: ParseNode = assertionStatementProofStep.parseNode;
		// const grammar: Grammar = assertionStatementProofStep.outermostBlock!.grammar!;
		// let rpnSyntaxTree = '';
		// this.mmParser.grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		// mmParser.grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		// const parser = new Parser(this.mmParser.grammar);
		// const parser = new Parser(mmParser.grammar);
		// parser.feed('');
		// const parseNode: ParseNode = parser.results[0];
		// const rpnSyntaxTree = this.buildRpnSyntaxTreeFromParseNode(parseNode, mmParser, 0, 3);
		const rpnSyntaxTree = this.buildRpnSyntaxTreeFromParseNode(parseNode, mmParser, 0, this.maxLevel);
		return rpnSyntaxTree;
	}
	//#endregion classify
}