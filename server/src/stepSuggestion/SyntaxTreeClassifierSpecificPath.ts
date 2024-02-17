import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmParser } from '../mm/MmParser';
import { IFormulaClassifier } from './IFormulaClassifier';

/** given a formula and a MmParser, returns the syntax tree of the formula,
as a string representation in rpn format; this classifier works with any
theory, it is NOT set.mm specific.


For instance, given set.mm, '|- ( ph -> ps )'
with path = [] it will return 'TOP'
with path = [1] it will return 'wi TOP'
with path = [1,3] it will return 'wff wi TOP'
with path = [1,3,1] it will return ''
with path = [1,1, 1, 0] it will still return ''

given '|- ( ph -> &W1 )'
with path = [1,3] it will return 'wff wi TOP'
with path = [1,3,1] it will return ''

given '|- E. x e. A ph'
with path = [] it will return 'TOP'
with path = [1] it will return 'wrex TOP'
with path = [1,4] it will return 'wff wrex TOP'

given '|- E. x e. A B = B'
with path = [1,4] it will return 'wceq wrex TOP'
*/
export class SyntaxTreeClassifierSpecificPath implements IFormulaClassifier {
	public id: string;
	/**
	 * 
	 * @param path a sequence of indexes of child nodes to be followed
	 */
	constructor(private path: number[]) {
		this.id = 'full' + path;
	}

	//#region classify

	/** builds a rpn string representing the syntax tree of the given formula */
	private buildRpnSyntaxTreeFromParseNode(parseNode: ParseNode, mmParser: MmParser, currentLevel: number): string | undefined {
		let treeString: string | undefined = '';
		let nodeLabelOrCluster: string | undefined;
		// if (currentLevel <= this.path.length && parseNode instanceof InternalNode) {
		if (parseNode instanceof InternalNode) {
			if (GrammarManager.isInternalParseNodeForWorkingVar(parseNode)
				&& currentLevel == this.path.length) {
				// working vars are clustered, i.e. replaced with their kind
				// the clause currentLevel == this.path.length is added because we don't path to match exactly
				// (this should be the last level)
				nodeLabelOrCluster = parseNode.kind;
			}
			else if (GrammarManager.isInternalParseNodeForFHyp(parseNode, mmParser.outermostBlock.v)
				&& currentLevel == this.path.length) {
				// FHyps labels are clustered, i.e. replaced with their kind
				// the clause currentLevel == this.path.length is added because we don't path to match exactly
				// (this should be the last level)
				nodeLabelOrCluster = parseNode.kind;
			} else {
				// parseNode is an InternalNode and it is neither a working var, nor
				// a Fhyp
				nodeLabelOrCluster = parseNode.label;

				if (currentLevel < this.path.length) {
					const currentChildNodeIndex: number = this.path[currentLevel];
					if (currentChildNodeIndex < parseNode.parseNodes.length) {
						// current node is 'compatible' whith the index requested
						const childNode: ParseNode = parseNode.parseNodes[currentChildNodeIndex];
						const subTree: string | undefined =
							this.buildRpnSyntaxTreeFromParseNode(childNode, mmParser, currentLevel + 1);
						if (subTree == undefined)
							treeString = undefined;
						else if (subTree != '') {
							if (treeString != '')
								treeString += ' ';
							treeString += subTree;
						}
					} else treeString = undefined; // TODO1 FEB 11 add else with undefined so that this formula is not compatible
				}

				if (treeString != undefined && treeString != '')
					treeString += ' ';
			}
			if (treeString != undefined)
				treeString += nodeLabelOrCluster;
		} else
			// ParseNode is a MmToken; this formula is not compatible with the path given
			treeString = undefined;
		return treeString;
	}

	classify(parseNode: InternalNode, mmParser: MmParser): string {
		const rpnSyntaxTree: string | undefined = this.buildRpnSyntaxTreeFromParseNode(parseNode, mmParser, 0);
		const output: string = rpnSyntaxTree != undefined ? rpnSyntaxTree : '';
		return output;
	}
	//#endregion classify
}