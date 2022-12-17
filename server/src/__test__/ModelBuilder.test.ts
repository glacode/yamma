import { formulaClassifiersExample, IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { ModelBuilder } from '../stepSuggestion/ModelBuilder';
import { StepSuggestionTripleMap } from '../stepSuggestion/StepSuggestionTripleMap';
import { fullPathForTestFile } from './GlobalForTest.test';

/**
 * This class is used to test protected methods
 */
 class TestModelBuilder extends ModelBuilder {
	public buildStepSuggestionTripleMap() {
		return super.buildStepSuggestionTripleMap();
	}
}

test("test 1 ModelBuilder for opelcn.mm", () => {
	const fomulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
	const mmFilePath = fullPathForTestFile('opelcn.mm');
	const modelBuilder: TestModelBuilder = new TestModelBuilder(mmFilePath, fomulaClassifiers,false);
	// modelBuilder.buildModel();
	modelBuilder.buildStepSuggestionTripleMap();
	const stepSuggestionTripleMap: StepSuggestionTripleMap = modelBuilder.stepSuggestionTripleMap;
	// I've not checked that the results below are correct (it would be too time consuming to do),
	// but they are returned by a test 'on the field' (see opelcn.mms)
	// and are coherent with what I would expect.
	// I've included these tests to get an alert if things are unwittingly changed.
	const mapForClassifier0: Map<string, Map<string, number>> =
		stepSuggestionTripleMap.map.get(fomulaClassifiers[0].id)!;
	let mapForClusterId: Map<string, number> = mapForClassifier0.get('wff wff wi TOP')!;
	let multiplicityForLabel: number = mapForClusterId.get('id')!;
	expect(multiplicityForLabel).toBe(18);
	multiplicityForLabel = mapForClusterId.get('biimpri')!;
	expect(multiplicityForLabel).toBe(9);
	mapForClusterId = mapForClassifier0.get('wff TOP')!;
	multiplicityForLabel = mapForClusterId.get('pm2.61i')!;
	expect(multiplicityForLabel).toBe(2);
	const mapForClassifier1: Map<string, Map<string, number>> =
		stepSuggestionTripleMap.map.get(fomulaClassifiers[1].id)!;
	mapForClusterId = mapForClassifier1.get('wff')!;
	multiplicityForLabel = mapForClusterId.get('biimpi')!;
	expect(multiplicityForLabel).toBe(11);
});