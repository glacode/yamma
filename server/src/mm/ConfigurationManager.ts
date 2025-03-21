import { Connection, DidChangeConfigurationParams } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { TheoryLoader } from './TheoryLoader';

export enum ProofMode {
	normal = "normal",
	packed = "packed",
	compressed = "compressed"
}

export enum DisjVarAutomaticGeneration {
	GenerateNone = "GenerateNone",
	GenerateDummy = "GenerateDummy",
	GenerateAll = "GenerateAll"
}

export enum LabelsOrderInCompressedProof {
	fifo = 'fifo',
	mostReferencedFirst = 'mostReferencedFirst',
	mostReferencedFirstAndNiceFormatting = 'mostReferencedFirstAndNiceFormatting',
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
	disjVarAutomaticGeneration: DisjVarAutomaticGeneration;
	maxNumberOfProblems: number;
	proofMode: ProofMode;
	labelsOrderInCompressedProof: LabelsOrderInCompressedProof;
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
	disjVarAutomaticGeneration: DisjVarAutomaticGeneration;
	maxNumberOfProblems: number;
	proofMode: ProofMode;
	labelsOrderInCompressedProof: LabelsOrderInCompressedProof;
	diagnosticMessageForSyntaxError: DiagnosticMessageForSyntaxError;
	variableKindsConfiguration: Map<string, IVariableKindConfiguration>
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
export const defaultSettings: IExtensionSettings = {
	maxNumberOfProblems: 1000,
	disjVarAutomaticGeneration: DisjVarAutomaticGeneration.GenerateNone,
	proofMode: ProofMode.normal,
	labelsOrderInCompressedProof: LabelsOrderInCompressedProof.mostReferencedFirstAndNiceFormatting,
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
	async updateTheoryIfTheCase() {
		// const settings: any = await this._connection.workspace.getConfiguration('yamma');
		const currentConfiguration: IExtensionConfiguration = await this.currentConfiguration();
		// const settings: IExtensionSettings = await this._connection.workspace.getConfiguration();
		// const settings: IExtensionSettings = _change.settings;
		const previousMmFilePath = this.globalState.mmFilePath;
		console.log(` previousMmFilePath: ${previousMmFilePath}`);
		console.log(` currentMmFilePath: ${currentConfiguration.mmFileFullPath}`);
		if (!previousMmFilePath || (currentConfiguration.mmFileFullPath != '' &&
			currentConfiguration.mmFileFullPath != previousMmFilePath)) {
			this.setGlobalStateSettings(currentConfiguration);
			const theoryLoader: TheoryLoader = new TheoryLoader(currentConfiguration.mmFileFullPath, this._connection,
				this.globalState);
			await theoryLoader.loadNewTheoryIfNeededAndThenTheStepSuggestionModel();
		}
	}
	async didChangeConfiguration(change: DidChangeConfigurationParams) {
		if (this.hasConfigurationCapability) {
			// Reset all cached document settings
			this._documentSettings.clear();
			this.updateGlobalSettings();
			console.log('didChangeConfiguration - going to updateTheoryIfTheCase');
			await this.updateTheoryIfTheCase();
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
			disjVarAutomaticGeneration: currentConfiguration.disjVarAutomaticGeneration,
			mmFileFullPath: currentConfiguration.mmFileFullPath,
			proofMode: currentConfiguration.proofMode,
			labelsOrderInCompressedProof: currentConfiguration.labelsOrderInCompressedProof,
			diagnosticMessageForSyntaxError: currentConfiguration.diagnosticMessageForSyntaxError,
			variableKindsConfiguration: this.buildMap(currentConfiguration.kindConfigurations)
		};
		return extensionSettings;
	}

	private async setGlobalStateSettings(currentConfiguration: IExtensionConfiguration) {
		if (this.hasConfigurationCapability) {
			// const currentConfiguration: IExtensionConfiguration = await this._connection.workspace.getConfiguration('yamma');
			// const currentConfiguration: IExtensionConfiguration = await this.currentConfiguration();
			const extensionSettings: IExtensionSettings = this.extensionSettings(currentConfiguration);
			this.globalSettings = extensionSettings;
			this.globalState.lastFetchedSettings = extensionSettings;
		}
	}

	private async updateGlobalSettings() {
		const currentConfiguration: IExtensionConfiguration = await this.currentConfiguration();
		this.setGlobalStateSettings(currentConfiguration);
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
		const settings: IExtensionSettings = await this.getScopeUriSettings(textDocumentUri);
		return settings.proofMode;
	}

	async labelsOrderInCompressedProof(textDocumentUri: string): Promise<LabelsOrderInCompressedProof> {
		const settings: IExtensionSettings = await this.getScopeUriSettings(textDocumentUri);
		return settings.labelsOrderInCompressedProof;
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