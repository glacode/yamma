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
	add(classifierId: string, completionItemKind: CompletionItemKind, formulaCluster: string, giustificationLabel: string, multiplicity: number) {
		let mapForClassifier: Map<string, IStepSuggestion[]> | undefined =
			this.map.get(classifierId);
		if (mapForClassifier == undefined) {
			mapForClassifier = new Map<string, IStepSuggestion[]>();
			this.map.set(classifierId, mapForClassifier);
		}
		let stepSuggestionMap: IStepSuggestion[] | undefined = mapForClassifier.get(formulaCluster);
		if (stepSuggestionMap == undefined) {
			stepSuggestionMap = [];
			mapForClassifier.set(formulaCluster, stepSuggestionMap);
		}
		const stepSuggestion: IStepSuggestion = {
			kind: completionItemKind,
			label: giustificationLabel,
			multiplicity: multiplicity
		};
		stepSuggestionMap.push(stepSuggestion);
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