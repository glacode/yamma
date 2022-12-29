import { GrammarManager, MmpRule } from '../grammar/GrammarManager';
import { InternalNode } from '../grammar/ParseNode';
import { LabeledStatement } from '../mm/LabeledStatement';
import { MmParser } from '../mm/MmParser';
import { GrammarManagerForThread, IMmpRuleForThread } from '../parseNodesCreatorThread/GrammarManagerForThread';
import { ParseNodeForThread } from '../parseNodesCreatorThread/ParseNodeForThread';
import { addParseNodes, createLabelToFormulaMap, createLabelToParseNodeForThreadMap } from '../parseNodesCreatorThread/ParseNodesCreator';
import { eqeq1iMmParser } from './GlobalForTest.test';


function buildParseNodesSimulated(mmParser: MmParser) {
	const labelToFormulaMap: Map<string, string> = createLabelToFormulaMap(mmParser);
	const mmpRulesForThread: IMmpRuleForThread[] =
		GrammarManagerForThread.convertMmpRules(<MmpRule[]>mmParser.grammar.rules);
	const labelToParseNodeForThreadMap: Map<string, ParseNodeForThread> = createLabelToParseNodeForThreadMap(labelToFormulaMap, mmpRulesForThread);
	addParseNodes(labelToParseNodeForThreadMap, mmParser.labelToStatementMap);
}

test("Simulate working thread serialization, deserialization", () => {
	const mmParser: MmParser = eqeq1iMmParser;

	mmParser.createParseNodesForAssertionsSync();
	const dummyNode: InternalNode = new InternalNode('dummy', 'dummy', []);
	const labelToParseNode: Map<string, InternalNode> = new Map<string, InternalNode>();
	mmParser.labelToStatementMap.forEach((labeledStatement: LabeledStatement, label: string) => {
		if (MmParser.isParsable(labeledStatement)) {
			labelToParseNode.set(label, labeledStatement.parseNode);
			labeledStatement.setParseNode(dummyNode);

		}
	});
	buildParseNodesSimulated(mmParser);
	const parseNode: InternalNode = labelToParseNode.get('axext3')!;
	const parseNodeSimulated: InternalNode = mmParser.labelToStatementMap.get('axext3')!.parseNode;
	const areEqual: boolean = GrammarManager.areParseNodesEqual(parseNode, parseNodeSimulated);
	expect(areEqual).toBeTruthy();
});
