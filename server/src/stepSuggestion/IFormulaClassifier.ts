
import { ParseNode } from '../grammar/ParseNode';
import { MmParser } from '../mm/MmParser';

/** classes that implement this interface, create clusters of
 * 'similar' formulas
 */
export interface IFormulaClassifier {
	/** a unique identifier to distinguish among different classifiers */
	id: string,

	// /** the MmParser to be used to classify formulas */
	// setMmParser( mmParser: MmParser ): void,

	/** given a formula and a MmParser, returns a string that
	 * classifies the formula
	 */
	classify(formula: ParseNode, mmParser: MmParser): string
	//  classify(formula: string[] | ParseNode, mmParser: MmParser): string
}