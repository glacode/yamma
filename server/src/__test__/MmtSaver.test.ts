import { MmtSaver, MmtSaverArgs } from '../mmt/MmtSaver';
import { MmParser } from '../mm/MmParser';
import { theoryToTestDjVarViolation } from './DisjointVarsManager.test';
import { elexdMmParser, kindToPrefixMap, mp2MmParser, mp2Theory } from './GlobalForTest.test';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { MmpCompressedProofCreatorFromPackedProof } from '../mmp/proofCompression/MmpCompressedProofCreator';
import { MmpFifoLabelMapCreator } from '../mmp/proofCompression/MmpFifoLabelMapCreator';
import { MmpSortedByReferenceLabelMapCreator } from '../mmp/proofCompression/MmpSortedByReferenceLabelMapCreator';

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
	const mmpSource = `\
$theorem test
* This is just a test comment
qed:ax-5 |- ( x e. A -> A. y x e. A )
$d A y
$d x y
`;

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
	const textExpected = `\
  \${
    $d A y $. $d x y $.
    $( This is just a test comment $)
    test $p |- ( x e. A -> A. y x e. A ) $=
      ( cv wcel ax-5 ) ADCEBF $.
  $}
`;


	expect(textProduced).toEqual(textExpected);

});

test("Expect mmp2 created .mmt text with labels in 'most referenced' order", () => {
	const mmpSource = `\
$theorem test
* This is just a test comment
h50::mp2.1 |- ph
h51::mp2.2 |- ps
h52::mp2.3 |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp |- ( ps -> ch )
qed:51,53:ax-mp |- ch`;

	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(mp2Theory);
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mmParser,
		leftMargin: 6,
		charactersPerLine: 80,
		mmpCompressedProofCreator: new MmpCompressedProofCreatorFromPackedProof(new MmpSortedByReferenceLabelMapCreator())
	};
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 80);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);

	const textExpected = `\
  \${
    mp2.1 $e |- ph $.
    mp2.2 $e |- ps $.
    mp2.3 $e |- ( ph -> ( ps -> ch ) ) $.
    $( This is just a test comment $)
    test $p |- ch $=
      ( ax-mp wi ) BCEABCHDFGG $.
  $}
`;

	expect(textProduced).toEqual(textExpected);

});

test("Expect mmp2 created .mmt text with labels in 'FIFO' order", () => {
	const mmpSource = `\
$theorem test
* This is just a test comment
h50::mp2.1 |- ph
h51::mp2.2 |- ps
h52::mp2.3 |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp |- ( ps -> ch )
qed:51,53:ax-mp |- ch`;

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

	const textExpected = `\
  \${
    mp2.1 $e |- ph $.
    mp2.2 $e |- ps $.
    mp2.3 $e |- ( ph -> ( ps -> ch ) ) $.
    $( This is just a test comment $)
    test $p |- ch $=
      ( wi ax-mp ) BCEABCGDFHH $.
  $}
`;


	expect(textProduced).toEqual(textExpected);

});

test('Expect proof right parenthesis to be on a new line, followed by a space', () => {
	const mmpSource = `$theorem test
* This is just a test comment
qed:ax-5 |- ( x e. A -> A. y x e. A )
$d A y
$d x y
`;
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
	const textExpected = `\
  \${
    $d A y $.
    $d x y $.
    $( This is just
       a test
       comment $)
    test $p |- ( x
       e. A -> A. y
       x e. A ) $=
      ( cv wcel ax-5
      ) ADCEBF $.
  $}
`;

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
	const textExpected = `\
    $( This is just
       a test
       comment $)
`;
	expect(textProduced).toEqual(textExpected);
});

test('reformat EHyps ', () => {
	const mmpSource = `\
$theorem test
* This is just a test comment
h50::mp2.1 |- ph
h51::mp2.2 |- ps
h52::mp2.3 |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp |- ( ps -> ch )
qed:51,53:ax-mp |- ch`;
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

	const textExpected = `\
  \${
    mp2.1 $e |- ph $.
    mp2.2 $e |- ps $.
    mp2.3 $e |- ( ph -> ( ps -> ch )
       ) $.
    $( This is just a test comment $)
    test $p |- ch $=
      ( wi ax-mp ) BCEABCGDFHH $.
  $}
`;

	expect(textProduced).toEqual(textExpected);

});

test('Expect $d constraints with 3 and 4 variables', () => {
	// $d ph x $. $d k x $. $d k ph $. $d j x $. $d j k $.
	// $d F x $. $d F k $. $d A x $. $d A k $. $d A j $.

	// whereas mmj2 produces

	// $d A j k x $. $d F k x $. $d k ph x $.
	const mmpSource = `\
$theorem test

* test comment

h1::test.1 |- ph
h2::test.2 |- ( ph -> ps )
qed:1,2:ax-mp |- ps
$d ph x
$d k x
$d k ph
$d j x
$d j k
$d F x
$d F k
$d A x
$d A k
$d A j
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: elexdMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
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

	const textExpected = `\
  \${
    $d A j k x $. $d F k x $.
    $d k ph x $.
    test.1 $e |- ph $.
    test.2 $e |- ( ph -> ps ) $.
    $( test comment $)
    test $p |- ps $=
      ( ax-mp ) ABCDE $.
  $}
`;
	expect(textProduced).toEqual(textExpected);
});

test("Expect NO empty line below the closed parens ", () => {
	const mmpSource = `\
$theorem test
* This is just a test comment
qed:ax-5 |- ( x e. A -> A. y x e. A )
$d A y
$d x y`;
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(theoryToTestDjVarViolation);
	const mmtSaverArgs: MmtSaverArgs = {
		textDocumentPath: '',
		documentContentInTheEditor: '',
		mmParser: mmParser,
		leftMargin: 6,
		charactersPerLine: 22
	};
	// const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 80);
	const testMmtSaver: TestMmtSaver = new TestMmtSaver(mmtSaverArgs);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);
	const textExpected = `\
  \${
    $d A y $.
    $d x y $.
    $( This is just a
       test comment $)
    test $p |- ( x e.
       A -> A. y x e.
       A ) $=
      ( cv wcel ax-5 )
      ADCEBF $.
  $}
`;


	expect(textProduced).toEqual(textExpected);

});