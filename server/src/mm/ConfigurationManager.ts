import { Connection, DidChangeConfigurationParams } from 'vscode-languageserver';

export enum ProofMode {
	normal = "normal",
	compressed = "compressed"
}

export interface VariableKindConfiguration {
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
	variableKindsConfiguration: Map<string, VariableKindConfiguration>
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
export const defaultSettings: IExtensionSettings = {
	maxNumberOfProblems: 1000,
	proofMode: ProofMode.normal,
	mmFileFullPath: "",
	variableKindsConfiguration: new Map<string, VariableKindConfiguration>()
};

export class ConfigurationManager {
	hasConfigurationCapability: boolean;
	hasDiagnosticRelatedInformationCapability: boolean;
	defaultSettings: IExtensionSettings;
	globalSettings: IExtensionSettings;
	private _connection: Connection;

	// private _documentSettings: Map<string, Thenable<ExtensionSettings>>;
	private _documentSettings: Map<string, Thenable<IExtensionSettings>>;

	constructor(hasConfigurationCapability: boolean, hasDiagnosticRelatedInformationCapability: boolean,
		defaultSettings: IExtensionSettings, globalSettings: IExtensionSettings, connection: Connection) {
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

	didChangeConfiguration(change: DidChangeConfigurationParams) {
		if (this.hasConfigurationCapability) {
			// Reset all cached document settings
			this._documentSettings.clear();
		} else {
			this.globalSettings = <IExtensionSettings>(
				(change.settings.yamma || this.defaultSettings)
			);
		}
	}

	//#region getScopeUriSettings
	buildMap(kindConfigurations: IKindConfiguration[]): Map<string, VariableKindConfiguration> {
		const map: Map<string, VariableKindConfiguration>  = new Map<string, VariableKindConfiguration>();
		kindConfigurations.forEach((kindConfiguration: IKindConfiguration) => {
			const variableKindConfiguration: VariableKindConfiguration = {
				workingVarPrefix: kindConfiguration.workingvarprefix,
				lspSemantictokenType: kindConfiguration.lspsemantictokentype
			};
			map.set(kindConfiguration.variablekind,variableKindConfiguration);
		});
		return map;
	}
	private async getScopeUriSettings(scopeUri: string): Promise<IExtensionSettings> {
		if (!this.hasConfigurationCapability) {
			return Promise.resolve(this.globalSettings);
		}
		let result: Thenable<IExtensionSettings> | undefined = this._documentSettings.get(scopeUri);
		if (!result) {
			const currentConfiguration : IExtensionConfiguration = await this._connection.workspace.getConfiguration({
				scopeUri: scopeUri,
				section: 'yamma'
			});
			// QUI!!! setta la variableKindsConfiguration che è una map
			const extensionSettings: IExtensionSettings = {
				maxNumberOfProblems: currentConfiguration.maxNumberOfProblems,
				mmFileFullPath: currentConfiguration.mmFileFullPath,
				proofMode: currentConfiguration.proofMode,
				variableKindsConfiguration: this.buildMap(currentConfiguration.kindConfigurations)
			};
			result = new Promise<IExtensionSettings>((resolve)=>{resolve(extensionSettings);});
			this._documentSettings.set(scopeUri, <Thenable<IExtensionSettings>>result);
		}
		return <Thenable<IExtensionSettings>>result;
	}
	//#endregion getScopeUriSettings

	async proofMode(textDocumentUri: string): Promise<ProofMode> {
		const settings = await this.getScopeUriSettings(textDocumentUri);
		return settings.proofMode;
	}

	/** the full path for the .mm file containing the theory for the new proof */
	async mmFileFullPath(textDocumentUri: string): Promise<string> {
		const settings = await this.getScopeUriSettings(textDocumentUri);
		return settings.mmFileFullPath;
	}

	async variableKindsConfiguration(textDocumentUri: string): Promise<Map<string, VariableKindConfiguration>> {
		const settings: IExtensionSettings = await this.getScopeUriSettings(textDocumentUri);
		return settings.variableKindsConfiguration;
	}
}