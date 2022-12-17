import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { eqeq1iMmParser, kindToPrefixMap, mp2MmParser } from './GlobalForTest.test';

test('StepDerivation ax-mp', () => {
	const mmpSource =
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
		'h1::test.1          |- ps\n' +
		'h2::test.2          |- ( ps -> ph )\n' +
		'3:1,2:ax-mp        |- ph\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation ax-mp wrong EHyps order', () => {
	const mmpSource =
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
		'h1::test.1          |- ps\n' +
		'h2::test.2          |- ( ps -> ph )\n' +
		'3:1,2:ax-mp        |- ph\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation ax-ext', () => {
	const mmpSource =
		'50:: |- ( A. x ( x e. y <-> x e. z ) -> y = z )\n' +
		'qed:50:df-cleq |- ( A = B <-> A. x ( x e. A <-> x e. B ) )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 100);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'50::ax-ext          |- ( A. x ( x e. y <-> x e. z ) -> y = z )\n' +
		'qed:50:df-cleq     |- ( A = B <-> A. x ( x e. A <-> x e. B ) )\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation 3syl', () => {
	const mmpSource =
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
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('StepDerivation wrong EHyps order and missing single EHyp', () => {
	const mmpSource =
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
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('Worker Thread for ParseNode(s) creation', async () => {
	const mmpSource =
		'2::                |- ( ph -> &W2 )\n' +
		'3::                |- ( &W2 -> &W3 )\n' +
		'4::                |- ( &W3 -> ps )\n' +
		'5:4,2:               |- ( ph -> ps )\n' +
		'qed::a |- ch';
	//TODO1
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
		'2::                 |- ( ph -> &W2 )\n' +
		'3::                 |- ( &W2 -> &W3 )\n' +
		'4::                 |- ( &W3 -> ps )\n' +
		'5:2,3,4:3syl       |- ( ph -> ps )\n' +
		'qed::a             |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});