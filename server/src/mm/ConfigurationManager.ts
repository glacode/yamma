import { Connection, DidChangeConfigurationParams } from 'vscode-languageserver';

export enum ProofMode {
	normal = "normal",
	compressed = "compressed"
}
//TODO is defined also in server.ts, keep only one
export interface ExampleSettings {
	mmFileFullPath: string;
	maxNumberOfProblems: number;
	proofMode: ProofMode
}

export class ConfigurationManager {
	hasConfigurationCapability: boolean;
	hasDiagnosticRelatedInformationCapability: boolean;
	defaultSettings: ExampleSettings;
	globalSettings: ExampleSettings;
	private _connection: Connection;

	private _documentSettings: Map<string, Thenable<ExampleSettings>>;

	constructor(hasConfigurationCapability: boolean, hasDiagnosticRelatedInformationCapability: boolean,
		defaultSettings: ExampleSettings, globalSettings: ExampleSettings, connection: Connection) {
		this.hasConfigurationCapability = hasConfigurationCapability;
		this.hasDiagnosticRelatedInformationCapability = hasDiagnosticRelatedInformationCapability;
		this.defaultSettings = defaultSettings;
		this.globalSettings = globalSettings;
		this._connection = connection;

		this._documentSettings = new Map<string, Thenable<ExampleSettings>>();
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
			this.globalSettings = <ExampleSettings>(
				(change.settings.languageServerExample || this.defaultSettings)
			);
		}
	}

	private getScopeUriSettings(scopeUri: string): Thenable<ExampleSettings> {
		if (!this.hasConfigurationCapability) {
			return Promise.resolve(this.globalSettings);
		}
		let result = this._documentSettings.get(scopeUri);
		if (!result) {
			result = this._connection.workspace.getConfiguration({
				scopeUri: scopeUri,
				section: 'yamma'
			});
			this._documentSettings.set(scopeUri, result);
		}
		return result;
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
}