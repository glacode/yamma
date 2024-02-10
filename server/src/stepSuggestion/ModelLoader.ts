import { CompletionItemKind, Connection } from 'vscode-languageserver';
import { IFormulaClassifier } from './IFormulaClassifier';
import { StepSuggestionMap, StepSuggestionsForFormulaCluster, } from './StepSuggestionMap';
import * as fs from 'fs';
import { ModelBuilder } from './ModelBuilder';
import { notifyWarning } from '../mm/Utils';

export interface IStepSuggestion {
	completionItemKind: CompletionItemKind,
	label: string,
	multiplicity: number,
	stepSuggestionsForFormulaCluster: StepSuggestionsForFormulaCluster
}

export class ModelLoader {
	private mmFilePath: string;

	/** maps a classifierId to a CompletionItemKind */
	private completionItemKind: Map<string, CompletionItemKind>;

	constructor(mmFilePath: string, formulaClassifiers: IFormulaClassifier[]) {
		this.mmFilePath = mmFilePath;
		this.completionItemKind = this.initializeCompletionItemKind(formulaClassifiers);
	}

	private initializeCompletionItemKind(formulaClassifiers: IFormulaClassifier[]): Map<string, CompletionItemKind> {
		//TODO if formulaClassifier.length > 2 you will get an exception, later on; you
		//may cycle modulo n
		const completionItemKindArray: CompletionItemKind[] = [
			CompletionItemKind.Event,
			CompletionItemKind.Interface
		];
		const completionItemKind: Map<string, CompletionItemKind> = new Map<string, CompletionItemKind>();
		formulaClassifiers.forEach((formulaClassifier: IFormulaClassifier, index: number) => {
			completionItemKind.set(formulaClassifier.id, completionItemKindArray[index]);
		});
		return completionItemKind;
	}

	//#region loadSuggestionsMap

	//#region loadSuggestionsMapForExistingModel
	// private static getModelRows(modelFullPath: string): string[] {
	private static getModelRows(model: string): string[] {
		// const model: string = fs.readFileSync(modelFullPath, 'utf-8');
		const modelRows: string[] = model.split('\n');
		return modelRows;
	}
	// private static buildSuggestionsMap(modelRows: string[]): Map<string, IStepSuggestion[]> {
	// 	const suggestionsMap: Map<string, IStepSuggestion[]> = new Map<string, IStepSuggestion[]>();
	// 	let singleRpnSyntaxTreeSuggestions: IStepSuggestion[] = [];
	// 	let modelRowString: string = modelRows[0];
	// 	let modelRowArray: string[] = modelRowString.split(',');
	// 	let rpnSyntaxTree: string = modelRowArray[0];
	// 	let i = 0;
	// 	while (i < modelRows.length) {
	// 		modelRowString = modelRows[i];
	// 		modelRowArray = modelRowString.split(',');
	// 		const newRpnSyntaxTree: string = modelRowArray[0];
	// 		if (newRpnSyntaxTree != rpnSyntaxTree) {
	// 			suggestionsMap.set(rpnSyntaxTree, singleRpnSyntaxTreeSuggestions);
	// 			rpnSyntaxTree = newRpnSyntaxTree;
	// 			singleRpnSyntaxTreeSuggestions = [];
	// 		}
	// 		const giustificationLabel: string = modelRowArray[1];
	// 		const multiplicity: number = parseInt(modelRowArray[2]);
	// 		const stepSuggestion: IStepSuggestion = {
	// 			label: giustificationLabel,
	// 			multiplicity: multiplicity
	// 		};
	// 		singleRpnSyntaxTreeSuggestions.push(stepSuggestion);
	// 		i++;
	// 	}
	// 	return suggestionsMap;
	// }
	// private buildSuggestionsMap(modelRows: string[]): Map<string, IStepSuggestion[]> {
	private buildSuggestionsMap(modelRows: string[]): StepSuggestionMap {
		const suggestionMap: StepSuggestionMap = new StepSuggestionMap();
		let modelRowString: string = modelRows[0];
		let modelRowArray: string[] = modelRowString.split(',');
		let i = 0;
		while (i < modelRows.length) {
			modelRowString = modelRows[i];
			modelRowArray = modelRowString.split(',');
			// const formulaCluster: string = modelRowArray[0];
			// const giustificationLabel: string = modelRowArray[1];
			// const multiplicity: number = parseInt(modelRowArray[2]);
			const classifierId: string = modelRowArray[0];
			const completionItemKind: CompletionItemKind = this.completionItemKind.get(classifierId)!;
			const formulaCluster: string = modelRowArray[1];
			const giustificationLabel: string = modelRowArray[2];
			const multiplicity: number = parseInt(modelRowArray[3]);
			// suggestionMap.add(classifierId, completionItemKind, formulaCluster, giustificationLabel, multiplicity);
			suggestionMap.add(classifierId, completionItemKind, formulaCluster, giustificationLabel, multiplicity);
			i++;
		}
		// const result: Map<string, IStepSuggestion[]> = suggestionMap.map.get(this.completionItemGroups.id)!;
		// return result;
		// return suggestionMap.map;
		return suggestionMap;
	}

	// private loadSuggestionsMapForExistingModel(modelFullPath: string): Map<string, IStepSuggestion[]> {
	// private loadSuggestionsMapForExistingModel(modelFullPath: string): StepSuggestionMap {
	protected buildSuggestionsMapForModel(model: string): StepSuggestionMap {
		// const modelRows: string[] = ModelLoader.getModelRows(modelFullPath);
		const modelRows: string[] = ModelLoader.getModelRows(model);
		// const suggestionsMap: Map<string, IStepSuggestion[]> = this.buildSuggestionsMap(modelRows);
		const suggestionsMap: StepSuggestionMap = this.buildSuggestionsMap(modelRows);
		return suggestionsMap;
	}
	private loadSuggestionsMapForExistingModel(modelFullPath: string): StepSuggestionMap {
		const model: string = fs.readFileSync(modelFullPath, 'utf-8');
		const suggestionsMap: StepSuggestionMap = this.buildSuggestionsMapForModel(model);
		// const modelRows: string[] = ModelLoader.getModelRows(modelFullPath);
		// const suggestionsMap: Map<string, IStepSuggestion[]> = this.buildSuggestionsMap(modelRows);
		// const suggestionsMap: StepSuggestionMap = this.buildSuggestionsMap(modelRows);
		return suggestionsMap;
	}
	//#endregion loadSuggestionsMapForExistingModel


	// static async loadSuggestionsMap(modelFullPath: string, connection: Connection): Promise<Map<string, IStepSuggestion[]>> {
	// async loadSuggestionsMap(connection: Connection): Promise<Map<string, IStepSuggestion[]>> {
	async loadSuggestionsMap(connection: Connection): Promise<StepSuggestionMap> {
		const modelFullPath: string = ModelBuilder.buildModelFileFullPath(this.mmFilePath);
		// let suggestionsMap: Map<string, IStepSuggestion[]> = new Map<string, IStepSuggestion[]>();
		let suggestionsMap: StepSuggestionMap = new StepSuggestionMap();
		if (fs.existsSync(modelFullPath))
			suggestionsMap = this.loadSuggestionsMapForExistingModel(modelFullPath);
		else {
			// the file for the model does not exist
			const message = `The model file ${modelFullPath} has not been found. The extension ` +
				`will work anyway, but step suggestions will not be as accurate and useful as they ` +
				`would be using a trained model.`;
			// notifyError(errorMessage,connection);
			notifyWarning(message, connection);
		}
		return suggestionsMap;
	}
	//#endregion loadSuggestionsMap
}