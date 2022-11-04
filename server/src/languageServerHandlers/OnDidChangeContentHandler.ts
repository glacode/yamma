import { Connection, Diagnostic, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ConfigurationManager, IExtensionSettings } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpValidator } from '../mmp/MmpValidator';
import { MmpParserWarningCode } from '../mmp/MmpParser';
import { GlobalState } from '../general/GlobalState';


export class OnDidChangeContentHandler {
	connection: Connection;
	hasConfigurationCapability: boolean;
	hasDiagnosticRelatedInformationCapability: boolean;
	globalSettings: IExtensionSettings;
	// documentSettings: Map<string, Thenable<IExtensionSettings>>;
	configurationManager: ConfigurationManager;
	mmParser: MmParser;

	constructor(connection: Connection, hasConfigurationCapability: boolean,
		hasDiagnosticRelatedInformationCapability: boolean, globalSettings: IExtensionSettings,
		// documentSettings: Map<string, Thenable<IExtensionSettings>>, mmParser: MmParser) {
		configurationManager: ConfigurationManager, mmParser: MmParser) {
		this.connection = connection;
		this.hasConfigurationCapability = hasConfigurationCapability;
		this.hasDiagnosticRelatedInformationCapability = hasDiagnosticRelatedInformationCapability;
		this.globalSettings = globalSettings;
		// this.documentSettings = documentSettings;
		this.configurationManager = configurationManager;
		this.mmParser = mmParser;
	}

	// private mmParser: MmParser | undefined;

	// private getDocumentSettings(resource: string): Thenable<IExtensionSettings> {
	// 	if (!this.hasConfigurationCapability) {
	// 		return Promise.resolve(this.globalSettings);
	// 	}
	// 	let result = this.documentSettings.get(resource);
	// 	if (!result) {
	// 		result = this.connection.workspace.getConfiguration({
	// 			scopeUri: resource,
	// 			section: 'yamma'
	// 		});
	// 		this.documentSettings.set(resource, result);
	// 	}
	// 	return result;
	// }



	//#region validateTextDocument

	//#region updateCursorPosition

	/** returns the Range of the first missing label */
	private computeRangeForCursor(diagnostics: Diagnostic[]): Range | undefined {
		let range: Range | undefined;
		diagnostics.forEach((diagnostic: Diagnostic) => {
			if (diagnostic.code == MmpParserWarningCode.missingLabel &&
				(range == undefined || diagnostic.range.start.line < range.start.line))
				range = diagnostic.range;
		});
		return range;
	}
	updateCursorPosition(unifyDoneButCursorPositionNotUpdatedYet: boolean, diagnostics: Diagnostic[]) {
		// const range: Range = { start: { line: 2, character: 4 }, end: { line: 2, character: 9 } };
		let range: Range | undefined;
		if (GlobalState.suggestedRangeForCursorPosition != undefined) {
			range = GlobalState.suggestedRangeForCursorPosition;
			GlobalState.setSuggestedRangeForCursorPosition(undefined);
		} else if (unifyDoneButCursorPositionNotUpdatedYet)
			range = this.computeRangeForCursor(diagnostics);
		if (range != undefined)
			this.connection.sendNotification('yamma/movecursor', range);
	}
	//#endregion updateCursorPosition

	async validateTextDocument(textDocument: TextDocument, unifyDoneButCursorPositionNotUpdatedYet: boolean): Promise<void> {


		// In this simple example we get the settings for every validate run.
		// const settings = await this.getDocumentSettings(textDocument.uri);
		// const settings = await this.getDocumentSettings(textDocument.uri);
		//TODO the following two lines are just to avoid warnings (because we are not using settings; see the TODO below)
		// let maxNumOfProblems = settings.maxNumberOfProblems;
		let maxNumOfProblems: number = await this.configurationManager.maxNumberOfProblems(textDocument.uri);
		maxNumOfProblems = maxNumOfProblems + 1 - 1;

		//Glauco
		const mmpValidator: MmpValidator = new MmpValidator(this.mmParser!);
		mmpValidator.validateFullDocument(textDocument);
		const diagnostics: Diagnostic[] = mmpValidator.diagnostics;

		// The validator creates diagnostics for all uppercase words length 2 and more

		// Send the computed diagnostics to VSCode.
		this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });

		// if (GlobalState.setSuggestedRangeForCursorPosition != undefined || unifyDoneButCursorPositionNotUpdatedYet)
		this.updateCursorPosition(unifyDoneButCursorPositionNotUpdatedYet, diagnostics);
	}
	//#endregion validateTextDocument

	static async validateTextDocument(textDocument: TextDocument, connection: Connection,
		hasConfigurationCapability: boolean, hasDiagnosticRelatedInformationCapability: boolean,
		globalSettings: IExtensionSettings, unifyDoneButCursorPositionNotUpdatedYet: boolean) {
		if (GlobalState.mmParser != undefined) {
			const onDidChangeContent: OnDidChangeContentHandler = new OnDidChangeContentHandler(connection,
				hasConfigurationCapability, hasDiagnosticRelatedInformationCapability,
				// globalSettings, documentSettings, GlobalState.mmParser);
				globalSettings, GlobalState.configurationManager, GlobalState.mmParser);
			await onDidChangeContent.validateTextDocument(textDocument, unifyDoneButCursorPositionNotUpdatedYet);
			unifyDoneButCursorPositionNotUpdatedYet = false;
		}
	}
}