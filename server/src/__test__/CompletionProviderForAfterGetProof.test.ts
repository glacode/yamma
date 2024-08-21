import { CompletionItem } from 'vscode-languageserver';
import { MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap } from './GlobalForTest.test';
import { CursorContext, CursorContextForCompletion } from '../mmp/CursorContext';
import { CompletionProviderForAfterGetProof } from '../mmp/CompletionProviderForAfterGetProof';

test("CompletionProviderForAfterGetProof 1", () => {
	const mmpSource = `\
$theorem test
$getproof 
qed:: |- ph`;

	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const cursorContext: CursorContext = new CursorContext(1, 10, mmpParser);
	cursorContext.buildContext();
	expect(cursorContext.contextForCompletion).toBe(CursorContextForCompletion.afterGetProof);
	const cursorContext2: CursorContext = new CursorContext(1, 9, mmpParser);
	cursorContext2.buildContext();
	expect(cursorContext2.contextForCompletion).toBe(CursorContextForCompletion.firstCharacterOfAnEmptyALine);
	const completionProvider: CompletionProviderForAfterGetProof =
		new CompletionProviderForAfterGetProof(cursorContext, mmpParser);
	const completionItems: CompletionItem[] = completionProvider.completionItems();
	expect(completionItems.length).toBe(1);
	const completionItem: CompletionItem = completionItems[0];
	//TODO1 27 MAY 2023 ax-mp is not a $p statement, you should return $p statements only
	expect(completionItem.label).toBe('ax-mp');
});

test("CompletionProviderForAfterGetProof partial label", () => {
	const mmpSource = `\
$theorem test
$getproof b
qed:: |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const cursorContext: CursorContext = new CursorContext(1, 10, mmpParser);
	cursorContext.buildContext();
	expect(cursorContext.contextForCompletion).toBe(CursorContextForCompletion.afterGetProof);
	const cursorContext2: CursorContext = new CursorContext(1, 9, mmpParser);
	cursorContext2.buildContext();
	expect(cursorContext2.contextForCompletion).toBeUndefined();
	const completionProvider: CompletionProviderForAfterGetProof =
		new CompletionProviderForAfterGetProof(cursorContext, mmpParser);
	const completionItems: CompletionItem[] = completionProvider.completionItems();
	expect(completionItems.length).toBe(0);
});