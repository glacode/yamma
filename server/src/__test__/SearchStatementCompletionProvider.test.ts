import { CompletionItem, Range, TextEdit } from 'vscode-languageserver';
import { MmpParser } from '../mmp/MmpParser';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';
import { WorkingVars } from '../mmp/WorkingVars';
import { SearchStatementCompletionProvider } from '../search/SearchStatementCompletionProvider';
import { kindToPrefixMap } from './GlobalForTest.test';
import { mp2Parser, mp2Statistics } from './MmpParser.test';

test("SearchStatementCompletionProvider 1", () => {
	const mmpSource: string =
		'h50::hyp1 |- ph\n' +
		'51::      |- ps\n' +
		'SearchSymbols: ps   SearchComment: \n' +
		'qed:: |- ph';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2Parser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const mmpSearchStatement: MmpSearchStatement = <MmpSearchStatement>mmpParser.uProof!.uStatements[2];
	const searchStatementCompletionProvider: SearchStatementCompletionProvider =
		new SearchStatementCompletionProvider(mmpSearchStatement, mp2Statistics);
	const completionItems: CompletionItem[] = searchStatementCompletionProvider.completionItems();
	const completionItem: CompletionItem = completionItems[0];
	expect(completionItem.label).toBe('ax-mp');
	expect(completionItem.additionalTextEdits?.length).toBe(1);
	const additionalTextEdit: TextEdit = completionItem.additionalTextEdits![0];
	const expectedRange: Range = Range.create(1, 0, 1, 0);
	expect(additionalTextEdit.range).toEqual(expectedRange);
	expect(additionalTextEdit.newText).toEqual('ax-mp\n');
});