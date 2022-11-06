import { Connection } from 'vscode-languageserver';
import { TextEdit } from 'vscode-languageserver-textdocument';
import { ConfigurationManager, IExtensionSettings, ProofMode, IVariableKindConfiguration } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpProofStep } from '../mmp/MmpStatements';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { UProof } from '../mmp/UProof';
import { WorkingVars } from '../mmp/WorkingVars';
import { eqeq1iMmParser, impbiiMmParser, kindToPrefixMap } from './GlobalForTest.test';
import { axmpTheory } from './MmParser.test';
import { mp2Theory } from './MmpParser.test';
import { vexTheoryMmParser } from './MmpProofStatement.test';

// const mmptext = '* A double modus ponens inference.\n' +
// 	'h50::mp2.1           |- ph\n' +
// 	'h51::mp2.2          |- ps\n' +
// 	'h52::mp2.3           |-\n' +
// 	' ( ph -> ( ps -> ch ) )\n' +
// 	'53:50,52:ax-mp      |- ( ps -> ch )\n' +
// 	'qed:51,53:ax-mp    |- ch\n';

// const mmptext2 = '* A double modus ponens inference.\n' +
// 	'h50::test.1           |- ph\n' +
// 	'h51::test.2           |- ( ph -> ( ps -> ch ) )\n' +
// 	'qed:50,51:ax-mp      ';
//'qed:50,51:ax-mp      |- ( ps -> ch )';


class TestMmpUnifier extends MmpUnifier {
	public buildUProof(textToParse: string) {
		return super.buildUProof(textToParse);
	}
}

const exampleSettings: IExtensionSettings = {
	maxNumberOfProblems: 100,
	proofMode: ProofMode.normal,
	mmFileFullPath: '',
	variableKindsConfiguration: new Map<string,IVariableKindConfiguration>()
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
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, new WorkingVars(kindToPrefixMap));
	// // const outermostBlock: BlockStatement = new BlockStatement(null);
	// mmpParser.parse();
	const mmpUnifier: TestMmpUnifier = new TestMmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	const uProof: UProof = mmpUnifier.buildUProof(mmpSource);
	expect(uProof.uStatements.length).toBe(2);
	// expect((<UProofStep>uProof.uStatements[0]).stepLabel).toEqual('ax-mp');
	expect((<MmpProofStep>uProof.uStatements[0]).stepLabel).toEqual('ax-mp');
});

test('Unify ax-mp', () => {
	const mmpSource =
		'ax-mp\n' +
		'qed:: |- ps';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	// const mmpParser: MmpParser = new MmpParser();
	// // const outermostBlock: BlockStatement = new BlockStatement(null);
	// mmpParser.parse(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, workingVarsForTest);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =

		//!d2::              |- &W1
		//!d3::              |- ( &W1 -> &W2 )
		//d1:d2,d3:ax-mp     |- &W2

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
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
		'1:: |- ps\n' +
		'2:: |- &W1\n' +
		'qed:1,2:ax-mp |- ph\n';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'1::                 |- ps\n' +
		'2::                 |- ( ps -> ph )\n' +
		'qed:1,2:ax-mp      |- ph\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Unify double ax-mp', () => {
	const mmpSource =
		'50:ax-mp\n' +
		'qed:,50:ax-mp |- ph';
	const parser: MmParser = new MmParser();
	parser.ParseText(axmpTheory);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, new WorkingVars(kindToPrefixMap));
	// // const outermostBlock: BlockStatement = new BlockStatement(null);
	// mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =

		// 	 !d1::              |- &W1
		//   !d2::                |- ( &W1 -> ( &W3 -> ph ) )
		//   50:d1,d2:ax-mp      |- ( &W3 -> ph )
		//   !d3::              |- &W3
		//   qed:d3,50:ax-mp |- ph

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
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, new WorkingVars(kindToPrefixMap));
	// // const outermostBlock: BlockStatement = new BlockStatement(null);
	// mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =

		// d6:: |- ( ps -> ph )
		// !d7::              |- ps
		// qed:d7,d6:ax-mp  |- ph

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
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, new WorkingVars(kindToPrefixMap));
	// // const outermostBlock: BlockStatement = new BlockStatement(null);
	// mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =

		// d1:: |- &W3
		// !d2:: |- &W4
		// !d3:: |- ( &W4 -> ph )
		// qed:d2,d3:ax-mp |- ph

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
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, new WorkingVars(kindToPrefixMap));
	// // const outermostBlock: BlockStatement = new BlockStatement(null);
	// mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =

		// !d1::              |- &W1
		// !d2::              |- ( &W1 -> ( ps -> ch ) )
		// qed:d1,d2:ax-mp |- ( ps -> ch )	

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
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	// const impbiiMmParser: MmParser = new MmParser();
	// impbiiMmParser.ParseText(impbiiTheory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(impbiiMmParser.labelToStatementMap,
		impbiiMmParser.outermostBlock, impbiiMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	// const impbiiMmParser: MmParser = new MmParser();
	// impbiiMmParser.ParseText(impbiiTheory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(impbiiMmParser.labelToStatementMap,
		impbiiMmParser.outermostBlock, impbiiMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(impbiiMmParser.labelToStatementMap, impbiiMmParser.outermostBlock,
		impbiiMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	// const parser: MmParser = new MmParser();
	// parser.ParseText(mp2Theory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(eqeq1iMmParser.labelToStatementMap, eqeq1iMmParser.outermostBlock,
		eqeq1iMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	// const parser: MmParser = new MmParser();
	// parser.ParseText(mp2Theory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(eqeq1iMmParser.labelToStatementMap, eqeq1iMmParser.outermostBlock,
		eqeq1iMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	// const parser: MmParser = new MmParser();
	// parser.ParseText(mp2Theory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	// const parser: MmParser = new MmParser();
	// parser.ParseText(mp2Theory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
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
	// const parser: MmParser = new MmParser();
	// parser.ParseText(mp2Theory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(mmpSource);
});
