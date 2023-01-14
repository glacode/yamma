/** objects available in all modules, to avoid having frequently used parameters
 * to be passed to many classes / methods
 */

import { Connection, Range } from 'vscode-languageserver';
import { ConfigurationManager, IExtensionSettings } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmStatistics } from '../mm/MmStatistics';
import { FormulaToParseNodeCache } from '../mmp/FormulaToParseNodeCache';
import { MmpParser } from '../mmp/MmpParser';
import { MmpStatistics } from '../mmp/MmpStatistics';
import { StepSuggestionMap } from '../stepSuggestion/StepSuggestionMap';

export abstract class GlobalState {

	/** the path of the .mm file containing the current theory */
	static mmFilePath?: string;

	/** the mmParser containing the current theory */
	static mmParser?: MmParser;

	/** the statistics for the current theory */
	static mmStatistics?: MmStatistics;

	/** the last MmpParser used for a validation of the current .mmp file */
	static lastMmpParser?: MmpParser;

	/** the statistics for the mmp file */
	static mmpStatistics?: MmpStatistics;

	/** maps every rpnSyntaxTree to a list of suggestion */
	static stepSuggestionMap: StepSuggestionMap;
	// static stepSuggestionMap: Map<string, IStepSuggestion[]>;

	/** the ConfigurationManager created in server.ts */
	static configurationManager: ConfigurationManager;

	/** last settings fetched by the configuration manager from the workspace configuration */
	static lastFetchedSettings: IExtensionSettings | undefined;

	static connection: Connection;


	static suggestedRangeForCursorPosition?: Range;

	static setSuggestedRangeForCursorPosition(range: Range | undefined) {
		this.suggestedRangeForCursorPosition = range;
	}

	static isTriggerSuggestRequired = false;

	static requireTriggerSuggest() {
		this.isTriggerSuggestRequired = true;
	}

	static resetTriggerSuggest() {
		this.isTriggerSuggestRequired = false;
	}

	/** set to true when a validation occurs; set to false when a unify() occurs */
	static validatedSinceLastUnify: boolean | undefined;

	private static _formulaToParseNodeCache?: FormulaToParseNodeCache;

	public static get formulaToParseNodeCache(): FormulaToParseNodeCache {
		if (this._formulaToParseNodeCache == undefined)
			this._formulaToParseNodeCache = new FormulaToParseNodeCache();
		return this._formulaToParseNodeCache;
	}
}