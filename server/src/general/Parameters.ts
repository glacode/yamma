
/** parameters shared among all classes; we don't use constants because we want tests to be able
 * to modify these values
 */
export abstract class Parameters {
	/** the leftmost position of a formula in a mmp proof displayed in indented mode */
	static startCharForIndentedMmpFormula = 20;
	static defaultLeftMarginForCompressedProofs = 0;
	static defaultRightMarginForCompressedProofs = 80
	/** the minimum number of characters, for a partial label, that triggers
	 * the 'last resort' step suggestion
	 */
	static numberOfCharsTriggeringCompletionItemsFromPartialLabel = 3;

	/** the maximum number of characters that will populate a new search statement
	 * (computed from the statemente where the cursor is placed)
	 */
	static maxNumberOfSymbolsComputedForSearch = 3;
}