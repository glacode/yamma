import { MmStatistics } from '../mm/MmStatistics';
import { AssertionStatement } from "../mm/AssertionStatement";
import { impbiiMmParser } from './GlobalForTest.test';

function symbolContainedInAssertion(symbolToAssertionMap: Map<string, Set<AssertionStatement>>,
	symbol: string, assertionLabel: string): boolean {
	const assertionsContainingSymbol: Set<AssertionStatement> = symbolToAssertionMap.get(symbol)!;
	const assertion: AssertionStatement = impbiiMmParser.labelToAssertionMap.get(assertionLabel)!;
	const isContained: boolean = assertionsContainingSymbol.has(assertion);
	return isContained;
}

test('statisics for impbii.mm', () => {
	const mmStatistics: MmStatistics = new MmStatistics(impbiiMmParser);
	mmStatistics.buildStatistics();
	const symbolToAssertionMap: Map<string, Set<AssertionStatement>> = mmStatistics.symbolToAssertionsMap!;
	// const assetionsContainingPh: Set<AssertionStatement> | undefined = symbolToAssertionMap.get('ph');
	// expect(assetionsContainingPh).toBeDefined();
	expect(symbolContainedInAssertion(symbolToAssertionMap, 'ph', 'ax-mp')).toBeFalsy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, 'ph', 'a1i')).toBeTruthy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, 'ps', 'ax-mp')).toBeTruthy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, '(', 'mpd')).toBeTruthy();
	expect(symbolContainedInAssertion(symbolToAssertionMap, 'th', 'ax-mp')).toBeFalsy();
	//TODO1 decide if you want to exclude these syntax axioms; use
	// !GrammarManager.isSyntaxAxiom2() to exclude syntax axioms
	expect(symbolContainedInAssertion(symbolToAssertionMap, '(', 'wi')).toBeTruthy();

	const assetionsContainingTh: Set<AssertionStatement> = symbolToAssertionMap.get('th')!;
	expect(assetionsContainingTh.size).toBe(4);
	// const a1i: AssertionStatement = impbiiMmParser.labelToAssertionMap.get('a1i');
	// expect(assetionsContainingPh?.has())
});

