import { CompletionItem } from 'vscode-languageserver';
import { MmParser } from '../mm/MmParser';
import { CompletionProviderForEmptyLine } from '../mmp/CompletionProviderForEmptyLine';
import { CursorContext, CursorContextForCompletion } from '../mmp/CursorContext';
import { MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap } from './GlobalForTest.test';

test("MmpStatement suggestion for empty line", () => {
	const mmParser: MmParser = mp2MmParser;
	const mmpSource = `\


qed: |- ps`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(mmpParser.mmpProof?.mmpStatements.length).toBe(1);
	const cursorContext: CursorContext = new CursorContext(1, 0, mmpParser);
	cursorContext.buildContext();
	expect(cursorContext.contextForCompletion).toBe(CursorContextForCompletion.firstCharacterOfAnEmptyALine);
	const completionProvider: CompletionProviderForEmptyLine =
		new CompletionProviderForEmptyLine(cursorContext, mmpParser);
	const completionItems: CompletionItem[] = completionProvider.completionItems();
	expect(completionItems.length).toBe(3);
	expect(completionItems[0].label).toEqual('$theorem ');
	// expect(completionItems[0].kind).toBe(CompletionItemKind.Text);
	expect(completionItems[1].label).toEqual('$getproof ');
	expect(completionItems[2].label).toEqual('$allowdiscouraged ');
});

test("No suggestion for $theorem, because it is already present", () => {
	const mmParser: MmParser = mp2MmParser;
	const mmpSource = `\
$theorem test

qed: |- ps`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(mmpParser.mmpProof?.mmpStatements.length).toBe(2);
	const cursorContext: CursorContext = new CursorContext(1, 0, mmpParser);
	cursorContext.buildContext();
	expect(cursorContext.contextForCompletion).toBe(CursorContextForCompletion.firstCharacterOfAnEmptyALine);
	const completionProvider: CompletionProviderForEmptyLine =
		new CompletionProviderForEmptyLine(cursorContext, mmpParser);
	const completionItems: CompletionItem[] = completionProvider.completionItems();
	expect(completionItems.length).toBe(2);
	expect(completionItems[0].label).toEqual('$getproof ');
	expect(completionItems[1].label).toEqual('$allowdiscouraged ');
});

test("MmpStatement suggestion when $ is inserted", () => {

	const mmParser: MmParser = mp2MmParser;
	const mmpSource = `\

$
qed: |- ps`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(mmpParser.mmpProof?.mmpStatements.length).toBe(1);
	const cursorContext: CursorContext = new CursorContext(1, 1, mmpParser);
	cursorContext.buildContext();
	expect(cursorContext.contextForCompletion).toBe(CursorContextForCompletion.firstCharacterOfAnEmptyALine);
	const completionProvider: CompletionProviderForEmptyLine =
		new CompletionProviderForEmptyLine(cursorContext, mmpParser);
	const completionItems: CompletionItem[] = completionProvider.completionItems();
	expect(completionItems.length).toBe(3);
	expect(completionItems[0].label).toEqual('$theorem ');
	// expect(completionItems[0].kind).toBe(CompletionItemKind.Text);
	expect(completionItems[1].label).toEqual('$getproof ');
	expect(completionItems[2].label).toEqual('$allowdiscouraged ');
});