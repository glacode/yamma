import { MmtSaver, MmtSaverArgs } from '../mmt/MmtSaver';
import { MmParser } from '../mm/MmParser';
import { theoryToTestDjVarViolation } from './DisjointVarsManager.test';
import { elexdMmParser, kindToPrefixMap, mp2MmParser, mp2Theory } from './GlobalForTest.test';
import { MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { MmpCompressedProofCreatorFromPackedProof } from '../mmp/proofCompression/MmpCompressedProofCreator';
import { MmpFifoLabelMapCreator } from '../mmp/proofCompression/MmpFifoLabelMapCreator';

/**
 * This class is used to test protected methods
 */
class TestMmtSaver extends MmtSaver {
	tryToCreateTextToBeStored(mmpContent: string): string | undefined {
		return super.tryToCreateTextToBeStored(mmpContent);
	}
	reformat(text: string, leftMarginForFirstLine: number,
		leftMarginForOtherLines: number): string {
		return super.reformat(text, leftMarginForFirstLine, leftMarginForOtherLines);
	}
}

test("Expect created .mmt text ", () => {
	const mmpSource =
		"$theorem test\n" +
		"* This is just a test comment\n" +
		"qed:ax-5 |- ( x e. A -> A. y x e. A )\n" +
		"$d A y\n" +
		"$d x y\n";
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(theoryToTestDjVarViolation);
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mmParser,
		leftMargin: 6,
		charactersPerLine: 80
	};
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 80);
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);
	const textExpected =
		"  ${\n" +
		"    $d A y $. $d x y $.\n" +
		"    $( This is just a test comment $)\n" +
		"    test $p |- ( x e. A -> A. y x e. A ) $=\n" +
		"      ( cv wcel ax-5 ) ADCEBF $.\n" +
		"  $}\n";

	expect(textProduced).toEqual(textExpected);

});

test("Expect mmp2 created .mmt text with labels in 'most referenced' order", () => {
	const mmpSource =
		"$theorem test\n" +
		"* This is just a test comment\n" +
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(mp2Theory);
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mmParser,
		leftMargin: 6,
		charactersPerLine: 80
	};
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 80);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);

	const textExpected =
		"  ${\n" +
		"    mp2.1 $e |- ph $.\n" +
		"    mp2.2 $e |- ps $.\n" +
		"    mp2.3 $e |- ( ph -> ( ps -> ch ) ) $.\n" +
		"    $( This is just a test comment $)\n" +
		"    test $p |- ch $=\n" +
		"      ( ax-mp wi ) BCEABCHDFGG $.\n" +
		"  $}\n";

	expect(textProduced).toEqual(textExpected);

});

//TODO1 21 AUG 2023
test("Expect mmp2 created .mmt text with labels in 'FIFO' order", () => {
	const mmpSource =
		"$theorem test\n" +
		"* This is just a test comment\n" +
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(mp2Theory);
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mmParser,
		leftMargin: 6,
		charactersPerLine: 80,
		mmpCompressedProofCreator: new MmpCompressedProofCreatorFromPackedProof(
			new MmpFifoLabelMapCreator())
	};
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 80);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);

	const textExpected =
		"  ${\n" +
		"    mp2.1 $e |- ph $.\n" +
		"    mp2.2 $e |- ps $.\n" +
		"    mp2.3 $e |- ( ph -> ( ps -> ch ) ) $.\n" +
		"    $( This is just a test comment $)\n" +
		"    test $p |- ch $=\n" +
		"      ( wi ax-mp ) BCEABCGDFHH $.\n" +
		"  $}\n";

	expect(textProduced).toEqual(textExpected);

});

test('Expect proof right parenthesis to be on a new line, followed by a space', () => {
	const mmpSource =
		'$theorem test\n' +
		'* This is just a test comment\n' +
		'qed:ax-5 |- ( x e. A -> A. y x e. A )\n' +
		'$d A y\n' +
		'$d x y\n';
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(theoryToTestDjVarViolation);
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mmParser,
		leftMargin: 6,
		charactersPerLine: 20
	};
	// testMmtSaver: TestMmtSaver = new TestMmtSaver('', '', mmParser, 6, 20);
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);
	const textExpected =
		'  ${\n' +
		'    $d A y $.\n' +
		'    $d x y $.\n' +
		'    $( This is just\n' +
		'       a test\n' +
		'       comment $)\n' +
		'    test $p |- ( x\n' +
		'       e. A -> A. y\n' +
		'       x e. A ) $=\n' +
		'      ( cv wcel ax-5\n' +
		'      ) ADCEBF $.\n' +
		'  $}\n';

	expect(textProduced).toEqual(textExpected);

});

test('reformat comment', () => {
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mp2MmParser,
		leftMargin: 0,
		charactersPerLine: 20
	};
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver('', '', mp2MmParser, 0, 20);
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	const text = '$( This is just a test comment $)';
	const textProduced: string | undefined = testMmtSaver.reformat(text, 4, 7);
	const textExpected =
		'    $( This is just\n' +
		'       a test\n' +
		'       comment $)\n';
	expect(textProduced).toEqual(textExpected);
});

test('reformat EHyps ', () => {
	const mmpSource =
		'$theorem test\n' +
		'* This is just a test comment\n' +
		'h50::mp2.1 |- ph\n' +
		'h51::mp2.2 |- ps\n' +
		'h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n' +
		'53:50,52:ax-mp |- ( ps -> ch )\n' +
		'qed:51,53:ax-mp |- ch';
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(mp2Theory);
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mp2MmParser,
		leftMargin: 6,
		charactersPerLine: 37,
		mmpCompressedProofCreator: new MmpCompressedProofCreatorFromPackedProof(
			new MmpFifoLabelMapCreator())
	};
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver('', '', mmParser, 6, 37);
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);

	const textExpected =
		'  ${\n' +
		'    mp2.1 $e |- ph $.\n' +
		'    mp2.2 $e |- ps $.\n' +
		'    mp2.3 $e |- ( ph -> ( ps -> ch )\n' +
		'       ) $.\n' +
		'    $( This is just a test comment $)\n' +
		'    test $p |- ch $=\n' +
		'      ( wi ax-mp ) BCEABCGDFHH $.\n' +
		'  $}\n';

	expect(textProduced).toEqual(textExpected);

});

test('Expect $d constraints with 3 and 4 variables', () => {
	// $d ph x $. $d k x $. $d k ph $. $d j x $. $d j k $.
	// $d F x $. $d F k $. $d A x $. $d A k $. $d A j $.

	// whereas mmj2 produces

	// $d A j k x $. $d F k x $. $d k ph x $.
	const mmpSource =
		'$theorem test\n' +
		'\n* test comment\n\n' +
		'h1::test.1 |- ph\n' +
		'h2::test.2 |- ( ph -> ps )\n' +
		'qed:1,2:ax-mp |- ps\n' +
		'$d ph x\n' +
		'$d k x\n' +
		'$d k ph\n' +
		'$d j x\n' +
		'$d j k\n' +
		'$d F x\n' +
		'$d F k\n' +
		'$d A x\n' +
		'$d A k\n' +
		'$d A j\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();

	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: elexdMmParser,
		leftMargin: 6,
		charactersPerLine: 33
	};
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver('', '', elexdMmParser, 6, 33);
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);

	const textExpected =
		'  ${\n' +
		// '    $d ph x $. $d k x $. $d k ph $. $d j x $. $d j k $. $d F x $. $d F k $.\n' +
		// '    $d A x $. $d A k $. $d A j $.\n' +
		'    $d A j k x $. $d F k x $.\n' +
		'    $d k ph x $.\n' +
		'    test.1 $e |- ph $.\n' +
		'    test.2 $e |- ( ph -> ps ) $.\n' +
		'    $( test comment $)\n' +
		'    test $p |- ps $=\n' +
		'      ( ax-mp ) ABCDE $.\n' +
		'  $}\n';
	expect(textProduced).toEqual(textExpected);
});