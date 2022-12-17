import { MmParser } from '../mm/MmParser';
import { MmtLoader } from '../mmt/MmtLoader';
import { vexTheoryMmParser } from './MmpProofStatement.test';
import { impbiiMmParser, mp2MmParser } from './GlobalForTest.test';

/**
 * This class is used to test protected methods
 */
class TestMmtLoader extends MmtLoader {
	addGlobalDependenciesForSingleTheorem(theorem: string, globalDependencies: Map<string, Set<string>>) {
		return super.addGlobalDependenciesForSingleTheorem(theorem, globalDependencies);
	}
	restrictToLocalMmtDependenciesInMustPrecedeForm(globalDependencies: Map<string, Set<string>>): Map<string, Set<string>> {
		return super.restrictToLocalMmtDependenciesInMustPrecedeForm(globalDependencies);
	}
	canTheoremBeAdded(fileContent: string): boolean {
		return super.canTheoremBeAdded(fileContent);
	}
}

test("test MmtLoader.addGlobalDependenciesForSingleTheorem ", () => {
	const mmtContent =
		'${\n' +
		'breldmd.1 $e    |- ( ph -> A e. C ) $.\n' +
		'breldmd.2 $e    |- ( ph -> B e. D ) $.\n' +
		'breldmd.3 $e    |- ( ph -> A R B ) $.\n' +
		'$( Membership of first of a binary relation in a domain. $)\n' +
		'breldmd $p       \n' +
		'    |- ( ph -> A e. dom R ) $=\n' +
		'  ( wcel wbr cdm breldmg syl3anc ) ABDJCEJBCFKBFLJGHIBCDEFMN $.\n' +
		'       \n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader("", new MmParser());
	const globalDependencies: Map<string, Set<string>> = new Map<string, Set<string>>();
	testMmtLoader.addGlobalDependenciesForSingleTheorem(mmtContent, globalDependencies);
	expect(globalDependencies.size).toBe(1);
	const dependencies: Set<string> = <Set<string>>globalDependencies.get('breldmd');
	expect(dependencies.size).toBe(5);
	expect(dependencies.has('wcel')).toBeTruthy();
	expect(dependencies.has('yyy')).toBeFalsy();
	expect(dependencies.has('syl3anc')).toBeTruthy();
});

test("test MmtLoader.restrictToLocalMmtDependencies ", () => {
	const mustFollow: Map<string, Set<string>> = new Map<string, Set<string>>();
	mustFollow.set('th5', new Set<string>(['global1', 'th4', 'global3']));
	mustFollow.set('th4', new Set<string>(['global1', 'th2', 'th3', 'th1', 'global3']));
	mustFollow.set('th3', new Set<string>(['global1', 'global3']));
	mustFollow.set('th2', new Set<string>(['global1', 'th1', 'global3']));
	mustFollow.set('th1', new Set<string>(['global1', 'global3']));
	// const dependencies: Set<string> = <Set<string>>globalDependencies.get('breldmd');
	const testMmtLoader: TestMmtLoader = new TestMmtLoader("", new MmParser());
	const mustPreceed: Map<string, Set<string>> = testMmtLoader.restrictToLocalMmtDependenciesInMustPrecedeForm(mustFollow);
	expect(mustPreceed.size).toBe(5);
	expect((<Set<string>>mustPreceed.get('th5')).size).toBe(0);
	expect((<Set<string>>mustPreceed.get('th4')).size).toBe(1);
	expect((<Set<string>>mustPreceed.get('th4')).has('th5')).toBeTruthy();
	expect((<Set<string>>mustPreceed.get('th3')).size).toBe(1);
	expect((<Set<string>>mustPreceed.get('th3')).has('th5')).toBeFalsy();
	expect((<Set<string>>mustPreceed.get('th3')).has('th4')).toBeTruthy();
	expect((<Set<string>>mustPreceed.get('th2')).size).toBe(1);
	expect((<Set<string>>mustPreceed.get('th1')).size).toBe(2);
	expect((<Set<string>>mustPreceed.get('th1')).has('th2')).toBeTruthy();
	expect((<Set<string>>mustPreceed.get('th1')).has('th4')).toBeTruthy();
	expect((<Set<string>>mustPreceed.get('th1')).has('th3')).toBeFalsy();
});

test("expect new theorem can be added ", () => {
	// mp2Parser containst the theory for all that's needed for mp2, but
	// mp2 is not in the theory
	const mmtFileForMp2 =
		'${\n' +
		'mp2.1 $e         |- ph $.\n' +
		'mp2.2 $e        |- ps $.\n' +
		'mp2.3 $e         |- ( ph -> ( ps -> ch ) ) $.\n' +
		'$( A double modus ponens inference.  $)\n' +
		'mp2 $p         |- ch $=\n' +
		'  ( wi ax-mp ) BCEABCGDFHH $.\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader(mmtFileForMp2, mp2MmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForMp2);
	expect(canBeAdded).toBeTruthy();
});

test("impbii good expect already existing (identical) theorem can be added ", () => {
	const mmtFileForImpbii =
		'${\n' +
		'impbii.1 $e |- ( ph -> ps ) $.\n' +
		'impbii.2 $e |- ( ps -> ph ) $.\n' +
		'impbii $p |- ( ph <-> ps ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $.\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeTruthy();
});

test("impbii bad 1 expect to be rejected for first label wrong", () => {
	// the label of the first $e hyp is wrong
	const mmtFileForImpbii =
		'${\n' +
		'impbi.1 $e |- ( ph -> ps ) $.\n' +
		'impbii.2 $e |- ( ps -> ph ) $.\n' +
		'impbii $p |- ( ph <-> ps ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $..\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeFalsy();
});

test("impbii bad 2 expect to be rejected for second label wrong", () => {
	// the label of the first $e hyp is wrong
	const mmtFileForImpbii =
		'${\n' +
		'impbii.1 $e |- ( ph -> ps ) $.\n' +
		'impbi.2 $e |- ( ps -> ph ) $.\n' +
		'impbii $p |- ( ph <-> ps ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $..\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeFalsy();
});

test("impbii bad 3 expect to be rejected for $p label wrong", () => {
	// the label of the first $e hyp is wrong
	const mmtFileForImpbii =
		'${\n' +
		'impbii.1 $e |- ( ph -> ps ) $.\n' +
		'impbii.2 $e |- ( ps -> ph ) $.\n' +
		'impbi $p |- ( ph <-> ps ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $..\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeFalsy();
});

test("impbii bad 4 expect to be rejected for first formula not matching", () => {
	// the label of the first $e hyp is wrong
	const mmtFileForImpbii =
		'${\n' +
		'impbii.1 $e |- ( ph -> ph ) $.\n' +
		'impbii.2 $e |- ( ps -> ph ) $.\n' +
		'impbii $p |- ( ph <-> ps ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $..\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeFalsy();
});

test("impbii bad 5 expect to be rejected for second formula not matching", () => {
	// the label of the first $e hyp is wrong
	const mmtFileForImpbii =
		'${\n' +
		'impbii.1 $e |- ( ph -> ps ) $.\n' +
		'impbii.2 $e |- ( ps - ph ) $.\n' +
		'impbii $p |- ( ph <-> ps ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $..\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeFalsy();
});

test("impbii bad 6 expect to be rejected for $p formula not matching", () => {
	// the label of the first $e hyp is wrong
	const mmtFileForImpbii =
		'${\n' +
		'impbii.1 $e |- ( ph -> ps ) $.\n' +
		'impbii.2 $e |- ( ps -> ph ) $.\n' +
		'impbii $p |- ( ph <-> ch ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $..\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeFalsy();
});

test("impbii bad 7 expect to be rejected for wrong number of eHyps ", () => {
	const mmtFileForImpbii =
		'${\n' +
		'impbii.1 $e |- ( ph -> ps ) $.\n' +
		// impbii.2 below is missing
		// 'impbii.2 $e |- ( ps -> ph ) $.\n' +
		'impbii $p |- ( ph <-> ps ) $=\n' +
		'( wi wb impbi mp2 ) ABEBAEABFCDABGH $.\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', impbiiMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForImpbii);
	expect(canBeAdded).toBeFalsy();
});

// const vexTheory: string = readTestFile('vex.mm');
// export const vexTheoryParser: MmParser = createMmParser('vex.mm');
// vexTheoryParser.ParseText(vexTheory);

test("axext3 good - identical to existing one, expected to be accepted", () => {
	const mmtFileForAxext3 =
		'${\n' +
		'$d w x z $. $d w y z $. \n' +
		'$( A generalization of the Axiom of Extensionality in which ` x ` and ` y `\n' +
		'   need not be distinct. $)\n' +
		'axext3 $p |- ( A. z ( z e. x <-> z e. y ) -> x = y ) $=\n' +
		'  ( vw cv wceq wcel wal elequ2 bibi1d albidv ax-ext syl6bir ax7 syld\n' +
		'  exlimiiv wb wi ax6e ) DEZAEZFZCEZUAGZUCBEZGZQZCHZUAUEFZRDUBUHTUEFZUIUBUHU\n' +
		'  CTGZUFQZCHUJUBULUGCUBUKUDUFDACIJKDBCLMDABNODASP $.\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', vexTheoryMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForAxext3);
	expect(canBeAdded).toBeTruthy();
});

test("axext3 bad 1 - it contains the additional $d x y  thus it should be rejected", () => {
	const mmtFileForAxext3 =
		'${\n' +
		// below it would be expected '$d w x z $. $d w y z $.' but the additional
		'$d w x y z $.\n' +
		'$( A generalization of the Axiom of Extensionality in which ` x ` and ` y `\n' +
		'   need not be distinct. $)\n' +
		'axext3 $p |- ( A. z ( z e. x <-> z e. y ) -> x = y ) $=\n' +
		'  ( vw cv wceq wcel wal elequ2 bibi1d albidv ax-ext syl6bir ax7 syld\n' +
		'  exlimiiv wb wi ax6e ) DEZAEZFZCEZUAGZUCBEZGZQZCHZUAUEFZRDUBUHTUEFZUIUBUHU\n' +
		'  CTGZUFQZCHUJUBULUGCUBUKUDUFDACIJKDBCLMDABNODASP $.\n' +
		'$}';
	const testMmtLoader: TestMmtLoader = new TestMmtLoader('', vexTheoryMmParser);
	const canBeAdded: boolean = testMmtLoader.canTheoremBeAdded(mmtFileForAxext3);
	expect(canBeAdded).toBeFalsy();
});
