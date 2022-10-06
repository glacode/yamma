
import { MmParser } from '../mm/MmParser';

export interface IFormulaClassifier {
	/** a unique identifier to distinguish among different classifiers */
	id: string,

	// /** the MmParser to be used to classify formulas */
	// setMmParser( mmParser: MmParser ): void,

	/** given a formula and a MmParser, returns the syntax tree of the formula,
	 * as a string representation in rpn format
	 */
	buildRpnSyntaxTreeFromFormula(formula: string[], mmParser: MmParser): string
}