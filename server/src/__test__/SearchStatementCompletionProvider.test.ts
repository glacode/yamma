import { CompletionItem, Range, TextEdit } from 'vscode-languageserver';
import { MmpParser } from '../mmp/MmpParser';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';
import { WorkingVars } from '../mmp/WorkingVars';
import { SearchStatementCompletionProvider } from '../search/SearchStatementCompletionProvider';
import { kindToPrefixMap, mp2MmParser, mp2Statistics, opelcnMmParser, opelcnStatistics, vexStatistics, vexTheoryMmParser } from './GlobalForTest.test';

//TODO1 mar 7
test("SearchStatementCompletionProvider 1", () => {
	const mmpSource: string =
		'h50::hyp1 |- ph\n' +
		'51::      |- ps\n' +
		'SearchSymbols: ps   SearchComment: \n' +
		'qed:: |- ph';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, mp2Statistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	const completionItem: CompletionItem = completionItems[0];
	expect(completionItem.label).toBe('ax-mp');
	expect(completionItem.additionalTextEdits?.length).toBe(1);
	const additionalTextEdit: TextEdit = completionItem.additionalTextEdits![0];
	const expectedRange: Range = Range.create(1, 0, 1, 0);
	expect(additionalTextEdit.range).toEqual(expectedRange);
	expect(additionalTextEdit.newText).toEqual('ax-mp\n');
});

test("SearchStatementCompletionProvider empty", () => {
	const mmpSource: string =
		'h50::hyp1 |- ph\n' +
		'51::      |- ps\n' +
		'SearchSymbols: ps nonexistent   SearchComment: \n' +
		'qed:: |- ph';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, mp2Statistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	expect(completionItems.length).toBe(1);
	const completionItem: CompletionItem = completionItems[0];
	expect(completionItem.label).toBe('No Assertion Found');
});

test("SearchStatementCompletionProvider multiline", () => {
	const mmpSource: string =
		'h50::hyp1 |- ph\n' +
		'51::      |- ( ps \n' +
		'              -> ph )\n' +
		'SearchSymbols: ps   SearchComment: \n' +
		'qed:: |- ph';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, mp2Statistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	const completionItem: CompletionItem = completionItems[0];
	expect(completionItem.label).toBe('ax-mp');
	expect(completionItem.additionalTextEdits?.length).toBe(1);
	const additionalTextEdit: TextEdit = completionItem.additionalTextEdits![0];
	const expectedRange: Range = Range.create(1, 0, 1, 0);
	expect(additionalTextEdit.range).toEqual(expectedRange);
	expect(additionalTextEdit.newText).toEqual('ax-mp\n');
	const lineForLabelInsertion = completionItem.command!.arguments![0][3];
	expect(lineForLabelInsertion).toBe(1);
});

test("SearchStatementCompletionProvider with symbol in EHyp", () => {
	const mmpSource: string =
		'h50::hyp1 |- ph\n' +
		'51::      |- ps\n' +
		'SearchSymbols: | A  SearchComment: \n' +
		'qed:: |- ph';
	const mmpParser: MmpParser = new MmpParser(mmpSource, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, vexStatistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	expect(completionItems.length).toBe(2);
	const completionItem: CompletionItem = completionItems[0];
	expect(completionItem.label).toBe('abeq2d');
	expect(completionItems[1].label).toBe('abeq2i');
});

test("SearchStatementCompletionProvider for exact string", () => {
	const mmpSource: string =
		"h50::hyp1 |- ph\n" +
		"51::      |- ps\n" +
		"SearchSymbols: ' ( A X. B ) ' SearchComment: \n" +
		"qed:: |- ph";
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, opelcnStatistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	expect(completionItems.length).toBe(1);
	const completionItem: CompletionItem = completionItems[0];
	expect(completionItem.label).toBe('df-xp');
});