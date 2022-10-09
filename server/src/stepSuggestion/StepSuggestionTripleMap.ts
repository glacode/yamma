/** an efficient data structure to store classifierId, formulaClusterId,
 * theoremLabelUsedInThePast, multiplicity (while building the model) 
  */
export class StepSuggestionTripleMap {
	map: Map<string, Map<string, Map<string, number>>>;
	constructor() {
		this.map = new Map<string, Map<string, Map<string, number>>>();
	}

	//#region add
	private addNewDoubleMap(stepGiustificationStatistics: Map<string, Map<string, number>>,
		formulaClusterId: string, currentStepLabel: string) {
		const newMap: Map<string, number> = new Map<string, number>();
		newMap.set(currentStepLabel, 1);
		stepGiustificationStatistics.set(formulaClusterId, newMap);
	}
	add(classifierId: string, formulaClusterId: string, currentStepLabel: string) {
		let stepGiustificationStatistics: Map<string, Map<string, number>> | undefined =
			this.map.get(classifierId);
		if (stepGiustificationStatistics == undefined) {
			// it is the first time this classifier is used by the ModelBuilder
			stepGiustificationStatistics = new Map<string, Map<string, number>>();
			this.map.set(classifierId, stepGiustificationStatistics);
		}
		const labelStatistics: Map<string, number> | undefined = stepGiustificationStatistics.get(formulaClusterId);
		if (labelStatistics == undefined) {
			// it is the first time a proof step is found with the given classifierId (for the given classifierID)
			this.addNewDoubleMap(stepGiustificationStatistics, formulaClusterId, currentStepLabel);
		} else {
			// classifierId was found before for a proof step formula (for the given classifierID)
			const previousMultiplicity: number | undefined = labelStatistics.get(currentStepLabel);
			if (previousMultiplicity == undefined) {
				// it is the first time this formula has been proven using currentStepLabel
				labelStatistics.set(currentStepLabel, 1);
				// this.addNewMap(rpnSyntaxTree, currentStepLabel);
			} else
				// this formula has already been proven using currentStepLabel
				labelStatistics.set(currentStepLabel, previousMultiplicity + 1);
		}
	}
	//#endregion add

	buildTextToWrite(): string {
		let textToWrite = '';
		// let currentRpnSyntaxTreeIndex = 0;
		this.map.forEach((stepSuggestionDoubleMap: Map<string, Map<string, number>>, classifierId: string) => {
			stepSuggestionDoubleMap.forEach((labelToMultiplicityMap: Map<string, number>,
				formulaClusterKey: string) => {
					const arrayForSingleTree: Array<{ label: string, multiplicity: number }> =
				Array.from(labelToMultiplicityMap, ([label, multiplicity]) => ({
					label: label,
					multiplicity: multiplicity
				}));
			// sort giustifications in descending order of
			arrayForSingleTree.sort((a: { label: string, multiplicity: number },
				b: { label: string, multiplicity: number }) => b.multiplicity - a.multiplicity);
			arrayForSingleTree.forEach((giustification: { label: string; multiplicity: number; }) => {
				const csvLine = `${classifierId},${formulaClusterKey},${giustification.label},${giustification.multiplicity}\n`;
				textToWrite += csvLine;
			});
			// currentRpnSyntaxTreeIndex++;
			// notifyProgressWithTimestampAndMemory('Creating string...', currentRpnSyntaxTreeIndex, this.stepGiustificationStatistics.size);
				// currentRpnSyntaxTreeIndex++;
				// notifyProgressWithTimestampAndMemory('Creating string...', currentRpnSyntaxTreeIndex, this.stepGiustificationStatistics.size);
			});
		});

		return textToWrite;
	}
}