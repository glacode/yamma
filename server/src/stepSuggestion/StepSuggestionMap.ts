import { CompletionItemKind } from 'vscode-languageserver';
import { IStepSuggestion } from './ModelLoader';

export interface StepSuggestionsForFormulaCluster {
	formulaClassifierId: string,
	formulaClusterId: string,
	stepSuggestions: IStepSuggestion[],
	totalMultiplicityForThisCluster: number
}

export interface StepSuggestionsForClassifier {
	formulaClassifierId: string,
	formulaClusterToStepSuggestionsMap: Map<string, StepSuggestionsForFormulaCluster>,
}

/** for each IFormulaClassifier, returns a map, that provides steps suggestions for
formulas  */
export class StepSuggestionMap {
	/** maps a IFormulaClassifier to another map, that gives steps suggestions for
	 * a cluster of formula
	 */
	// map: Map<string, Map<string, IStepSuggestion[]>>;
	map: Map<string, StepSuggestionsForClassifier>;
	constructor() {
		// this.map = new Map<string, Map<string, IStepSuggestion[]>>();
		this.map = new Map<string, StepSuggestionsForClassifier>();
	}
	add(formulaClassifierId: string, completionItemKind: CompletionItemKind, formulaClusterId: string, giustificationLabel: string, multiplicity: number) {
		let stepSuggestionsForClassifier: StepSuggestionsForClassifier | undefined =
			this.map.get(formulaClassifierId);
		if (stepSuggestionsForClassifier == undefined) {
			stepSuggestionsForClassifier = {
				formulaClassifierId: formulaClassifierId,
				formulaClusterToStepSuggestionsMap: new Map<string, StepSuggestionsForFormulaCluster>(),
			};
			this.map.set(formulaClassifierId, stepSuggestionsForClassifier);
		}
		// let stepSuggestions: IStepSuggestion[] | undefined =
		// 	stepSuggestionsForClassifier.formulaClusterToStepSuggestionsMap.get(formulaClusterId)?.stepSuggestions;
		let stepSuggestionsForFormulaCluster: StepSuggestionsForFormulaCluster | undefined =
			stepSuggestionsForClassifier.formulaClusterToStepSuggestionsMap.get(formulaClusterId);
		if (stepSuggestionsForFormulaCluster == undefined) {
			stepSuggestionsForFormulaCluster = {
				formulaClassifierId: formulaClassifierId,
				formulaClusterId: formulaClusterId,
				stepSuggestions: [],
				totalMultiplicityForThisCluster: 0
			};
			stepSuggestionsForClassifier.formulaClusterToStepSuggestionsMap.set(
				formulaClusterId, stepSuggestionsForFormulaCluster);
		}
		const stepSuggestion: IStepSuggestion = {
			completionItemKind: completionItemKind,
			label: giustificationLabel,
			multiplicity: multiplicity,
			stepSuggestionsForFormulaCluster: stepSuggestionsForFormulaCluster
		};
		stepSuggestionsForFormulaCluster.stepSuggestions.push(stepSuggestion);
		stepSuggestionsForFormulaCluster.totalMultiplicityForThisCluster += multiplicity;
	}

	getStepSuggestions(classifierId: string, formulaClusterId: string): IStepSuggestion[] | undefined {
		let stepSuggestions: IStepSuggestion[] | undefined;
		const mapForClassifier: StepSuggestionsForClassifier | undefined =
			this.map.get(classifierId);
		if (mapForClassifier != undefined)
			// the classifier actually existed in this map
			stepSuggestions = mapForClassifier.formulaClusterToStepSuggestionsMap.get(formulaClusterId)?.stepSuggestions;
		return stepSuggestions;
	}

	// buildTextToWrite(): string {
	// 	let textToWrite = '';
	// 	// let currentRpnSyntaxTreeIndex = 0;
	// 	this.map.forEach((stepSuggestionMap: Map<string, IStepSuggestion[]>, _classifierId: string) => {
	// 		stepSuggestionMap.forEach((stepSuggestions: IStepSuggestion[],
	// 			formulaClusterKey: string) => {
	// 			stepSuggestions.sort((a: { label: string, multiplicity: number },
	// 				b: { label: string, multiplicity: number }) => b.multiplicity - a.multiplicity);
	// 			stepSuggestions.forEach((giustification: { label: string; multiplicity: number; }) => {
	// 				const csvLine = `${formulaClusterKey},${giustification.label},${giustification.multiplicity}\n`;
	// 				textToWrite += csvLine;
	// 			});
	// 			// currentRpnSyntaxTreeIndex++;
	// 			// notifyProgressWithTimestampAndMemory('Creating string...', currentRpnSyntaxTreeIndex, this.stepGiustificationStatistics.size);
	// 		});
	// 	});

	// 	return textToWrite;
	// }
}