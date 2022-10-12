import { CompletionItemKind } from 'vscode-languageserver';
import { IStepSuggestion } from './ModelBuilder';

/** for each IFormulaClassifier, returns a map, that provides steps suggestions for
formulas  */
export class StepSuggestionMap {
	/** maps a IFormulaClassifier to another map, that gives steps suggestions for
	 * a cluster of formula
	 */
	map: Map<string, Map<string, IStepSuggestion[]>>;
	constructor() {
		this.map = new Map<string, Map<string, IStepSuggestion[]>>();
	}
	add(formulaClassifierId: string, completionItemKind: CompletionItemKind, formulaClusterId: string, giustificationLabel: string, multiplicity: number) {
		let mapForClassifier: Map<string, IStepSuggestion[]> | undefined =
			this.map.get(formulaClassifierId);
		if (mapForClassifier == undefined) {
			mapForClassifier = new Map<string, IStepSuggestion[]>();
			this.map.set(formulaClassifierId, mapForClassifier);
		}
		let stepSuggestionMap: IStepSuggestion[] | undefined = mapForClassifier.get(formulaClusterId);
		if (stepSuggestionMap == undefined) {
			stepSuggestionMap = [];
			mapForClassifier.set(formulaClusterId, stepSuggestionMap);
		}
		const stepSuggestion: IStepSuggestion = {
			completionItemKind: completionItemKind,
			label: giustificationLabel,
			multiplicity: multiplicity
		};
		stepSuggestionMap.push(stepSuggestion);
	}

	getStepSuggestions(classifierId: string, formulaClusterId: string): IStepSuggestion[] | undefined {
		let stepSuggestions: IStepSuggestion[] | undefined;
		const mapForClassifier: Map<string, IStepSuggestion[]> | undefined =
			this.map.get(classifierId);
		if (mapForClassifier != undefined)
			// the classifier actually existed in this map
			stepSuggestions = mapForClassifier.get(formulaClusterId);
		return stepSuggestions;
	}


	//TODO1
	buildTextToWrite(): string {
		let textToWrite = '';
		// let currentRpnSyntaxTreeIndex = 0;
		this.map.forEach((stepSuggestionMap: Map<string, IStepSuggestion[]>, _classifierId: string) => {
			stepSuggestionMap.forEach((stepSuggestions: IStepSuggestion[],
				formulaClusterKey: string) => {
				// const arrayForSingleTree = new Array(labelToMultiplicityMap.entries);
				// const arrayForSingleTree: Array<{ label: string, multiplicity: number }> =
				// 	Array.from(stepSuggestions, ([label, multiplicity]) => ({
				// 		label: label,
				// 		multiplicity: multiplicity
				// 	}));
				// sort giustifications in descending order of
				// arrayForSingleTree.sort((a: { label: string, multiplicity: number },
				// 	b: { label: string, multiplicity: number }) => b.multiplicity - a.multiplicity);
				// arrayForSingleTree.forEach((giustification: { label: string; multiplicity: number; }) => {
				// 	const csvLine = `${formulaClusterKey},${giustification.label},${giustification.multiplicity}\n`;
				// 	textToWrite += csvLine;
				stepSuggestions.sort((a: { label: string, multiplicity: number },
					b: { label: string, multiplicity: number }) => b.multiplicity - a.multiplicity);
				stepSuggestions.forEach((giustification: { label: string; multiplicity: number; }) => {
					const csvLine = `${formulaClusterKey},${giustification.label},${giustification.multiplicity}\n`;
					textToWrite += csvLine;
				});
				// currentRpnSyntaxTreeIndex++;
				// notifyProgressWithTimestampAndMemory('Creating string...', currentRpnSyntaxTreeIndex, this.stepGiustificationStatistics.size);
			});
		});

		return textToWrite;
	}
}