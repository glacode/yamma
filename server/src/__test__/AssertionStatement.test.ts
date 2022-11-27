import { AssertionStatement, IEHypOrderForStepDerivation } from '../mm/AssertionStatement';
import { mp2MmParser } from './GlobalForTest.test';

test('AssertionStatement.eHypsOrderForStepDerivation', () => {
	const axmp: AssertionStatement = mp2MmParser.labelToNonSyntaxAssertionMap.get('ax-mp')!;
	const eHypOrderForStepDerivation: IEHypOrderForStepDerivation[] | undefined =
		axmp.eHypsOrderForStepDerivation;
	expect(eHypOrderForStepDerivation).toBeDefined();
	const eHypForStepDerivation0: IEHypOrderForStepDerivation = eHypOrderForStepDerivation![0];
	expect(eHypForStepDerivation0.eHypIndex).toBe(1);
	expect(eHypForStepDerivation0.additionalVariablesToBeUnified.size).toBe(1);
	expect(eHypForStepDerivation0.additionalVariablesToBeUnified.has('ph')).toBeTruthy();
	const eHypForStepDerivation1: IEHypOrderForStepDerivation = eHypOrderForStepDerivation![1];
	expect(eHypForStepDerivation1.eHypIndex).toBe(0);
	expect(eHypForStepDerivation1.additionalVariablesToBeUnified.size).toBe(0);
	// expect(eHypForStepDerivation1.additionalVariablesToBeUnified.has('ph')).toBeTruthy();
});