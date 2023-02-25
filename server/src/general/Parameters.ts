
/** parameters shared among all classes; we don't use constants because we want tests to be able
 * to modify these values
 */
export abstract class Parameters {
	/** the leftmost position of a formula in a mmp proof displayed in indented mode */
	static startCharForIndentedMmpFormula = 20;
	static defaultLeftMarginForCompressedProofs = 0;
	static defaultRightMarginForCompressedProofs = 80
	static defaultRightMarginForNormalProofs = 80
	/** the minimum number of characters, for a partial label, that triggers
	 * the 'last resort' step suggestion
	 */
	static numberOfCharsTriggeringCompletionItemsFromPartialLabel = 1;

	/** the maximum number of characters that will populate a new search statement
	 * (computed from the statemente where the cursor is placed)
	 */
	static maxNumberOfSymbolsComputedForSearch = 3;


	/** max number of hypothesis dispositions to be tried for a single
	 * assertion, candidate for a step derivation; for instance, if
	 * a logical assertion has 3 hypothesis and the step to be derived
	 * follows 10 steps, then in the worst case, 10^3 dispositions
	 * should be tried; if the worst case exceedes this parameter,
	 * the derivation is not even tried
	 */
	static maxNumberOfHypothesisDispositionsForStepDerivation = 100000;

	static defaultComment = "* WriteYourComment";
}