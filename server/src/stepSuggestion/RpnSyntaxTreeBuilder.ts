import { Grammar, Parser } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmLexerFromStringArray } from '../grammar/MmLexerFromStringArray';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmParser } from '../mm/MmParser';

export class RpnSyntaxTreeBuilder {
	mmParser: MmParser;
	grammar: Grammar;

	constructor(mmParser: MmParser) {
		this.mmParser = mmParser;
		this.grammar = this.mmParser.outermostBlock.grammar!;
	}

		//#region buildRpnSyntaxTree

	/** builds a rpn string representing the syntax tree of the given formula */
	buildRpnSyntaxTreeFromParseNode(parseNode: ParseNode, currentLevel: number, maxLevel: number): string {
		let treeString = '';
		// we don't want to consider FHyps labels
		// if (currentLevel <= maxLevel && parseNode instanceof InternalNode && !this._fHypLabels.has(parseNode.label)) {
		if (currentLevel <= maxLevel && parseNode instanceof InternalNode && 
			!GrammarManager.isInternalParseNodeForFHyp(parseNode,this.mmParser.outermostBlock.v)
			&& !GrammarManager.isInternalParseNodeForWorkingVar(parseNode)) {
			parseNode.parseNodes.forEach((childNode: ParseNode) => {
				const subTree: string = this.buildRpnSyntaxTreeFromParseNode(childNode, currentLevel + 1, maxLevel);
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
	buildRpnSyntaxTreeFromFormula(assertionStatementWithSubstitution: string[], grammar: Grammar): string {
		// const parseNode: ParseNode = assertionStatementProofStep.parseNode;
		// const grammar: Grammar = assertionStatementProofStep.outermostBlock!.grammar!;
		grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		const parser = new Parser(grammar);
		parser.feed('');
		const parseNode: ParseNode = parser.results[0];
		const rpnSyntaxTree: string = this.buildRpnSyntaxTreeFromParseNode(parseNode, 0, 3);
		return rpnSyntaxTree;
	}
	//#endregion buildRpnSyntaxTree
}