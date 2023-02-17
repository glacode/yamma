/** This class computes a number of theory related statistics */

import { MmParser } from './MmParser';
import { AssertionStatement } from "./AssertionStatement";
import { EHyp } from './EHyp';
import { GlobalState } from '../general/GlobalState';

export class MmStatistics {
	mmParser: MmParser;

	/** maps every symbol to the set of assertions wher it appears */
	symbolToAssertionsMap: Map<string, Set<AssertionStatement>> | undefined;

	constructor(mmParser: MmParser) {
		this.mmParser = mmParser;
	}

	//#region buildStatistics

	//#region buildStatisticsForAssertion

	buildStatisticsForSingleFormula(formula: string[], assertion: AssertionStatement) {
		formula.forEach((symbol: string) => {
			let setForThisSymbol: Set<AssertionStatement> | undefined = this.symbolToAssertionsMap?.get(symbol);
			if (setForThisSymbol == undefined) {
				// this symbol has not been added to the map yet
				setForThisSymbol = new Set<AssertionStatement>();
				this.symbolToAssertionsMap?.set(symbol, setForThisSymbol);
			}
			setForThisSymbol.add(assertion);
		});
	}
	private buildStatisticsForAssertion(assertion: AssertionStatement) {
		this.buildStatisticsForSingleFormula(assertion.formula, assertion);
		assertion.frame?.eHyps.forEach((eHyp: EHyp) => {
			this.buildStatisticsForSingleFormula(eHyp.formula, assertion);
		});
	}
	//#endregion buildStatisticsForAssertion

	/**
	 * builds the statistics for the given theory
	 */
	public buildStatistics() {
		this.symbolToAssertionsMap = new Map<string, Set<AssertionStatement>>();
		this.mmParser.labelToNonSyntaxAssertionMap.forEach((assertion: AssertionStatement) => {
			this.buildStatisticsForAssertion(assertion);
		});
	}
	//#endregion buildStatistics

	static updateStatistics(mmParser: MmParser, globalState: GlobalState) {
		const mmStatistics: MmStatistics = new MmStatistics(mmParser);
		mmStatistics.buildStatistics();
		globalState.mmStatistics = mmStatistics;
	}
}