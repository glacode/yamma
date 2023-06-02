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
	const mmpSource =
		'\n* test comment\n\n' +
		'h1::test.1 |- ps\n' +
		'h2::test.2 |- ( ps -> ph )\n' +
		'3:: |- ph\n' +
		'qed:: |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'h1::test.1          |- ps\n' +
		'h2::test.2          |- ( ps -> ph )\n' +
		'3:1,2:ax-mp        |- ph\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation ax-mp wrong EHyps order', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'h1::test.1 |- ps\n' +
		'h2::test.2 |- ( ps -> ph )\n' +
		'3:2,1: |- ph\n' +
		'qed:: |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'h1::test.1          |- ps\n' +
		'h2::test.2          |- ( ps -> ph )\n' +
		'3:1,2:ax-mp        |- ph\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation ax-ext', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'50:: |- ( A. x ( x e. y <-> x e. z ) -> y = z )\n' +
		'qed:50:df-cleq |- ( A = B <-> A. x ( x e. A <-> x e. B ) )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'50::ax-ext          |- ( A. x ( x e. y <-> x e. z ) -> y = z )\n' +
		'qed:50:df-cleq     |- ( A = B <-> A. x ( x e. A <-> x e. B ) )\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation 3syl', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'2::                |- ( ph -> &W2 )\n' +
		'3::                |- ( &W2 -> &W3 )\n' +
		'4::                |- ( &W3 -> ps )\n' +
		'5::               |- ( ph -> ps )\n' +
		'qed::a |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation wrong EHyps order and missing single EHyp', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'2::                |- ( ph -> &W2 )\n' +
		'3::                |- ( &W2 -> &W3 )\n' +
		'4::                |- ( &W3 -> ps )\n' +
		'5:4,2:               |- ( ph -> ps )\n' +
		'qed::a |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('Worker Thread for ParseNode(s) creation', async () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'2::                |- ( ph -> &W2 )\n' +
		'3::                |- ( &W2 -> &W3 )\n' +
		'4::                |- ( &W3 -> ps )\n' +
		'5:4,2:               |- ( ph -> ps )\n' +
		'qed::a |- ch';
	const mmParser: MmParser = eqeq1iMmParser;
	mmParser.areAllParseNodesComplete = false;
	mmParser.createParseNodesForAssertionsAsync();
	while (!mmParser.areAllParseNodesComplete)
		await new Promise(r => setTimeout(r, 10));
	// await new Promise(r => setTimeout(r, 1000));
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation syl2anc', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd9::  |- ( ph -> ch )\n' +
		'd10:: |- ( ph -> ps )\n' +
		'a::   |- ( ( ta /\\ ps ) -> th )\n' +
		'b::   |- ( ( ta /\\ ps ) -> ch )\n' +
		'd11:: |- ( ( ch /\\ ps ) -> th )\n' +
		'd8:   |- ( ph -> th )\n' +
		'qed:: |- ch\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'd9::                |- ( ph -> ch )\n' +
		'd10::               |- ( ph -> ps )\n' +
		'a::                |- ( ( ta /\\ ps ) -> th )\n' +
		'b::                |- ( ( ta /\\ ps ) -> ch )\n' +
		'd11::               |- ( ( ch /\\ ps ) -> th )\n' +
		'd8:d9,d10,d11:syl2anc\n' +
		'                   |- ( ph -> th )\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation elexd', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd13:: |- ( ph -> A e. B )\n' +
		'd12:  |- ( ph -> A e. _V )\n' +
		'qed:: |- ch\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'd13::               |- ( ph -> A e. B )\n' +
		'd12:d13:elexd      |- ( ph -> A e. _V )\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation unknown eHyp ref', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'2::                |- ( ph -> &W2 )\n' +
		'3::                |- ( &W2 -> &W3 )\n' +
		'4::                |- ( &W3 -> ps )\n' +
		'5:9,2:               |- ( ph -> ps )\n' +
		'qed::a |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('Derive eHps for existing label', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd1:: |- &W1\n' +
		'd2:: |- ( &W1 -> ph )\n' +
		'qed::ax-mp |- ph';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 1000);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'\n* test comment\n\n' +
		'd1::                |- &W1\n' +
		'd2::                |- ( &W1 -> ph )\n' +
		'qed:d1,d2:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Derive from wrong eHps and existing label', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd1:: |- &W1\n' +
		'd2:: |- ( &W1 -> ph )\n' +
		'qed:d2,d1:ax-mp |- ph';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 1000);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'\n* test comment\n\n' +
		'd1::                |- &W1\n' +
		'd2::                |- ( &W1 -> ph )\n' +
		'qed:d1,d2:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Derive 1 of 2 eHyps', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd1:: |- &W1\n' +
		'd2:: |- ( &W1 -> ph )\n' +
		'qed:,d2:ax-mp |- ph';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 1000);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'\n* test comment\n\n' +
		'd1::                |- &W1\n' +
		'd2::                |- ( &W1 -> ph )\n' +
		'qed:d1,d2:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Derive 2 eHps when 3 are given', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd1:: |- &W1\n' +
		'd2:: |- ( &W1 -> ph )\n' +
		'qed:d1,d1,d1:ax-mp |- ph';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 1000);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'\n* test comment\n\n' +
		'd1::                |- &W1\n' +
		'd2::                |- ( &W1 -> ph )\n' +
		'qed:d1,d2:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('EHyps derivation, incomplete and with unknown eHyp ref', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'2::                |- ( ph -> &W2 )\n' +
		'3::                |- ( &W2 -> &W3 )\n' +
		'4::                |- ( &W3 -> ps )\n' +
		'5:9,:3syl               |- ( ph -> ps )\n' +
		'qed::a |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('Derive eHyps for complete (but wrong) existing refs', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd1:: |- &W1\n' +
		'd2:: |- ( &W1 -> ph )\n' +
		'a:: |-ch\n' +
		'qed:a,d1:ax-mp |- ph';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 1000);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'\n* test comment\n\n' +
		'd1::                |- &W1\n' +
		'd2::                |- ( &W1 -> ph )\n' +
		'a::                |-ch\n' +
		'qed:d1,d2:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('StepDerivation for nonexistent label', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'2:: |- ( ph -> &W2 )\n' +
		'3:: |- ( &W2 -> &W3 )\n' +
		'4:: |- ( &W3 -> ps )\n' +
		'5::a |- ( ph -> ps )\n' +
		'qed::b |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::b             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('Ehyps derivation for given label, with working var', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'd2::                |- &W2\n' +
		'd3::                |- ( &W2 -> &W1 )\n' +
		'd1:d3,d2:ax-mp     |- &W1\n' +
		'qed::b |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'd2::                |- &W2\n' +
		'd3::                |- ( &W2 -> &W1 )\n' +
		'd1:d2,d3:ax-mp     |- &W1\n' +
		'qed::b             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

// this was failing, because in the syl statement, the ch logical var
// is expected to be substituted in the $p statement, and the
// first version of the code didn't do it
test('Ehyps derivation 3 with a candidate without a parse node', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'a\n' +
		'qed::  |- ( ph -> ps )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'::a\n' +
		'qed::              |- ( ph -> ps )\n';
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
	const mmpSource =
		'\n* test comment\n\n' +
		'1::a1i   |- ( ph -> ch )\n' +
		'qed:       |- ps';
	const mmpParser: MmpParser = new MmpParser(mmpSource, a1iiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'd1::                |- ch\n' +
		'1:d1:a1i           |- ( ph -> ch )\n' +
		'qed::              |- ps\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('Step derivation at step 3 must not be tried because there is no formula', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'1::                 |- ps\n' +
		'2::                |- ch\n' +
		'3:1,2:ax-mp\n' +
		'qed::b             |- ch\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* test comment\n\n' +
		'1::                 |- ps\n' +
		'2::                 |- ch\n' +
		'3:1,2:ax-mp\n' +
		'qed::b             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});