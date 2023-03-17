import { MmtSaver } from '../mmt/MmtSaver';
import { MmParser } from '../mm/MmParser';
import { theoryToTestDjVarViolation } from './DisjointVarsManager.test';
import { mp2Theory } from './GlobalForTest.test';

/**
 * This class is used to test protected methods
 */
class TestMmtSaver extends MmtSaver {
	tryToCreateTextToBeStored(mmpContent: string): string | undefined {
		return super.tryToCreateTextToBeStored(mmpContent);
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
	const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 80);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);
	const textExpected =
		"  ${\n" +
		"    $d x y $. $d A y $.\n" +
		"    $( This is just a test comment $)\n" +
		"    test $p |- ( x e. A -> A. y x e. A ) $=\n" +
		"      ( cv wcel ax-5 ) ADCEBF $.\n" +
		"  $}\n";

	expect(textProduced).toEqual(textExpected);

});

test("Expect mmp2 created .mmt text ", () => {
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
	const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 80);
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

//TODO1 mar 17
test("Expect proof right parenthesis to be on a new line, followed by a space", () => {
	const mmpSource =
		"$theorem test\n" +
		"* This is just a test comment\n" +
		"qed:ax-5 |- ( x e. A -> A. y x e. A )\n" +
		"$d A y\n" +
		"$d x y\n";
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(theoryToTestDjVarViolation);
	const testMmtSaver: TestMmtSaver = new TestMmtSaver("", '', mmParser, 6, 20);
	const textProduced: string | undefined = testMmtSaver.tryToCreateTextToBeStored(mmpSource);
	const textExpected =
		"  ${\n" +
		"    $d x y $. $d A y $.\n" +
		"    $( This is just a test comment $)\n" +
		"    test $p |- ( x e. A -> A. y x e. A ) $=\n" +
		"      ( cv wcel ax-5\n" +
		"      ) ADCEBF $.\n" +
		"  $}\n";

	expect(textProduced).toEqual(textExpected);

});