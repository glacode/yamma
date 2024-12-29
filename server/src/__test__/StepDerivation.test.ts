import { TextEdit } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { AssertionStatement } from '../mm/AssertionStatement';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { elexdMmParser, eqeq1iMmParser, kindToPrefixMap, mp2MmParser, opelcnMmParser, readTestFile } from './GlobalForTest.test';

test('StepDerivation ax-mp', () => {
	const mmpSource = `
* test comment

h1::test.1 |- ps
h2::test.2 |- ( ps -> ph )
3:: |- ph
qed:: |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

h1::test.1          |- ps
h2::test.2          |- ( ps -> ph )
3:1,2:ax-mp        |- ph
qed::              |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation ax-mp wrong EHyps order', () => {
	const mmpSource = `
* test comment

h1::test.1 |- ps
h2::test.2 |- ( ps -> ph )
3:2,1: |- ph
qed:: |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

h1::test.1          |- ps
h2::test.2          |- ( ps -> ph )
3:1,2:ax-mp        |- ph
qed::              |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation ax-ext', () => {
	const mmpSource = `
* test comment

50:: |- ( A. x ( x e. y <-> x e. z ) -> y = z )
qed:50:df-cleq |- ( A = B <-> A. x ( x e. A <-> x e. B ) )`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

50::ax-ext          |- ( A. x ( x e. y <-> x e. z ) -> y = z )
qed:50:df-cleq     |- ( A = B <-> A. x ( x e. A <-> x e. B ) )
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation 3syl', () => {
	const mmpSource = `
* test comment

2::                |- ( ph -> &W2 )
3::                |- ( &W2 -> &W3 )
4::                |- ( &W3 -> ps )
5::               |- ( ph -> ps )
qed::a |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

2::                 |- ( ph -> &W2 )
3::                 |- ( &W2 -> &W3 )
4::                 |- ( &W3 -> ps )
5:2,3,4:3syl       |- ( ph -> ps )
qed::a             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation wrong EHyps order and missing single EHyp', () => {
	const mmpSource = `
* test comment

2::                |- ( ph -> &W2 )
3::                |- ( &W2 -> &W3 )
4::                |- ( &W3 -> ps )
5:4,2:               |- ( ph -> ps )
qed::a |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

2::                 |- ( ph -> &W2 )
3::                 |- ( &W2 -> &W3 )
4::                 |- ( &W3 -> ps )
5:2,3,4:3syl       |- ( ph -> ps )
qed::a             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('Worker Thread for ParseNode(s) creation', async () => {
	const mmpSource = `
* test comment

2::                |- ( ph -> &W2 )
3::                |- ( &W2 -> &W3 )
4::                |- ( &W3 -> ps )
5:4,2:               |- ( ph -> ps )
qed::a |- ch`;
	const mmParser: MmParser = eqeq1iMmParser;
	mmParser.areAllParseNodesComplete = false;
	mmParser.createParseNodesForAssertionsAsync();
	while (!mmParser.areAllParseNodesComplete)
		await new Promise(r => setTimeout(r, 10));
	// await new Promise(r => setTimeout(r, 1000));
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

2::                 |- ( ph -> &W2 )
3::                 |- ( &W2 -> &W3 )
4::                 |- ( &W3 -> ps )
5:2,3,4:3syl       |- ( ph -> ps )
qed::a             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation syl2anc', () => {
	const mmpSource = `
* test comment

d9::  |- ( ph -> ch )
d10:: |- ( ph -> ps )
a::   |- ( ( ta /\\ ps ) -> th )
b::   |- ( ( ta /\\ ps ) -> ch )
d11:: |- ( ( ch /\\ ps ) -> th )
d8:   |- ( ph -> th )
qed:: |- ch
`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

d9::                |- ( ph -> ch )
d10::               |- ( ph -> ps )
a::                |- ( ( ta /\\ ps ) -> th )
b::                |- ( ( ta /\\ ps ) -> ch )
d11::               |- ( ( ch /\\ ps ) -> th )
d8:d9,d10,d11:syl2anc
                   |- ( ph -> th )
qed::              |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation elexd', () => {
	const mmpSource = `
* test comment

d13:: |- ( ph -> A e. B )
d12:  |- ( ph -> A e. _V )
qed:: |- ch
`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

d13::               |- ( ph -> A e. B )
d12:d13:elexd      |- ( ph -> A e. _V )
qed::              |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation unknown eHyp ref', () => {
	const mmpSource = `
* test comment

2::                |- ( ph -> &W2 )
3::                |- ( &W2 -> &W3 )
4::                |- ( &W3 -> ps )
5:9,2:               |- ( ph -> ps )
qed::a |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

2::                 |- ( ph -> &W2 )
3::                 |- ( &W2 -> &W3 )
4::                 |- ( &W3 -> ps )
5:2,3,4:3syl       |- ( ph -> ps )
qed::a             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('Derive eHps for existing label', () => {
	const mmpSource = `
* test comment

d1:: |- &W1
d2:: |- ( &W1 -> ph )
qed::ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 1000,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

d1::                |- &W1
d2::                |- ( &W1 -> ph )
qed:d1,d2:ax-mp    |- ph
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Derive from wrong eHps and existing label', () => {
	const mmpSource = `
* test comment

d1:: |- &W1
d2:: |- ( &W1 -> ph )
qed:d2,d1:ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 1000,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

d1::                |- &W1
d2::                |- ( &W1 -> ph )
qed:d1,d2:ax-mp    |- ph
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Derive 1 of 2 eHyps', () => {
	const mmpSource = `
* test comment

d1:: |- &W1
d2:: |- ( &W1 -> ph )
qed:,d2:ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 1000,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

d1::                |- &W1
d2::                |- ( &W1 -> ph )
qed:d1,d2:ax-mp    |- ph
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Derive 2 eHps when 3 are given', () => {
	const mmpSource = `
* test comment

d1:: |- &W1
d2:: |- ( &W1 -> ph )
qed:d1,d1,d1:ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 1000,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

d1::                |- &W1
d2::                |- ( &W1 -> ph )
qed:d1,d2:ax-mp    |- ph
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('EHyps derivation, incomplete and with unknown eHyp ref', () => {
	const mmpSource = `
* test comment

2::                |- ( ph -> &W2 )
3::                |- ( &W2 -> &W3 )
4::                |- ( &W3 -> ps )
5:9,:3syl               |- ( ph -> ps )
qed::a |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 1000,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

2::                 |- ( ph -> &W2 )
3::                 |- ( &W2 -> &W3 )
4::                 |- ( &W3 -> ps )
5:2,3,4:3syl       |- ( ph -> ps )
qed::a             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('Derive eHyps for complete (but wrong) existing refs', () => {
	const mmpSource = `
* test comment

d1:: |- &W1
d2:: |- ( &W1 -> ph )
a:: |-ch
qed:a,d1:ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 1000,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

d1::                |- &W1
d2::                |- ( &W1 -> ph )
a::                |-ch
qed:d1,d2:ax-mp    |- ph
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('StepDerivation for nonexistent label', () => {
	const mmpSource = `
* test comment

2:: |- ( ph -> &W2 )
3:: |- ( &W2 -> &W3 )
4:: |- ( &W3 -> ps )
5::a |- ( ph -> ps )
qed::b |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

2::                 |- ( ph -> &W2 )
3::                 |- ( &W2 -> &W3 )
4::                 |- ( &W3 -> ps )
5:2,3,4:3syl       |- ( ph -> ps )
qed::b             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('Ehyps derivation for given label, with working var', () => {
	const mmpSource = `
* test comment

d2::                |- &W2
d3::                |- ( &W2 -> &W1 )
d1:d3,d2:ax-mp     |- &W1
qed::b |- ch`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 1000,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

d2::                |- &W2
d3::                |- ( &W2 -> &W1 )
d1:d2,d3:ax-mp     |- &W1
qed::b             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

// this was failing, because in the syl statement, the ch logical var
// is expected to be substituted in the $p statement, and the
// first version of the code didn't do it
test('Ehyps derivation 3 with a candidate without a parse node', () => {
	const mmpSource = `
* test comment

a
qed::  |- ( ph -> ps )`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

::a
qed::              |- ( ph -> ps )
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('a1ii should not be used to derive itself', () => {
	const impbiiTheory: string = readTestFile("impbii.mm");
	const a1iiTheory: string = impbiiTheory +
		'${ a1ii.1 $e |- ph $. a1ii.2 $e |- ps $. a1ii $p |- ph $= (  ) C $. $}';
	const a1iiMmParser: MmParser = new MmParser(new GlobalState());
	a1iiMmParser.ParseText(a1iiTheory);
	expect(a1iiMmParser.parseFailed).toBeFalsy();
	a1iiMmParser.createParseNodesForAssertionsSync();
	expect(a1iiMmParser.areAllParseNodesComplete).toBeTruthy();
	const a1iiAssertion: AssertionStatement | undefined = a1iiMmParser.labelToNonSyntaxAssertionMap.get('a1ii');
	expect(a1iiAssertion).toBeDefined();
	const mmpSource = `
* test comment

1::a1i   |- ( ph -> ch )
qed:       |- ps`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, a1iiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

d1::                |- ch
1:d1:a1i           |- ( ph -> ch )
qed::              |- ps
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('Step derivation at step 3 must not be tried because there is no formula', () => {
	const mmpSource = `
* test comment

1::                 |- ps
2::                |- ch
3:1,2:ax-mp
qed::b             |- ch
`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `
* test comment

1::                 |- ps
2::                 |- ch
3:1,2:ax-mp
qed::b             |- ch
`;
	expect(textEdit.newText).toEqual(expectedText);
});

test('Step derivation should NOT change the h2 label with nfv', () => {
	const mmpSource = `$theorem nfxfr
* Justa a test comment
h1::nfbii.1          |- ( ph <-> ps )
h2::nfxfr.2         |- F/ x ps
3:1:nfbii           |- ( F/ x ph <-> F/ x ps )
qed:2,3:mpbir      |- F/ x ph
`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 100,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = `$theorem nfxfr

* Justa a test comment

h1::nfbii.1          |- ( ph <-> ps )
h2::nfxfr.2         |- F/ x ps
3:1:nfbii           |- ( F/ x ph <-> F/ x ps )
qed:2,3:mpbir      |- F/ x ph

$=    wph vx wnf wps vx wnf nfxfr.2 wph wps vx nfbii.1 nfbii mpbir $.

`;
	expect(textEdit.newText).toEqual(expectedText);
});