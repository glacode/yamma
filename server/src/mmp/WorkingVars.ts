import { IVariableKindConfiguration } from '../mm/ConfigurationManager';

export class WorkingVars {
	kindToPrefixMap: Map<string, string> = new Map<string, string>();
	prefixToKindMap: Map<string, string> = new Map<string, string>();
	// prefixSet: Set<string> = new Set<string>();
	// for each var kind, _maxIndex contains the max index already used
	private _maxIndex: Map<string, number> = new Map<string, number>();
	private _workingVarPrefixes: Set<string> = new Set<string>()
	private _alreadyCreatedWorkingVars: Set<string> = new Set<string>();

	//#region constructor
	private addMap(varKind: string, workinVarPrefix: string) {
		this.kindToPrefixMap.set(varKind, workinVarPrefix);
		this.prefixToKindMap.set(workinVarPrefix, varKind);
	}

	constructor(kindToPrefixMap: Map<string, string>) {
		if (kindToPrefixMap != undefined)
			kindToPrefixMap.forEach((prefix: string, variableKind: string) => {
				this.addMap(variableKind, prefix);
			});
		// this.addMap("wff", "W");
		// this.addMap("class", "C");
		// this.addMap("setvar", "S");

		this.kindToPrefixMap.forEach((value: string, key: string) => {
			this._maxIndex.set(key, 0);
			this._workingVarPrefixes.add(value);
		});
		// this.typeToPrefixMap.forEach(typePrefix => {
		// 	this.prefixSet.add("&" + typePrefix );
		// });
	}
	//#endregion constructor

	/** creates a map from theory variable's kinds to working var prefix, given the
	 * configuration for working vars
	 */
	static getKindToWorkingVarPrefixMap(variableKindsConfiguration: Map<string, IVariableKindConfiguration>): Map<string, string> {
		const kindToWorkingVarPrefixMapesult: Map<string, string> = new Map<string, string>();
		variableKindsConfiguration.forEach((variableKindConfiguration: IVariableKindConfiguration, variableKind: string) => {
			kindToWorkingVarPrefixMapesult.set(variableKind, variableKindConfiguration.workingVarPrefix);
		});
		return kindToWorkingVarPrefixMapesult;
	}

	//TODO this is note used by anything, and _value is not use. What
	//did you want to do?
	reset() {
		this._alreadyCreatedWorkingVars.clear();
		this.kindToPrefixMap.forEach((_value: string, key: string) => {
			this._maxIndex.set(key, 0);
		});
	}

	/**
	 * if workingVar is a working var, returns its kind
	 * @param workingVar 
	 */
	kindOf(workingVar: string): string | undefined {
		let kind: string | undefined;
		if (workingVar.length > 1)
			kind = this.prefixToKindMap.get(workingVar.charAt(1));
		return kind;
	}

	/**
	 * if workingVar is a working var, returns its index; for instance, for &W12 returns 12 
	 * @param workingVar 
	 * @returns 
	 */
	indexOf(workingVar: string): number {
		const strIndex = workingVar.substring(2);
		const index = parseInt(strIndex);
		return index;
	}

	//#region tokenType
	isAWorkingVarSymbol(value: string) {
		const isAWorkingVar: boolean = value.startsWith('&') && value.length > 2 &&
			this.kindOf(value) != undefined && !isNaN(parseInt(value.substring(2)));
		return isAWorkingVar;
	}
	tokenType(value: string): string | undefined {
		let tokenType: string | undefined;
		// if (value.startsWith("&") && value.length > 1)
		// 	tokenType = this.prefixToKindMap.get(value.charAt(1));
		if (this.isAWorkingVarSymbol(value)) {
			// const kind: string | undefined = this.prefixToKindMap.get(value.charAt(1));
			const kind: string | undefined = this.kindOf(value);
			if (kind != undefined)
				tokenType = this.tokenTypeFromKind(kind);
		}
		return tokenType;
	}
	//#endregion tokenType

	// this gives a nicer error message with Nearley.js
	tokenTypeFromKind(kind: string): string {
		return "workvar_" + kind;
	}

	getNewWorkingVar(variableKind: string): string | undefined {
		let newWorkingVar: string | undefined;
		const maxIndex: number | undefined = this._maxIndex.get(variableKind);
		if (maxIndex != undefined) {
			const newMaxIndex = maxIndex + 1;
			newWorkingVar = "&" + <string>this.kindToPrefixMap.get(variableKind) + newMaxIndex;
			this._maxIndex.set(variableKind, newMaxIndex);
			this._alreadyCreatedWorkingVars.add(newWorkingVar);
		}
		return newWorkingVar;
	}

	isAlreadyExistentWorkingVar(symbol: string): boolean {
		const isWorkingVar: boolean = this._alreadyCreatedWorkingVars.has(symbol);
		return isWorkingVar;
	}

	/**
	 * if workingVar is a working var, returns the max index already given for that kind
	 * of working var
	 * @param workingVar 
	 * @returns s
	 */
	maxIndex(workingVar: string): number | undefined {
		let maxIndex: number | undefined;
		if (this.isAWorkingVarSymbol(workingVar)) {
			const kind: string | undefined = this.kindOf(workingVar);
			if (kind != undefined)
				maxIndex = this._maxIndex.get(kind);
		}
		return maxIndex;
	}

	/**
	 * if symbol is a Working Var, WorkingVars state is updated
	 * @param symbol 
	 */
	updateWorkingVarsIfTheCase(symbol: string): void {
		if (this.isAWorkingVarSymbol(symbol)) {
			this._alreadyCreatedWorkingVars.add(symbol);
			// if (this.isAlreadyExistentWorkingVar(symbol)) {
			const kind: string = <string>this.kindOf(symbol);
			const currentMaxIndex: number = <number>(this._maxIndex.get(kind));
			const workingVarIndex: number = this.indexOf(symbol);
			if (currentMaxIndex < workingVarIndex)
				this._maxIndex.set(kind, workingVarIndex);
		}
	}
}