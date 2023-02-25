import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap } from './GlobalForTest.test';

test('Remove 3rd and 4th proof steps', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'h1::a |- ps\n' +
		'h2::b |- ( ps -> ph )\n' +
		'3:: |- ( ps -> ph )\n' +
		'4:: |- ( ps -> ph )\n' +
		'5:1,3:ax-mp |- ph\n' +
		'qed::d |- ps\n';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'\n* test comment\n\n' +
		'h1::a               |- ps\n' +
		'h2::b               |- ( ps -> ph )\n' +
		'5:1,2:ax-mp        |- ph\n' +
		'qed::d             |- ps\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

//TODO1 feb 24
test('Remove 3 after working var unification', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'h1::a |- ps\n' +
		'h2::b               |- ( ps -> ph )\n' +
		'3:: |- &W1\n' +
		'5:1,3:ax-mp |- ph\n' +
		'qed::d |- ps\n';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'\n* test comment\n\n' +
		'h1::a               |- ps\n' +
		'h2::b               |- ( ps -> ph )\n' +
		'5:1,2:ax-mp        |- ph\n' +
		'qed::d             |- ps\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});