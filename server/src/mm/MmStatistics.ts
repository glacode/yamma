/** This class computes a number of theory related statistics */

import { MmParser } from './MmParser';
import { AssertionStatement } from "./AssertionStatement";

export class MmStatistics {
	mmParser: MmParser;

	/** maps every symbol to the set of assertions wher it appears */
	symbolToAssertionsMap: Map<string, Set<AssertionStatement>> | undefined;

	constructor(mmParser: MmParser) {
		this.mmParser = mmParser;
	}

	//#region buildStatistics
	//TODO1 decide if you want to add EHyps also
	private buildStatisticsForAssertion(assertion: AssertionStatement) {
		assertion.formula.forEach((symbol: string) => {
			let setForThisSymbol: Set<AssertionStatement> | undefined = this.symbolToAssertionsMap?.get(symbol);
			if (setForThisSymbol == undefined) {
				// this symbol has not been added to the map yet
				setForThisSymbol = new Set<AssertionStatement>();
				this.symbolToAssertionsMap?.set(symbol,setForThisSymbol);
			}
			setForThisSymbol.add(assertion);
		});
	}

	/**
	 * builds the statistics for the given theory
	 */
	public buildStatistics() {
		this.symbolToAssertionsMap = new Map<string, Set<AssertionStatement>>();
		this.mmParser.labelToAssertionMap.forEach((assertion: AssertionStatement) => {
			this.buildStatisticsForAssertion(assertion);
		});
	}
	//#endregion buildStatistics
}