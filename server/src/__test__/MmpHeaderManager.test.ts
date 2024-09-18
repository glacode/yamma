import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { impbiiMmParser, kindToPrefixMap } from './GlobalForTest.test';

test('expect default comment to be added', () => {
	const mmpSource = `
h50: |- ps
a::a1i |- &W1
qed:: |- ch
`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{ mmpParser: mmpParser, proofMode: ProofMode.normal, maxNumberOfHypothesisDispositionsForStepDerivation: 0, renumber: true });
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* MissingComment

h1::               |- ps
2::                 |- &W2
3:2:a1i            |- ( &W3 -> &W2 )
qed::              |- ch
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('expect $theorem example to be added', () => {
	const mmpSource = `
* test comment

1: |- ps
2::a1i |- &W1
qed:: |- ch
`;

	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0, false, "example");
	const mmpUnifier: MmpUnifier = new MmpUnifier({
		mmpParser: mmpParser, proofMode: ProofMode.normal,
		maxNumberOfHypothesisDispositionsForStepDerivation: 0, expectedTheoremLabel: "example"
	});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);

	const newTextExpected = `\
$theorem example

* test comment

1::                |- ps
d1::                |- &W2
2:d1:a1i           |- ( &W3 -> &W2 )
qed::              |- ch
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});