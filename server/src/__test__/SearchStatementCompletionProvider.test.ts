import { CompletionItem, Range, TextEdit } from 'vscode-languageserver';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';
import { WorkingVars } from '../mmp/WorkingVars';
import { SearchStatementCompletionProvider } from '../search/SearchStatementCompletionProvider';
import { kindToPrefixMap, mp2MmParser, mp2Statistics, opelcnMmParser, opelcnStatistics, vexStatistics, vexTheoryMmParser } from './GlobalForTest.test';

test("SearchStatementCompletionProvider 1", () => {
	const mmpSource = `h50::hyp1 |- ph
51::      |- ps
SearchSymbols: ps   SearchComment: 
qed:: |- ph`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
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
	const mmpSource = `\
h50::hyp1 |- ph
51::      |- ps
SearchSymbols: ps nonexistent   SearchComment: 
qed:: |- ph`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
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
	const mmpSource = `\
h50::hyp1 |- ph
51::      |- ( ps 
              -> ph )
SearchSymbols: ps   SearchComment: 
qed:: |- ph`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
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
	const mmpSource = `\
h50::hyp1 |- ph
51::      |- ps
SearchSymbols: | A  SearchComment: 
qed:: |- ph`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: vexTheoryMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
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
	const mmpSource = `\
h50::hyp1 |- ph
51::      |- ps
SearchSymbols: ' ( A X. B ) ' SearchComment: 
qed:: |- ph`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: opelcnMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, opelcnStatistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	expect(completionItems.length).toBe(1);
	const completionItem: CompletionItem = completionItems[0];
	expect(completionItem.label).toBe('df-xp');
});

test("SearchStatementCompletionProvider with exact match 2 using eHyps also", () => {
	const mmpSource = `\
50::       |- ps
51:        |- ch
SearchSymbols: 
  '  { x | ph } '   ' A e. V -> '   SearchComment: 
qed::      |- ph
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: opelcnMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, opelcnStatistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	expect(completionItems.length).toBe(2);
	expect(completionItems[0].label).toBe('elabg');
	expect(completionItems[1].label).toBe('elab2g');
});

test("SearchStatementCompletionProvider for single comment word", () => {
	const mmpSource = `\
h50::hyp1 |- ph
51::      |- ps
SearchSymbols: SearchComment: classes
qed:: |- ph`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: opelcnMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.mmpProof!.mmpStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mmpParser, opelcnStatistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	expect(completionItems.length).toBe(2);
	const completionItem0: CompletionItem = completionItems[0];
	expect(completionItem0.label).toBe('eqeltri');
});