import { CompletionItemKind } from 'vscode-languageserver';
import { formulaClassifiersExample, IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { IStepSuggestion, ModelLoader } from '../stepSuggestion/ModelLoader';
import { StepSuggestionMap, StepSuggestionsForClassifier } from '../stepSuggestion/StepSuggestionMap';

/**
 * This class is used to test protected methods
 */
class TestModelLoader extends ModelLoader {
	public buildSuggestionsMapForModel(model: string): StepSuggestionMap {
		return super.buildSuggestionsMapForModel(model);
	}
}

test("test 1 ModelLoader", () => {
	const fomulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
	const modelLoader: TestModelLoader = new TestModelLoader('', fomulaClassifiers);
	const model: string =
		'full3,wff wff wi TOP,id,15\n' +
		'full3,wff wff wi TOP,syl,10\n' +
		'full3,wff wff wi TOP,biimpi,10\n' +
		'full3,wff wff wn wi wi TOP,con2d,2\n' +
		'full3,wff wff wn wi wi TOP,con4d,1\n' +
		'full3,wff wff wn wi wi TOP,a1i,1\n' +
		'imp2,wff,syl,17\n' +
		'imp2,wff,id,15';
	const stepSuggestionMap: StepSuggestionMap = modelLoader.buildSuggestionsMapForModel(model);
	expect(stepSuggestionMap.map.size).toBe(2);
	const suggestionsForClassifierFull3: StepSuggestionsForClassifier | undefined = stepSuggestionMap.map.get('full3');
	expect(suggestionsForClassifierFull3).toBeDefined();
	expect(suggestionsForClassifierFull3!.formulaClusterToStepSuggestionsMap.size).toBe(2);
	const suggestionsForClusterFull32: IStepSuggestion[] | undefined =
		suggestionsForClassifierFull3?.formulaClusterToStepSuggestionsMap.get('wff wff wn wi wi TOP')?.stepSuggestions;
	expect(suggestionsForClusterFull32).toBeDefined();
	expect(suggestionsForClusterFull32![0].label).toBe('con2d');
	expect(suggestionsForClusterFull32![0].completionItemKind).toBe(CompletionItemKind.Event);
	expect(suggestionsForClusterFull32![0].multiplicity).toBe(2);
	expect(suggestionsForClusterFull32![0].stepSuggestionsForFormulaCluster.totalMultiplicityForThisCluster).toBe(4);
	expect(suggestionsForClusterFull32![1].label).toBe('con4d');
	expect(suggestionsForClusterFull32![1].completionItemKind).toBe(CompletionItemKind.Event);
	expect(suggestionsForClusterFull32![1].multiplicity).toBe(1);
	expect(suggestionsForClusterFull32![2].label).toBe('a1i');
	expect(suggestionsForClusterFull32![2].completionItemKind).toBe(CompletionItemKind.Event);
	expect(suggestionsForClusterFull32![2].multiplicity).toBe(1);
	const suggestionsForClassifierImp2: StepSuggestionsForClassifier | undefined = stepSuggestionMap.map.get('imp2');
	expect(suggestionsForClassifierImp2).toBeDefined();
	const suggestionsForClusterImp21: IStepSuggestion[] | undefined =
		suggestionsForClassifierImp2?.formulaClusterToStepSuggestionsMap.get('wff')?.stepSuggestions;
	expect(suggestionsForClusterImp21![0].label).toBe('syl');
	expect(suggestionsForClusterImp21![0].completionItemKind).toBe(CompletionItemKind.Interface);
	expect(suggestionsForClusterImp21![0].multiplicity).toBe(17);
	expect(suggestionsForClusterImp21![1].label).toBe('id');
	expect(suggestionsForClusterImp21![1].completionItemKind).toBe(CompletionItemKind.Interface);
	expect(suggestionsForClusterImp21![1].multiplicity).toBe(15);
});