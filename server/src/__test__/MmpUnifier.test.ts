import { Connection } from 'vscode-languageserver';
import { TextEdit } from 'vscode-languageserver-textdocument';
import { ConfigurationManager, IExtensionSettings, ProofMode, IVariableKindConfiguration } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { eqeq1iMmParser, impbiiMmParser, kindToPrefixMap, mp2MmParser, mp2Theory } from './GlobalForTest.test';
import { axmpTheory } from './MmParser.test';
import { vexTheoryMmParser } from './MmpProofStatement.test';


const exampleSettings: IExtensionSettings = {
	maxNumberOfProblems: 100,
	proofMode: ProofMode.normal,
	mmFileFullPath: '',
	variableKindsConfiguration: new Map<string, IVariableKindConfiguration>()
};

let dummyConnection: unknown;

export const exampleConfigurationManager: ConfigurationManager = new ConfigurationManager(true, true, exampleSettings, exampleSettings,
	<Connection>dummyConnection);

test('buildNewProof()', () => {
	const mmpSource =
		'ax-mp\n' +
		'qed:: |- ps';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	expect(mmpUnifier.uProof!.uStatements.length).toBe(2);
	expect((<MmpProofStep>mmpUnifier.uProof!.uStatements[0]).stepLabel).toEqual('ax-mp');
});

test('Unify ax-mp', () => {
	const mmpSource =
		'ax-mp\n' +
		'qed:: |- ps';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'd2::                |- &W1\n' +
		'd3::                |- ( &W1 -> &W2 )\n' +
		'd1:d2,d3:ax-mp     |- &W2\n' +
		'qed::              |- ps\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Unify 2 ax-mp', () => {
	const mmpSource =
		'qed::ax-mp |- ph';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'd1::                |- &W1\n' +
		'd2::                |- ( &W1 -> ph )\n' +
		'qed:d1,d2:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Unify 3 ax-mp', () => {
	const mmpSource =
		'50:: |- ( &W3 -> ph )\n' +
		'qed:,50:ax-mp |- ph';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'50::                |- ( &W3 -> ph )\n' +
		'd1::                |- &W3\n' +
		'qed:d1,50:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Unify with working var ax-mp', () => {
	const mmpSource =
		'h1::a |- ps\n' +
		'h2::b |- &W1\n' +
		'5:1,2:ax-mp |- ph\n' +
		'qed::d |- ps\n';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'h1::a               |- ps\n' +
		'h2::b               |- ( ps -> ph )\n' +
		'5:1,2:ax-mp        |- ph\n' +
		'qed::d             |- ps\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Unify double ax-mp', () => {
	const mmpSource =
		'50:ax-mp\n' +
		'qed:,50:ax-mp |- ph';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'd1::                 |- &W1\n' +
		'd2::                 |- ( &W1 -> ( &W3 -> ph ) )\n' +
		'50:d1,d2:ax-mp      |- ( &W3 -> ph )\n' +
		'd3::                |- &W3\n' +
		'qed:d3,50:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect new ref to be d7', () => {
	const mmpSource =
		'd6:: |- ( ps -> ph )\n' +
		'qed:,d6:ax-mp    |- ph\n';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'd6::                |- ( ps -> ph )\n' +
		'd7::                |- ps\n' +
		'qed:d7,d6:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect new working var to be &W4', () => {
	const mmpSource =
		'd1:: |- &W3\n' +
		'qed::ax-mp  |- ph';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'd1::               |- &W3\n' +
		'd2::                |- &W4\n' +
		'd3::                |- ( &W4 -> ph )\n' +
		'qed:d2,d3:ax-mp    |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Complete ax-mp', () => {
	const mmpSource =
		'qed:ax-mp |- ( ps -> ph )';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'd1::                |- &W1\n' +
		'd2::                |- ( &W1 -> ( ps -> ph ) )\n' +
		'qed:d1,d2:ax-mp    |- ( ps -> ph )\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect unify error to leave line unchanged', () => {
	const mmpSource =
		'ax-mp:: |- ( ch -> )\n' +
		'qed:: |- ps';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const newTextExpected =
		'ax-mp::            |- ( ch -> )\n' +
		'qed::              |- ps\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect 2 unify error to leave line unchanged', () => {
	// ZZ is unknown, thus formula is not parsed and the unification should do nothing
	const mmpSource = 'qed::ax-mp |- M e. ZZ';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const newTextExpected =
		'qed::ax-mp         |- M e. ZZ\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect impbii ref error to leave line unchanged', () => {
	// we've decided not to remove the wrong ref
	const mmpSource = 'qed:5:impbii |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const newTextExpected =
		'qed:5:impbii       |- ch\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect long label to move the formula to new line', () => {
	// we've decided not to remove the wrong ref
	const mmpSource = 'qed::exactlonglabel |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const newTextExpected =
		'qed::exactlonglabel\n' +
		'                   |- ch\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect ref error to leave line unchanged', () => {
	// we've decided not to remove the wrong ref
	const mmpSource = 'qed:5:ax-mp |- ch';
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const newTextExpected =
		'qed:5:ax-mp        |- ch\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('unify a1i with already present working var', () => {
	const mmpSource =
		'a::a1i |- &W1\n' +
		'qed:: |- ch';
	// const impbiiMmParser: MmParser = new MmParser();
	// impbiiMmParser.ParseText(impbiiTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'd1::                |- &W2\n' +
		'a:d1:a1i           |- ( &W3 -> &W2 )\n' +
		'qed::              |- ch\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Expect comments to be left unchanged', () => {
	const mmpSource =
		'* comment that\n' +
		'  should be left on two lines, with   wierd     spacing preserved\n' +
		'6:: |- ps\n' +
		'* second comment    to be left    unchanged\n' +
		'qed:5:ax-mp |- ch';
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'\n* comment that\n' +
		'  should be left on two lines, with   wierd     spacing preserved\n' +
		'\n' +
		'6::                |- ps\n' +
		'* second comment    to be left    unchanged\n' +
		'qed:5:ax-mp        |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('expect2 x to unify with &S1', () => {
	const mmpSource =
		'd2:: |- x = &C2\n' +
		'd1:d2:eqeq1i |- ( &S1 = &C3 <-> &C2 = &C3 )\n' +
		'qed: |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	// const mmpUnifier: MmpUnifier = new MmpUnifier(eqeq1iMmParser.labelToStatementMap, eqeq1iMmParser.outermostBlock,
	// 	eqeq1iMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'd2::                |- x = &C2\n' +
		'd1:d2:eqeq1i       |- ( x = &C3 <-> &C2 = &C3 )\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);

});

test('expect &W1 and &W2 to be unified properly', () => {
	const mmpSource =
		'd1:: |- ( ch -> &W2 )\n' +
		'd2:: |- ( ( &W1 -> ps ) -> ph )\n' +
		'qed:d1,d2:ax-mp |- ph\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'd1::                |- ( ch -> ps )\n' +
		'd2::                |- ( ( ch -> ps ) -> ph )\n' +
		'qed:d1,d2:ax-mp    |- ph\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('expect ax6ev to be unified without loop', () => {
	const mmpSource =
		'd2::ax6ev |- E. &S1 &W1\n' +
		'qed: |- ch\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'd2::ax6ev          |- E. &S1 &S1 = &S2\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('expect ax9v1 to be unified in a single step', () => {
	const mmpSource =
		'd5::ax9v1 |- ( &W5 -> ( &W4 -> z e. y ) )\n' +
		'qed: |- ch\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	const expectedText =
		'd5::ax9v1          |- ( &S1 = y -> ( z e. &S1 -> z e. y ) )\n' +
		'qed::              |- ch\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test('expect wrong ref not to throw an exception', () => {
	const mmpSource =
		'd2::                |- &W1\n' +
		'd3::               |- ( &W1 -> ch )\n' +
		'd1:d2,d3a:ax-mp    |- ch\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(mmpSource);
});

test('MmpParser.uProof.formulaToProofStepMap 1', () => {
	const mmpSource =
		'h1:: |- ps\n' +
		'* comment\n' +
		'h2:: |- ( ps -> ph )\n' +
		'3:: |- ph\n' +
		'qed:: |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const indexPs: number | undefined = mmpParser.uProof!.formulaToProofStepMap.get('|- ps');
	expect(indexPs).toBe(0);
	const indexWi: number | undefined = mmpParser.uProof!.formulaToProofStepMap.get('|- ( ps -> ph )');
	expect(indexWi).toBe(2);
});

test("Unify() removes search statements", () => {
	const mmpSource =
		'h50::mp2.1 |- ph\n' +
		'SearchSymbols: x y   SearchComment:  \n' +
		'qed:51,53:ax-mp |- ch';
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'h50::mp2.1         |- ph\n' +
		'qed:51,53:ax-mp    |- ch\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});