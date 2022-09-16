/** objects available in all modules, to avoid having frequently used parameters
 * to be passed to many classes / methods
 */

import { ConfigurationManager, IExtensionSettings } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { IStepSuggestion } from '../stepSuggestion/ModelBuilder';

export abstract class GlobalState {

	/** the mmParser containing the current theory */
	static mmParser: MmParser;

	/** the last MmpParser used for a validation of the current .mmp file */
	static lastMmpParser: MmpParser;

	/** maps every rpnSyntaxTree to a list of suggestion */
	static stepSuggestionMap: Map<string, IStepSuggestion[]>;

	/** the ConfigurationManager created in server.ts */
	static configurationManager: ConfigurationManager;

	/** last settings fetched by the configuration manager from the workspace configuration */
	static lastFetchedSettings: IExtensionSettings;
	
}