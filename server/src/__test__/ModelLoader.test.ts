import { CompletionItemKind } from 'vscode-languageserver';
import { formulaClassifiersExample, IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { IStepSuggestion } from '../stepSuggestion/ModelBuilder';
import { ModelLoader } from '../stepSuggestion/ModelLoader';
import { StepSuggestionMap } from '../stepSuggestion/StepSuggestionMap';

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
	const model: string = 'full3,wff wff wi TOP,id,15\n' +
		'full3,wff wff wi TOP,syl,10\n' +
		'full3,wff wff wi TOP,biimpi,10\n' +
		'full3,wff wff wn wi wi TOP,con2d,2\n' +
		'full3,wff wff wn wi wi TOP,con4d,1\n' +
		'full3,wff wff wn wi wi TOP,a1i,1\n' +
		'imp2,wff,syl,17\n' +
		'imp2,wff,id,15';
	const stepSuggestionMap: StepSuggestionMap = modelLoader.buildSuggestionsMapForModel(model);
	expect(stepSuggestionMap.map.size).toBe(2);
	const suggestionMapFull3: Map<string, IStepSuggestion[]> | undefined = stepSuggestionMap.map.get('full3');
	expect(suggestionMapFull3).toBeDefined();
	expect(suggestionMapFull3!.size).toBe(2);
	const suggestionMapFull32: IStepSuggestion[] | undefined = suggestionMapFull3?.get('wff wff wn wi wi TOP');
	expect(suggestionMapFull32).toBeDefined();
	expect(suggestionMapFull32![0].label).toBe('con2d');
	expect(suggestionMapFull32![0].completionItemKind).toBe(CompletionItemKind.Event);
	expect(suggestionMapFull32![0].multiplicity).toBe(2);
	expect(suggestionMapFull32![1].label).toBe('con4d');
	expect(suggestionMapFull32![1].completionItemKind).toBe(CompletionItemKind.Event);
	expect(suggestionMapFull32![1].multiplicity).toBe(1);
	expect(suggestionMapFull32![2].label).toBe('a1i');
	expect(suggestionMapFull32![2].completionItemKind).toBe(CompletionItemKind.Event);
	expect(suggestionMapFull32![2].multiplicity).toBe(1);
	const suggestionMapImp2: Map<string, IStepSuggestion[]> | undefined = stepSuggestionMap.map.get('imp2');
	expect(suggestionMapImp2).toBeDefined();
	const suggestionMapImp21: IStepSuggestion[] | undefined = suggestionMapImp2?.get('wff');
	expect(suggestionMapImp21![0].label).toBe('syl');
	expect(suggestionMapImp21![0].completionItemKind).toBe(CompletionItemKind.Interface);
	expect(suggestionMapImp21![0].multiplicity).toBe(17);
	expect(suggestionMapImp21![1].label).toBe('id');
	expect(suggestionMapImp21![1].completionItemKind).toBe(CompletionItemKind.Interface);
	expect(suggestionMapImp21![1].multiplicity).toBe(15);



});