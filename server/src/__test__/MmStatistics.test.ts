import { MmStatistics } from '../mm/MmStatistics';
import { AssertionStatement } from "../mm/AssertionStatement";
import { impbiiMmParser, vexTheoryMmParser } from './GlobalForTest.test';
import { MmParser } from '../mm/MmParser';

function symbolContainedInAssertion(symbolToAssertionMap: Map<string, Set<AssertionStatement>>,
	symbol: string, assertionLabel: string, mmParser: MmParser): boolean {
	let isContained = false;
	const assertionsContainingSymbol: Set<AssertionStatement> | undefined =
		symbolToAssertionMap.get(symbol);
	if (assertionsContainingSymbol != undefined) {
		const assertion: AssertionStatement = mmParser.labelToNonSyntaxAssertionMap.get(assertionLabel)!;
		isContained = assertionsContainingSymbol.has(assertion);
	}
	return isContained;
}

test('statisics for impbii.mm', () => {
	const mmStatistics: MmStatistics = new MmStatistics(impbiiMmParser);
	mmStatistics.buildStatistics();
	const symbolToAssertionMap: Map<string, Set<AssertionStatement>> = mmStatistics.symbolToAssertionsMap!;
	// const assetionsContainingPh: Set<AssertionStatement> | undefined = symbolToAssertionMap.get('ph');
	// expect(assetionsContainingPh).toBeDefined();
	// expect(symbolContainedInAssertion(symbolToAssertionMap, 'ph', 'ax-mp')).toBeFalsy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, 'ph', 'a1i', impbiiMmParser)).toBeTruthy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, 'ps', 'ax-mp', impbiiMmParser)).toBeTruthy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, '(', 'mpd', impbiiMmParser)).toBeTruthy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, 'th', 'ax-mp', impbiiMmParser)).toBeFalsy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, '(', 'wi', impbiiMmParser)).toBeFalsy();

	const assetionsContainingTh: Set<AssertionStatement> = symbolToAssertionMap.get('th')!;
	expect(assetionsContainingTh.size).toBe(4);
	// const a1i: AssertionStatement = impbiiMmParser.labelToAssertionMap.get('a1i');
	// expect(assetionsContainingPh?.has())
});

test('statisics for vex.mm', () => {
	const mmStatistics: MmStatistics = new MmStatistics(vexTheoryMmParser);
	mmStatistics.buildStatistics();
	const symbolToAssertionMap: Map<string, Set<AssertionStatement>> = mmStatistics.symbolToAssertionsMap!;
	expect(symbolContainedInAssertion(symbolToAssertionMap, '|', 'abeq2d',vexTheoryMmParser)).toBeTruthy();

	const assertionsContainingTh: Set<AssertionStatement> = symbolToAssertionMap.get('|')!;
	expect(assertionsContainingTh.size).toBe(5);
});

