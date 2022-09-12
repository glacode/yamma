
/** constants chared among all classes; we don't use constants because we want tests to be able
 * to modify these values
 */
export abstract class Parameters {
	/** the leftmost position of a formula in a mmp proof displayed in indented mode */
	static startCharForIndentedMmpFormula = 20;
	static defaultLeftMarginForCompressedProofs = 0;
	static defaultRightMarginForCompressedProofs = 80
}