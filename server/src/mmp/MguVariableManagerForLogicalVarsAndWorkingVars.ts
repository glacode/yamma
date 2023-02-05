import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MguVariableManager } from './MguFinder';

export class MguVariableManagerForLogicalVarsAndWorkingVars implements MguVariableManager {

	private parseNodesForLogicalVariables: Set<InternalNode>;

	constructor(assertionParseNode: InternalNode, private logicalVariables: Set<string>) {
		this.parseNodesForLogicalVariables = new Set<InternalNode>();
		this.addParseNodesForLogicalVariables(assertionParseNode);
	}
	addParseNodesForLogicalVariables(parseNode: InternalNode) {
		if (GrammarManager.isInternalParseNodeForFHyp(parseNode, this.logicalVariables))
			this.parseNodesForLogicalVariables.add(parseNode);
		parseNode.parseNodes.forEach((parseNode: ParseNode) => {
			if (parseNode instanceof InternalNode)
				this.addParseNodesForLogicalVariables(parseNode);
		});
	}
	isInternalNodeForVariable(parseNode: ParseNode): boolean {
		const isInternalNodeForVar = parseNode instanceof InternalNode &&
			(this.parseNodesForLogicalVariables.has(parseNode) ||
				GrammarManager.isInternalParseNodeForWorkingVar(parseNode));
		return isInternalNodeForVar;
	}
}