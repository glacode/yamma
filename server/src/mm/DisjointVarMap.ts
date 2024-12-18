/**
 * An efficient representation for a set of disjoint vars
 */
export class DisjointVarMap {
	map: Map<string, Set<string>>;

	constructor() {
		this.map = new Map<string, Set<string>>();
	}

	/**Adds the two vars (in the right order) to the map */
	add(var1: string, var2: string) {
		if (var1 == var2)
			throw new Error("This method should be invoked with distinct vars");
		else {
			const orderedVar1 = (var1 < var2 ? var1 : var2);
			const orderedVar2 = (var1 < var2 ? var2 : var1);
			let varsDisjointFromOrderedVar1 = this.map.get(orderedVar1);
			if (varsDisjointFromOrderedVar1 == undefined) {
				// this is the first disjoint var constraints with orderedVar1 in the first position
				varsDisjointFromOrderedVar1 = new Set<string>();
				this.map.set(orderedVar1, varsDisjointFromOrderedVar1);
			}
			varsDisjointFromOrderedVar1.add(orderedVar2);
		}
	}

	containsDjContraint(var1: string, var2: string): boolean {
		const orderedVar1 = (var1 < var2 ? var1 : var2);
		const orderedVar2 = (var1 < var2 ? var2 : var1);
		const varsDisjointFromOrderedVar1 = this.map.get(orderedVar1);
		const result: boolean = varsDisjointFromOrderedVar1 != undefined && varsDisjointFromOrderedVar1.has(orderedVar2);
		return result;
	}

	/**
	* Disjoint Vars are sorted lexicographically (each constraint is returned as an array with two elements)
	*/
	public get sortedDisjVarPairs(): Array<[string, string]> {
		const pairs: Array<[string, string]> = [];

		// Sort the keys of the Map
		const sortedVar1 = Array.from(this.map.keys()).sort();

		for (const var1 of sortedVar1) {
			const setOfVarsDisjointFromVar1 = this.map.get(var1);
			if (setOfVarsDisjointFromVar1) {
				// Sort the elements of the Set
				const sortedVars2 = Array.from(setOfVarsDisjointFromVar1).sort();
				for (const var2 of sortedVars2) {
					pairs.push([var1, var2]);
				}
			}
		}
		return pairs;
	}
}