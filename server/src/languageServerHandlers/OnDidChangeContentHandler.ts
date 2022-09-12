import { Connection, Diagnostic, Range } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ExampleSettings } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpValidator } from '../mmp/MmpValidator';
import { consoleLogWithTimestamp } from '../mm/Utils';
import { MmpParserWarningCode } from '../mmp/MmpParser';


export class OnDidChangeContentHandler {
	connection: Connection;
	hasConfigurationCapability: boolean;
	hasDiagnosticRelatedInformationCapability: boolean;
	globalSettings: ExampleSettings;
	documentSettings: Map<string, Thenable<ExampleSettings>>;
	mmParser: MmParser;

	constructor(connection: Connection, hasConfigurationCapability: boolean,
		hasDiagnosticRelatedInformationCapability: boolean, globalSettings: ExampleSettings,
		documentSettings: Map<string, Thenable<ExampleSettings>>, mmParser: MmParser) {
		this.connection = connection;
		this.hasConfigurationCapability = hasConfigurationCapability;
		this.hasDiagnosticRelatedInformationCapability = hasDiagnosticRelatedInformationCapability;
		this.globalSettings = globalSettings;
		this.documentSettings = documentSettings;
		this.mmParser = mmParser;
	}

	// private mmParser: MmParser | undefined;

	private getDocumentSettings(resource: string): Thenable<ExampleSettings> {
		if (!this.hasConfigurationCapability) {
			return Promise.resolve(this.globalSettings);
		}
		let result = this.documentSettings.get(resource);
		if (!result) {
			result = this.connection.workspace.getConfiguration({
				scopeUri: resource,
				section: 'languageServerExample'
			});
			this.documentSettings.set(resource, result);
		}
		return result;
	}



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
	updateCursorPosition(diagnostics: Diagnostic[]) {
		// const range: Range = { start: { line: 2, character: 4 }, end: { line: 2, character: 9 } };
		const range: Range | undefined = this.computeRangeForCursor(diagnostics);
		if (range != undefined)
			this.connection.sendNotification('yamma/movecursor', range);
	}
	//#endregion updateCursorPosition

	async validateTextDocument(textDocument: TextDocument, unifyDoneButCursorPositionNotUpdatedYet: boolean): Promise<void> {


		// In this simple example we get the settings for every validate run.
		const settings = await this.getDocumentSettings(textDocument.uri);
		//TODO the following two lines are just to avoid warnings (because we are not using settings; see the TODO below)
		let maxNumOfProblems = settings.maxNumberOfProblems;
		maxNumOfProblems = maxNumOfProblems + 1 - 1;

		consoleLogWithTimestamp("Glauco_1: validateTextDocument started");

		//Glauco
		// parseMainMMfile(textDocument.uri)
		// this.parseMainMMfile(textDocument);

		consoleLogWithTimestamp(`Glauco_2: parse complete for document`);

		//TODO you are not using settings.maxNumberOfProblems
		// let problems = 0;

		const mmpValidator: MmpValidator = new MmpValidator(this.mmParser!);
		mmpValidator.validateFullDocument(textDocument);
		const diagnostics: Diagnostic[] = mmpValidator.diagnostics;

		// The validator creates diagnostics for all uppercase words length 2 and more

		// Send the computed diagnostics to VSCode.
		this.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });

		if (unifyDoneButCursorPositionNotUpdatedYet)
			this.updateCursorPosition(diagnostics);
	}
	//#endregion validateTextDocument
}