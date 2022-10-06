import { Parser } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmLexerFromStringArray } from '../grammar/MmLexerFromStringArray';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmParser } from '../mm/MmParser';
import { IFormulaClassifier } from './IFormulaClassifier';

export class RpnSyntaxTreeBuilder implements IFormulaClassifier {
	id: string;

	// constructor(mmParser: MmParser) {
	// 	this.mmParser = mmParser;
	// 	this.grammar = this.mmParser.outermostBlock.grammar!;
	constructor() {
		// ambiguous, 4 levels
		this.id = 'amb4l';
	}

	//#region buildRpnSyntaxTree

	/** builds a rpn string representing the syntax tree of the given formula */
	buildRpnSyntaxTreeFromParseNode(parseNode: ParseNode, mmParser: MmParser, currentLevel: number, maxLevel: number): string {
		let treeString = '';
		// we don't want to consider FHyps labels
		// if (currentLevel <= maxLevel && parseNode instanceof InternalNode && !this._fHypLabels.has(parseNode.label)) {
		if (currentLevel <= maxLevel && parseNode instanceof InternalNode &&
			// !GrammarManager.isInternalParseNodeForFHyp(parseNode, this.mmParser.outermostBlock.v)
			!GrammarManager.isInternalParseNodeForFHyp(parseNode, mmParser.outermostBlock.v)
			&& !GrammarManager.isInternalParseNodeForWorkingVar(parseNode)) {
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
			treeString += parseNode.label;
		}
		return treeString;
	}
	// buildRpnSyntaxTreeFromFormula(assertionStatementWithSubstitution: string[], grammar: Grammar): string {
	buildRpnSyntaxTreeFromFormula(assertionStatementWithSubstitution: string[], mmParser: MmParser): string {
		// const parseNode: ParseNode = assertionStatementProofStep.parseNode;
		// const grammar: Grammar = assertionStatementProofStep.outermostBlock!.grammar!;
		let rpnSyntaxTree = '';
		// this.mmParser.grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		mmParser.grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		// const parser = new Parser(this.mmParser.grammar);
		const parser = new Parser(mmParser.grammar);
		parser.feed('');
		const parseNode: ParseNode = parser.results[0];
		rpnSyntaxTree = this.buildRpnSyntaxTreeFromParseNode(parseNode, mmParser, 0, 3);
		return rpnSyntaxTree;
	}
	//#endregion buildRpnSyntaxTree
}