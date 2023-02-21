import { Connection, Diagnostic, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ConfigurationManager } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpValidator } from '../mmp/MmpValidator';
import { MmpParser, MmpParserWarningCode } from '../mmp/MmpParser';
import { GlobalState } from '../general/GlobalState';
import { TextForProofStatement } from '../mmp/MmpStatement';



export class OnDidChangeContentHandler {
	connection: Connection;
	hasConfigurationCapability: boolean;
	hasDiagnosticRelatedInformationCapability: boolean;
	// documentSettings: Map<string, Thenable<IExtensionSettings>>;
	configurationManager: ConfigurationManager;
	mmParser: MmParser;
	suggestedRangeForCursorPosition?: Range

	constructor(connection: Connection, hasConfigurationCapability: boolean,
		hasDiagnosticRelatedInformationCapability: boolean, private globalState: GlobalState) {
		this.connection = connection;
		this.hasConfigurationCapability = hasConfigurationCapability;
		this.hasDiagnosticRelatedInformationCapability = hasDiagnosticRelatedInformationCapability;
		// this.documentSettings = documentSettings;
		this.configurationManager = globalState.configurationManager!;
		this.mmParser = globalState.mmParser!;
		this.suggestedRangeForCursorPosition = globalState.suggestedRangeForCursorPosition;
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

	//#region computeRangeForCursor
	private static cursorRangeForTextProofStatement(textProofStatement: TextForProofStatement): Range {
		const range = textProofStatement.statementTokens[0].range;
		return range;
	}

	//#region computeRangeFromDiagnostics
	private static getFirstDiagnostic(diagnostics: Diagnostic[]): Diagnostic | undefined {
		let firstDiagnostic: Diagnostic | undefined;
		diagnostics.forEach((diagnostic: Diagnostic) => {
			// if (diagnostic.code == MmpParserWarningCode.missingLabel &&
			if ((firstDiagnostic == undefined || diagnostic.range.start.line < firstDiagnostic.range.start.line
				|| (diagnostic.range.start.line == firstDiagnostic.range.start.line &&
					diagnostic.range.start.character < firstDiagnostic.range.start.character)))
				firstDiagnostic = diagnostic;
		});
		return firstDiagnostic;
	}

	private static computeRangeFromDiagnostics(diagnostics: Diagnostic[]): Range | undefined {
		let range: Range | undefined;
		const firstDiagnostic: Diagnostic | undefined = OnDidChangeContentHandler.getFirstDiagnostic(diagnostics);
		if (firstDiagnostic != undefined)
			range = firstDiagnostic.code == MmpParserWarningCode.missingLabel ?
				range = Range.create(firstDiagnostic.range.start, firstDiagnostic.range.start) :
				range = firstDiagnostic.range;
		return range;
	}
	//#endregion computeRangeFromDiagnostics


	/** if the proof text is found, the cursor is moved to that line, otherwise it
	 * returns the Range of the first missing label */
	protected static computeRangeForCursor(diagnostics: Diagnostic[], mmpParser?: MmpParser): Range | undefined {
		let range: Range | undefined;
		if (mmpParser != undefined && mmpParser.uProof?.textProofStatement != undefined)
			range = OnDidChangeContentHandler.cursorRangeForTextProofStatement(mmpParser.uProof.textProofStatement);
		else
			range = OnDidChangeContentHandler.computeRangeFromDiagnostics(diagnostics);
		return range;
	}
	//#endregion computeRangeForCursor

	/** sends a request to the client, to update the cursor position;
	 * this method should be used by all the classes that want to request to
	 * the client a cursor move
	 */
	private requestMoveCursor(range: Range) {
		this.connection.sendNotification('yamma/movecursor', range);
		this.globalState.setSuggestedRangeForCursorPosition(undefined);
	}
	private updateCursorPosition(unifyDoneButCursorPositionNotUpdatedYet: boolean, diagnostics: Diagnostic[],
		mmpParser?: MmpParser) {
		// const range: Range = { start: { line: 2, character: 4 }, end: { line: 2, character: 9 } };
		let range: Range | undefined;
		if (this.suggestedRangeForCursorPosition != undefined)
			range = this.suggestedRangeForCursorPosition;
		else if (unifyDoneButCursorPositionNotUpdatedYet)
			range = OnDidChangeContentHandler.computeRangeForCursor(diagnostics, mmpParser);
		if (range != undefined)
			this.requestMoveCursor(range);
	}
	//#endregion updateCursorPosition

	//#region requestTriggerSuggest
	private requestTriggerSuggest() {
		this.connection.sendNotification('yamma/triggerSuggest');
		this.globalState.resetTriggerSuggest();
	}
	private triggerSuggestIfRequired() {
		if (this.globalState.isTriggerSuggestRequired)
			this.requestTriggerSuggest();
	}
	//#endregion requestTriggerSuggest

	async validateTextDocument(textDocument: TextDocument, unifyDoneButCursorPositionNotUpdatedYet: boolean): Promise<void> {


		// In this simple example we get the settings for every validate run.
		// const settings = await this.getDocumentSettings(textDocument.uri);
		// const settings = await this.getDocumentSettings(textDocument.uri);
		//TODO the following two lines are just to avoid warnings (because we are not using settings; see the TODO below)
		// let maxNumOfProblems = settings.maxNumberOfProblems;
		let maxNumOfProblems: number = await this.configurationManager.maxNumberOfProblems(textDocument.uri);
		maxNumOfProblems = maxNumOfProblems + 1 - 1;

		//Glauco
		const mmpValidator: MmpValidator = new MmpValidator(this.mmParser!, this.globalState);
		mmpValidator.validateFullDocument(textDocument);
		const diagnostics: Diagnostic[] = mmpValidator.diagnostics;

		this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });

		this.updateCursorPosition(unifyDoneButCursorPositionNotUpdatedYet, diagnostics, mmpValidator.mmpParser);
		this.triggerSuggestIfRequired();
	}
	//#endregion validateTextDocument

	static async validateTextDocument(textDocument: TextDocument, connection: Connection,
		hasConfigurationCapability: boolean, hasDiagnosticRelatedInformationCapability: boolean,
		globalState: GlobalState) {
		if (globalState.mmParser != undefined) {
			const onDidChangeContent: OnDidChangeContentHandler = new OnDidChangeContentHandler(connection,
				hasConfigurationCapability, hasDiagnosticRelatedInformationCapability, globalState);
			await onDidChangeContent.validateTextDocument(textDocument, globalState.isCursorPositionUpdateRequired);
			// globalState.isCursorPositionUpdateRequired = false;
		}
	}
}