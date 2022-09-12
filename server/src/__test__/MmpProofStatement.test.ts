import { TextEdit } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { UCompressedProofStatement } from '../mmp/UCompressedProofStatement';
import { UProof } from '../mmp/UProof';
import { UProofStep } from '../mmp/UProofStep';
import { readTestFile } from '../mm/Utils';
import { WorkingVars } from '../mmp/WorkingVars';
import { theoryToTestDjVarViolation } from './DisjointVarsManager.test';
import { mp2Theory } from './MmpParser.test';
import { Parameters } from '../general/Parameters';




// const mmFilePath = __dirname.concat("/../mmTestFiles/vex.mm");
// const vexTheory: string = fs.readFileSync(mmFilePath, 'utf-8');
const vexTheory: string = readTestFile('vex.mm');
export const vexTheoryMmParser: MmParser = new MmParser();
vexTheoryMmParser.ParseText(vexTheory);
//QUI!!!
// export const vexTheoryParser: MmParser = createMmParser('vex.mm');


test("Build proof for mp2", () => {
	//in mmj2
	//$=    wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.
	//in metamath.exe :   show proof mp2 /normal
	//      wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.
	//in metamath.exe :   show proof mp2 /compressed
	//      ( wi ax-mp ) BCEABCGDFHH $.

	//h50::mp2.1         |- ph
	//h51::mp2.2         |- ps
	//h52::mp2.3         |- ( ph -> ( ps -> ch ) )
	// 53:50,52:ax-mp     |- ( ps -> ch )
	// qed:51,53:ax-mp    |- ch

	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"h50::mp2.1           |- ph\n" +
		"h51::mp2.2          |- ps\n" +
		"h52::mp2.3           |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp      |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp    |- ch\n" +
		"\n" +
		"$=    wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

class TestUCompressedProofStatement extends UCompressedProofStatement {
	constructor() {
		const dummyUProof = new UProof(new BlockStatement(), new WorkingVars());
		const dummyUProofStep: UProofStep = new UProofStep(dummyUProof, true, true, "", []);
		jest.spyOn(UProofStep.prototype, 'proofArray').mockImplementation(() => []);
		dummyUProof.lastUProofStep = dummyUProofStep;
		// jest.spyOn(dummyUProof,'lastUProofStep','get').mockReturnValue(dummyUProofStep);

		// super(dummyUProof, new BlockStatement());
		super(dummyUProof);
	}

	public upperCaseLettersFromNumber(givenNumber: number) {
		return super.upperCaseLettersFromNumber(givenNumber);
	}

	public base5base20representation(givenNumber: number): number[] {
		return super.base5base20representation(givenNumber);
	}
}

test("upperCaseLettersFromNumber", () => {

	const uCompressedProofStatement: TestUCompressedProofStatement = new TestUCompressedProofStatement();

	expect(uCompressedProofStatement.base5base20representation(22)).toEqual([1, 2]);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(1)).toEqual(['A']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(2)).toEqual(['B']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(20)).toEqual(['T']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(21)).toEqual(['U', 'A']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(22)).toEqual(['U', 'B']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(40)).toEqual(['U', 'T']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(41)).toEqual(['V', 'A']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(42)).toEqual(['V', 'B']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(120)).toEqual(['Y', 'T']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(121)).toEqual(['U', 'U', 'A']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(620)).toEqual(['Y', 'Y', 'T']);
	expect(uCompressedProofStatement.upperCaseLettersFromNumber(621)).toEqual(['U', 'U', 'U', 'A']);
	jest.restoreAllMocks();
});

test("Build Compressed proof for mp2", () => {
	//in mmj2
	//$=    wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.
	//in metamath.exe :   show proof mp2 /normal
	//      wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.
	//in metamath.exe :   show proof mp2 /compressed
	//      ( wi ax-mp ) BCEABCGDFHH $.

	//h50::mp2.1         |- ph
	//h51::mp2.2         |- ps
	//h52::mp2.3         |- ( ph -> ( ps -> ch ) )
	// 53:50,52:ax-mp     |- ( ps -> ch )
	// qed:51,53:ax-mp    |- ch

	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(), ProofMode.compressed);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"h50::mp2.1           |- ph\n" +
		"h51::mp2.2          |- ps\n" +
		"h52::mp2.3           |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp      |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp    |- ch\n" +
		"$= ( wi ax-mp ) BCEABCGDFHH $.\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

const idTheory = "$c ( $. $c ) $. $c -> $. $c wff $. $c |- $.\n" +
	"$v ph $. $v ps $. $v ch $.\n" +
	"wph $f wff ph $. wps $f wff ps $. wch $f wff ch $.\n" +
	"wi $a wff ( ph -> ps ) $.\n" +
	"${ min $e |- ph $. maj $e |- ( ph -> ps ) $. ax-mp $a |- ps $. $}\n" +
	"ax-1 $a |- ( ph -> ( ps -> ph ) ) $.\n" +
	"ax-2 $a |- ( ( ph -> ( ps -> ch ) ) -> ( ( ph -> ps ) -> ( ph -> ch ) ) ) $.\n" +
	"${ a2i.1 $e |- ( ph -> ( ps -> ch ) ) $. a2i $p |- ( ( ph -> ps ) -> ( ph -> ch ) ) $=\n" +
	"( wi ax-2 ax-mp ) ABCEEABEACEEDABCFG $. $}\n" +
	"${ mpd.1 $e |- ( ph -> ps ) $. mpd.2 $e |- ( ph -> ( ps -> ch ) ) $.\n" +
	"mpd $p |- ( ph -> ch ) $= ( wi a2i ax-mp ) ABFACFDABCEGH $. $}\n" +
	"id $p |- ( ph -> ph ) $= ( wi ax-1 mpd ) AAABZAAACAECD $.";

test("id - Build Compressed proof for id", () => {
	//in mmj2
	//$=  ( wi ax-1 mpd ) AAABZAAACAECD $.
	//in metamath.exe :   show proof id /normal
	//      wph wph wph wi wph wph wph ax-1 wph wph wph wi ax-1 mpd $.
	//in metamath.exe :   show proof id /compressed
	//      ( wi ax-1 mpd ) AAABZAAACAECD $.

	// 50::ax-1           |- ( ph -> ( ph -> ph ) )
	// 51::ax-1           |- ( ph -> ( ( ph -> ph ) -> ph ) )
	// qed:50,51:mpd      |- ( ph -> ph )

	const mmpSource =
		"50::ax-1 |- ( ph -> ( ph -> ph ) )\n" +
		"51::ax-1 |- ( ph -> ( ( ph -> ph ) -> ph ) )\n" +
		"qed:50,51:mpd |- ( ph -> ph )";
	const parser: MmParser = new MmParser();
	parser.ParseText(idTheory);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(), ProofMode.compressed);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"50::ax-1            |- ( ph -> ( ph -> ph ) )\n" +
		"51::ax-1            |- ( ph -> ( ( ph -> ph ) -> ph ) )\n" +
		"qed:50,51:mpd      |- ( ph -> ph )\n" +
		"$= ( wi ax-1 mpd ) AAABZAAACAECD $.\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test("alnex - Build normal proof for alnex", () => {
	const mmpSource =
		"50::df-ex |- ( E. x ph <-> -. A. x -. ph )\n" +
		"qed:50:con2bii |- ( A. x -. ph <-> -. E. x ph )";
	const mmpUnifier: MmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"50::df-ex           |- ( E. x ph <-> -. A. x -. ph )\n" +
		"qed:50:con2bii     |- ( A. x -. ph <-> -. E. x ph )\n" +
		"\n" +
		"$=    wph vx wex wph wn vx wal wph vx df-ex con2bii $.\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test("vex - Build normal proof for vex", () => {
	const mmpSource =
		"50::equid |- x = x\n" +
		"51::df-v |- _V = { x | x = x }\n" +
		"52:51:abeq2i |- ( x e. _V <-> x = x )\n" +
		"qed:50,52:mpbir |- x e. _V";
	const mmpUnifier: MmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"50::equid           |- x = x\n" +
		"51::df-v             |- _V = { x | x = x }\n" +
		"52:51:abeq2i        |- ( x e. _V <-> x = x )\n" +
		"qed:50,52:mpbir    |- x e. _V\n" +
		"\n" +
		"$=    vx cv cvv wcel vx cv vx cv wceq vx equid vx cv vx cv wceq vx cvv vx df-v abeq2i mpbir $.\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test("vex - Build Compressed proof for vex", () => {
	//in mmj2
	//$=  ( cv cvv wcel wceq equid df-v abeq2i mpbir ) ABZCDJJEZAFKACAGHI $.
	//in metamath.exe :   show proof id /normal
	//      wph wph wph wi wph wph wph ax-1 wph wph wph wi ax-1 mpd $.
	//in metamath.exe :   show proof id /compressed
	//      ( wi ax-1 mpd ) AAABZAAACAECD $.

	// const mmFilePath = __dirname.concat("/../mmTestFiles/vex.mm");
	// const vexTheory: string = fs.readFileSync(mmFilePath, 'utf-8');
	// const vexTheoryParser: MmParser = new MmParser();
	// vexTheoryParser.ParseText(vexTheory);

	const mmpSource =
		"50::equid |- x = x\n" +
		"51::df-v |- _V = { x | x = x }\n" +
		"52:51:abeq2i |- ( x e. _V <-> x = x )\n" +
		"qed:50,52:mpbir |- x e. _V";
	const mmpUnifier: MmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(), ProofMode.compressed);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"50::equid           |- x = x\n" +
		"51::df-v             |- _V = { x | x = x }\n" +
		"52:51:abeq2i        |- ( x e. _V <-> x = x )\n" +
		"qed:50,52:mpbir    |- x e. _V\n" +
		"$= ( cv cvv wcel wceq equid df-v abeq2i mpbir ) ABZCDJJEZAFKACAGHI $.\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test("Build normal proof for use of ax-5", () => {
	const mmpSource =
		"qed::ax-5 |- ( x e. A -> A. y x e. A )\n" +
		"$d x y\n" +
		"$d A y\n";
	const parser: MmParser = new MmParser();
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"qed::ax-5          |- ( x e. A -> A. y x e. A )\n" +
		"\n" +
		"$=    vx cv cA wcel vy ax-5 $.\n" +
		"$d x y\n" +
		"$d A y\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test("Expect proof not to be produced for Disj Var Violation", () => {
	const mmpSource = 'qed::ax-5 |- ( y e. A -> A. y y e. A )\n';
	const parser: MmParser = new MmParser();
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	// const newTextExpected =
	// "qed::ax-5 |- ( x e. A -> A. x x e. A )\n";
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = 'qed::ax-5          |- ( y e. A -> A. y y e. A )\n';
	expect(textEdit.newText).toEqual(expectedText);
});

test("Expect 2 proof not to be produced for missing Disj Var statement", () => {
	const mmpSource = "qed::ax-5 |- ( x e. A -> A. y x e. A )\n";
	const parser: MmParser = new MmParser();
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(), ProofMode.compressed);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	// const newTextExpected =
	// 	"qed::ax-5 |- ( x e. A -> A. y x e. A )\n" +
	// 	"\n" +
	// 	"$=  ( cv wcel ax-5 ) ADCEBF $.\n";
	const textEdit: TextEdit = textEditArray[0];
	const expectedText = "qed::ax-5          |- ( x e. A -> A. y x e. A )\n";
	expect(textEdit.newText).toEqual(expectedText);
});

test("Build compressed proof for use of ax-5", () => {
	const mmpSource =
		"qed::ax-5 |- ( x e. A -> A. y x e. A )\n" +
		"$d x y\n" +
		"$d A y\n";
	const parser: MmParser = new MmParser();
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpUnifier: MmpUnifier = new MmpUnifier(parser.labelToStatementMap, parser.outermostBlock,
		parser.grammar, new WorkingVars(), ProofMode.compressed);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"qed::ax-5          |- ( x e. A -> A. y x e. A )\n" +
		"$= ( cv wcel ax-5 ) ADCEBF $.\n" +
		"$d x y\n" +
		"$d A y\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test("Format equvinv compressed proof", () => {
	const mmpSource =
		'$theorem equvinv\n' +
		'50::ax6ev            |- E. z z = x\n' +
		'51::equtrr             |- ( x = y -> ( z = x -> z = y ) )\n' +
		'52:51:ancld           |- ( x = y -> ( z = x -> ( z = x /\\ z = y ) ) )\n' +
		'53:52:eximdv         |- ( x = y -> ( E. z z = x -> E. z ( z = x /\\ z = y ) ) )\n' +
		'54:50,53:mpi        |- ( x = y -> E. z ( z = x /\\ z = y ) )\n' +
		'55::ax7               |- ( z = x -> ( z = y -> x = y ) )\n' +
		'56:55:imp            |- ( ( z = x /\\ z = y ) -> x = y )\n' +
		'57:56:exlimiv       |- ( E. z ( z = x /\\ z = y ) -> x = y )\n' +
		'qed:54,57:impbii   |- ( x = y <-> E. z ( z = x /\\ z = y ) )\n' +
		'$d x z\n' +
		'$d y z\n';
	let mmpUnifier: MmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(), ProofMode.compressed);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	// 50:: ax6ev | - E.z z = x
	// 51:: equtrr | - (x = y -> (z = x -> z = y ) )
	// 52: 51: ancld | - (x = y -> (z = x -> (z = x /\ z = y ) ) )
	// 53: 52: eximdv | - (x = y -> (E.z z = x -> E.z(z = x /\ z = y) ) )
	// 54: 50, 53: mpi | - (x = y -> E.z(z = x /\ z = y))
	// 55:: ax7 | - (z = x -> (z = y -> x = y ) )
	// 56: 55: imp | - ((z = x /\ z = y ) -> x = y )
	// 57: 56: exlimiv | - (E.z(z = x /\ z = y) -> x = y )
	// qed: 54, 57: impbii | - (x = y < -> E.z(z = x /\ z = y))

	// $= (cv wceq wa wex ax6ev equtrr eximdv mpi ax7 imp exlimiv impbii
	// 	  ancld ) ADZBDZEZCDZQEZTREZFZCGZSUACGUDCAHSUAUCCSUAUBABCIPJKUCSC
	// 	  UAUBSCABLMNO $.
	// $d x z 
	// $d y z 
	const newTextExpected =
		'$theorem equvinv\n' +
		'50::ax6ev            |- E. z z = x\n' +
		'51::equtrr             |- ( x = y -> ( z = x -> z = y ) )\n' +
		'52:51:ancld           |- ( x = y -> ( z = x -> ( z = x /\\ z = y ) ) )\n' +
		'53:52:eximdv         |- ( x = y -> ( E. z z = x -> E. z ( z = x /\\ z = y ) ) )\n' +
		'54:50,53:mpi        |- ( x = y -> E. z ( z = x /\\ z = y ) )\n' +
		'55::ax7               |- ( z = x -> ( z = y -> x = y ) )\n' +
		'56:55:imp            |- ( ( z = x /\\ z = y ) -> x = y )\n' +
		'57:56:exlimiv       |- ( E. z ( z = x /\\ z = y ) -> x = y )\n' +
		'qed:54,57:impbii   |- ( x = y <-> E. z ( z = x /\\ z = y ) )\n' +
		'$= ( cv wceq wa wex ax6ev equtrr ancld eximdv mpi ax7 imp exlimiv impbii ) ADZB\n' +
		'  DZEZCDZQEZTREZFZCGZSUACGUDCAHSUAUCCSUAUBABCIJKLUCSCUAUBSCABMNOP $.\n' +
		'$d x z\n' +
		'$d y z\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);

	const defaultRightMargin: number = Parameters.defaultRightMarginForCompressedProofs;
	Parameters.defaultRightMarginForCompressedProofs = 30;

	mmpUnifier = new MmpUnifier(vexTheoryMmParser.labelToStatementMap, vexTheoryMmParser.outermostBlock,
		vexTheoryMmParser.grammar, new WorkingVars(), ProofMode.compressed);
	mmpUnifier.unify(mmpSource);

	const newTextExpected2 =
		'$theorem equvinv\n' +
		'50::ax6ev            |- E. z z = x\n' +
		'51::equtrr             |- ( x = y -> ( z = x -> z = y ) )\n' +
		'52:51:ancld           |- ( x = y -> ( z = x -> ( z = x /\\ z = y ) ) )\n' +
		'53:52:eximdv         |- ( x = y -> ( E. z z = x -> E. z ( z = x /\\ z = y ) ) )\n' +
		'54:50,53:mpi        |- ( x = y -> E. z ( z = x /\\ z = y ) )\n' +
		'55::ax7               |- ( z = x -> ( z = y -> x = y ) )\n' +
		'56:55:imp            |- ( ( z = x /\\ z = y ) -> x = y )\n' +
		'57:56:exlimiv       |- ( E. z ( z = x /\\ z = y ) -> x = y )\n' +
		'qed:54,57:impbii   |- ( x = y <-> E. z ( z = x /\\ z = y ) )\n' +
		'$= ( cv wceq wa wex ax6ev\n' +
		'  equtrr ancld eximdv mpi ax7\n' +
		'  imp exlimiv impbii ) ADZBDZ\n' +
		'  EZCDZQEZTREZFZCGZSUACGUDCAH\n' +
		'  SUAUCCSUAUBABCIJKLUCSCUAUBS\n' +
		'  CABMNOP $.\n' +
		'$d x z\n' +
		'$d y z\n';
	expect(mmpUnifier.textEditArray[0].newText).toEqual(newTextExpected2);
	
	Parameters.defaultRightMarginForCompressedProofs = defaultRightMargin;

});


