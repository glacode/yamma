import { Connection, DidChangeConfigurationParams } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { TheoryLoader } from './TheoryLoader';

export enum ProofMode {
	normal = "normal",
	packed = "packed",
	compressed = "compressed"
}

export enum DiagnosticMessageForSyntaxError {
	short = "short",
	verbose = "verbose"
}
export default DiagnosticMessageForSyntaxError;

export interface IVariableKindConfiguration {
	workingVarPrefix: string,
	lspSemantictokenType: string
}

interface IKindConfiguration {
	variablekind: string,
	workingvarprefix: string,
	lspsemantictokentype: string
}

/** this is isomorphic to the configuration stored for the workspace ;
 * the interface IExtensionSettings, instead transforms the kindConfig array in a Map
 * (for better performance); the reason we use two interfaces is that we cannot store
 * the map direcly in the .config file
*/
interface IExtensionConfiguration {
	mmFileFullPath: string;
	maxNumberOfProblems: number;
	proofMode: ProofMode;
	diagnosticMessageForSyntaxError: DiagnosticMessageForSyntaxError;
	kindConfigurations: IKindConfiguration[]
}

/** this is the configuration that will be provided to all the other classes. It is
 * built on the fly from IExtensionConfiguration, transforming IKindConfiguration[]
 * to a map (for better perfomance); the reason we use two interfaces is that we cannot store
 * the map direcly in the .config file
 */
export interface IExtensionSettings {
	mmFileFullPath: string;
	maxNumberOfProblems: number;
	proofMode: ProofMode;
	diagnosticMessageForSyntaxError: DiagnosticMessageForSyntaxError;
	variableKindsConfiguration: Map<string, IVariableKindConfiguration>
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
export const defaultSettings: IExtensionSettings = {
	maxNumberOfProblems: 1000,
	proofMode: ProofMode.normal,
	mmFileFullPath: "",
	diagnosticMessageForSyntaxError: DiagnosticMessageForSyntaxError.short,
	variableKindsConfiguration: new Map<string, IVariableKindConfiguration>()
};

// this is mainly used for testing without mocking
export interface IConfigurationManager {
	variableKindsConfiguration(uri: string): Map<string, IVariableKindConfiguration> | PromiseLike<Map<string, IVariableKindConfiguration>>;
}

export class ConfigurationManager implements IConfigurationManager {
	hasConfigurationCapability: boolean;
	hasDiagnosticRelatedInformationCapability: boolean;
	defaultSettings: IExtensionSettings;
	globalSettings: IExtensionSettings;
	private _connection: Connection;

	// private _documentSettings: Map<string, Thenable<ExtensionSettings>>;
	private _documentSettings: Map<string, Thenable<IExtensionSettings>>;

	constructor(hasConfigurationCapability: boolean, hasDiagnosticRelatedInformationCapability: boolean,
		defaultSettings: IExtensionSettings, globalSettings: IExtensionSettings, connection: Connection,
		private globalState: GlobalState) {
		this.hasConfigurationCapability = hasConfigurationCapability;
		this.hasDiagnosticRelatedInformationCapability = hasDiagnosticRelatedInformationCapability;
		this.defaultSettings = defaultSettings;
		this.globalSettings = globalSettings;
		this._connection = connection;

		this._documentSettings = new Map<string, Thenable<IExtensionSettings>>();
	}

	// onDidChangeConfiguration(change: DidChangeConfigurationParams) {
	// 	if (this.hasConfigurationCapability) {
	// 		// Reset all cached document settings
	// 		this._documentSettings.clear();
	// 	} else {
	// 		this.globalSettings = <ExampleSettings>(
	// 			(change.settings.languageServerExample || this.defaultSettings)
	// 		);
	// 	}
	// }

	//#region didChangeConfiguration
	async updateTheoryIfTheCase(_change?: DidChangeConfigurationParams) {
		// const settings: any = await this._connection.workspace.getConfiguration('yamma');
		const currentConfiguration: IExtensionConfiguration = await this.currentConfiguration();
		// const settings: IExtensionSettings = await this._connection.workspace.getConfiguration();
		// const settings: IExtensionSettings = _change.settings;
		const previousMmFilePath = this.globalState.mmFilePath;
		if (currentConfiguration.mmFileFullPath != previousMmFilePath) {
			this.setGlobalStateSettings();
			const theoryLoader: TheoryLoader = new TheoryLoader(currentConfiguration.mmFileFullPath, this._connection,
				this.globalState);
			await theoryLoader.loadNewTheoryIfNeededAndThenTheStepSuggestionModel();
		}
	}
	async didChangeConfiguration(change: DidChangeConfigurationParams) {
		if (this.hasConfigurationCapability) {
			// Reset all cached document settings
			this._documentSettings.clear();
			await this.updateTheoryIfTheCase(change);
		} else {
			this.globalSettings = <IExtensionSettings>(
				(change.settings.yamma || this.defaultSettings)
			);
		}
	}
	//#endregion didChangeConfiguration


	//#region getScopeUriSettings
	buildMap(kindConfigurations: IKindConfiguration[]): Map<string, IVariableKindConfiguration> {
		const map: Map<string, IVariableKindConfiguration> = new Map<string, IVariableKindConfiguration>();
		kindConfigurations.forEach((kindConfiguration: IKindConfiguration) => {
			const variableKindConfiguration: IVariableKindConfiguration = {
				workingVarPrefix: kindConfiguration.workingvarprefix,
				lspSemantictokenType: kindConfiguration.lspsemantictokentype
			};
			map.set(kindConfiguration.variablekind, variableKindConfiguration);
		});
		return map;
	}

	private async currentConfiguration(): Promise<IExtensionConfiguration> {
		const currentConfiguration: IExtensionConfiguration = await this._connection.workspace.getConfiguration('yamma');
		return currentConfiguration;
	}

	private extensionSettings(currentConfiguration: IExtensionConfiguration): IExtensionSettings {
		const extensionSettings: IExtensionSettings = {
			maxNumberOfProblems: currentConfiguration.maxNumberOfProblems,
			mmFileFullPath: currentConfiguration.mmFileFullPath,
			proofMode: currentConfiguration.proofMode,
			diagnosticMessageForSyntaxError: currentConfiguration.diagnosticMessageForSyntaxError,
			variableKindsConfiguration: this.buildMap(currentConfiguration.kindConfigurations)
		};
		return extensionSettings;
	}

	private async setGlobalStateSettings() {
		if (this.hasConfigurationCapability) {
			// const currentConfiguration: IExtensionConfiguration = await this._connection.workspace.getConfiguration('yamma');
			const currentConfiguration: IExtensionConfiguration = await this.currentConfiguration();
			const extensionSettings: IExtensionSettings = this.extensionSettings(currentConfiguration);
			this.globalState.lastFetchedSettings = extensionSettings;
		}
	}

	private async getScopeUriSettings(scopeUri: string): Promise<IExtensionSettings> {
		if (!this.hasConfigurationCapability) {
			return Promise.resolve(this.globalSettings);
		}
		let result: Thenable<IExtensionSettings> | undefined = this._documentSettings.get(scopeUri);
		if (!result) {
			const currentConfiguration: IExtensionConfiguration = await this._connection.workspace.getConfiguration({
				scopeUri: scopeUri,
				section: 'yamma'
			});
			const extensionSettings: IExtensionSettings = this.extensionSettings(currentConfiguration);
			result = new Promise<IExtensionSettings>((resolve) => { resolve(extensionSettings); });
			this._documentSettings.set(scopeUri, <Thenable<IExtensionSettings>>result);
			this.globalState.lastFetchedSettings = extensionSettings;
		}
		return <Thenable<IExtensionSettings>>result;
	}
	//#endregion getScopeUriSettings

	/** deletes from the cache the settings for the given document */
	delete(uri: string) {
		this._documentSettings.delete(uri);
	}

	async maxNumberOfProblems(textDocumentUri: string): Promise<number> {
		const settings = await this.getScopeUriSettings(textDocumentUri);
		return settings.maxNumberOfProblems;
	}

	async proofMode(textDocumentUri: string): Promise<ProofMode> {
		const settings = await this.getScopeUriSettings(textDocumentUri);
		return settings.proofMode;
	}

	/** the full path for the .mm file containing the theory for the new proof */
	async mmFileFullPath(textDocumentUri: string): Promise<string> {
		const settings = await this.getScopeUriSettings(textDocumentUri);
		return settings.mmFileFullPath;
	}

	async variableKindsConfiguration(textDocumentUri: string): Promise<Map<string, IVariableKindConfiguration>> {
		const settings: IExtensionSettings = await this.getScopeUriSettings(textDocumentUri);
		return settings.variableKindsConfiguration;
	}

	async diagnosticMessageForSyntaxError(textDocumentUri: string): Promise<DiagnosticMessageForSyntaxError> {
		const settings: IExtensionSettings = await this.getScopeUriSettings(textDocumentUri);
		return settings.diagnosticMessageForSyntaxError;
	}
}