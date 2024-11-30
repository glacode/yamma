import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap } from './GlobalForTest.test';

test('Remove 3rd and 4th proof steps', () => {
	const mmpSource = `
* test comment

h1::a |- ps
h2::b |- ( ps -> ph )
3:: |- ( ps -> ph )
4:: |- ( ps -> ph )
5:1,3:ax-mp |- ph
qed::d |- ps
`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{ mmpParser: mmpParser, proofMode: ProofMode.normal, maxNumberOfHypothesisDispositionsForStepDerivation: 0 });
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

h1::a               |- ps
h2::b               |- ( ps -> ph )
5:1,2:ax-mp        |- ph
qed::d             |- ps
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Remove 3 after working var unification', () => {
	const mmpSource = `
* test comment

h1::a |- ps
h2::b               |- ( ps -> ph )
3:: |- &W1
5:1,3:ax-mp |- ph
qed::d |- ps
`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{ mmpParser: mmpParser, proofMode: ProofMode.normal, maxNumberOfHypothesisDispositionsForStepDerivation: 0 });
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

h1::a               |- ps
h2::b               |- ( ps -> ph )
5:1,2:ax-mp        |- ph
qed::d             |- ps
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});