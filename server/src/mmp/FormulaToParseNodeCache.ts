import { InternalNode } from '../grammar/ParseNode';

export class FormulaToParseNodeCache {

	public formulaToInternalNodeMap: Map<string, InternalNode>;

	/** cache for formula recently parsed. It should speed up MmpParser, because
	 * it should allow avoiding most of the parsing time (an .mmp file doesn't
	 * change much from an edit to the other)
	 */
	constructor() {
		this.formulaToInternalNodeMap = new Map<string, InternalNode>();
	}

	public add(formula: string, internalNode: InternalNode) {
		// in this first implementation, we never clean the cache (in user session
		// there should not be an unmanageable number of formulas, but we will
		// see if some cleanup will be needed)
		this.formulaToInternalNodeMap.set(formula, internalNode);
	}
}