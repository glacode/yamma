import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmParser } from '../mm/MmParser';
import { IFormulaClassifier } from './IFormulaClassifier';

/** given a formula and a MmParser, returns the syntax tree of the formula,
as a string representation in rpn format; it returns a "meaningful"
classification only if the given formula is in the form ( ph -> ps ) ; if
it's the case, than this classifier looks the ps formula only.
This classifier is set.mm specific (or, at least, assumes implications are
part of the teory).
For instance, '|- ( B e. V -> dom { <. A , B >. } = { A } )' with maxLevel 2
will be classified with 'csn cdm class csn wceq'; with maxLevel 3 will
be classified with 'cop csn cdm class csn wceq'
*/
export class SyntaxTreeClassifierImp implements IFormulaClassifier {
	maxLevel: number;
	id: string;

	// constructor(mmParser: MmParser) {
	// 	this.mmParser = mmParser;
	// 	this.grammar = this.mmParser.outermostBlock.grammar!;
	/**
	 * 
	 * @param maxLevel the zero-based max level of the syntax tree produced
	 */
	constructor(maxLevel: number) {
		// implication, 3 levels of the consequent
		this.maxLevel = maxLevel;
		this.id = 'imp' + maxLevel;
	}

	//#region classify

	/** builds a rpn string representing the syntax tree of the given formula */
	private buildRpnSyntaxTreeFromParseNode(parseNode: ParseNode, mmParser: MmParser, currentLevel: number, maxLevel: number): string {
		let treeString = '';
		let nodeLabelOrCluster: string | undefined;
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
	isImplication(parseNode: ParseNode): boolean {
		const result: boolean = parseNode instanceof InternalNode &&
			parseNode.label == 'TOP' && parseNode.parseNodes.length == 2 &&
			parseNode.parseNodes[1] instanceof InternalNode &&
			parseNode.parseNodes[1].label == 'wi';
		return result;
	}
	classify(parseNode: ParseNode, mmParser: MmParser): string | undefined {
		// const parseNode: ParseNode = assertionStatementProofStep.parseNode;
		// const grammar: Grammar = assertionStatementProofStep.outermostBlock!.grammar!;
		// let rpnSyntaxTree = '';
		// this.mmParser.grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		// mmParser.grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		// const parser = new Parser(this.mmParser.grammar);
		// const parser = new Parser(mmParser.grammar);
		// parser.feed('');
		// const parseNode: ParseNode = parser.results[0];
		let rpnSyntaxTree : string | undefined;
		if (this.isImplication(parseNode)) {
			const wiParseNode: InternalNode = <InternalNode>(<InternalNode>parseNode).parseNodes[1];
			const consequent: ParseNode = wiParseNode.parseNodes[3];
			rpnSyntaxTree = this.buildRpnSyntaxTreeFromParseNode(consequent, mmParser, 0, this.maxLevel);
		}
		return rpnSyntaxTree;
	}
	//#endregion classify
}