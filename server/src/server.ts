/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	// CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentFormattingParams,
	Hover,
	MarkupContent,
	MarkupKind,
	CodeAction,
	CodeActionParams,
	WorkDoneProgressCreateRequest,
	WorkDoneProgress,
	SemanticTokensParams,
	SemanticTokens,
	SemanticTokenModifiers,
} from 'vscode-languageserver/node';

import {
	TextDocument, TextEdit
} from 'vscode-languageserver-textdocument';




import { MmParser } from "./mm/MmParser";
import { OnHoverHandler } from "./languageServerHandlers/OnHoverHandler";
import { OnDocumentFormattingHandler } from './languageServerHandlers/OnDocumentFormattingHandler';
import { OnDidChangeContentHandler } from './languageServerHandlers/OnDidChangeContentHandler';
import { OnCodeActionHandler } from './languageServerHandlers/OnCodeActionHandler';
import { ConfigurationManager, defaultSettings, IExtensionSettings } from './mm/ConfigurationManager';
import { MmtSaver, PathAndUri } from './mmt/MmtSaver';

import * as path from 'path';
import * as fs from "fs";
import { MmtLoader } from './mmt/MmtLoader';
import { OnCompletionHandler } from './languageServerHandlers/OnCompletionHandler';
import { GlobalState } from './general/GlobalState';
import { OnCompletionResolveHandler } from './languageServerHandlers/OnCompletionResolveHandler';
import { OnSemanticTokensHandler, semanticTokenTypes } from './languageServerHandlers/OnSemanticTokensHandler';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

//glaucoconnection

//#region onInitialize

//Glauco
let mmParser: MmParser;
/** true iff a unify() has been performed, but the cursor has not been updated yet*/
let unifyDoneButCursorPositionNotUpdatedYet = false;

function notifyProgress(percentageOfWorkDone: number): void {
	// connection.sendProgress(WorkDoneProgress.type, 'TEST-PROGRESS-TOKEN',
	// 	{ kind: 'report', percentage: percentageOfWorkDone, message: 'Halfway!' });
	console.log(percentageOfWorkDone + '%');
	const strMessage: string = percentageOfWorkDone + '%';
	connection.sendProgress(WorkDoneProgress.type, 'TEST-PROGRESS-TOKEN',
		{ kind: 'report', message: strMessage });
	// connection.sendProgress()
}
async function parseMainMMfile(textDocumentUri: string) {
	if (mmParser == undefined) {
		// the main .mm file has not been parsed, yet
		// const textDocumentPath = fileURLToPath(textDocumentUri)
		// const workingDirPath : string = path.dirname(textDocumentPath)
		// const mmFilePath: string = path.join(workingDirPath,"setShorter.mm")
		//TODO use paramater
		// const mmFilePath = __dirname.concat("/mmparser/mmp2.mm");
		// const mmFilePath = __dirname.concat("/mmparser/dmsnop.mm");
		// const mmFilePath = __dirname.concat("/mmparser/set.mm");

		// const forLog: string = JSON.stringify(params);
		// console.log(forLog);

		// const workSpaceFolderUri: string = params.workspaceFolders![0].uri;
		// console.log(workSpaceFolderUri);

		let mmFilePath = await configurationManager.mmFileFullPath(textDocumentUri);
		console.log("mmFilePath: " + mmFilePath);
		const textDocumentDir: string = path.dirname(textDocumentUri);
		if (mmFilePath == '') {
			// the main theory mm file has not been defined
			const defaultTheory = "set.mm";
			// mmFilePath = __dirname.concat("/mmparser/dmsnop.mm");
			mmFilePath = path.join(textDocumentDir, defaultTheory);
		}

		const fileExist: boolean = fs.existsSync(mmFilePath);
		if (!fileExist) {
			const message = `The theory file ${mmFilePath} does not exist. Thus the extension Yamma ` +
				`cannot work properly. To fix this, either input another .mm file in the Workspace configuration ` +
				`or copy a set.mm file in ${textDocumentDir}`;
			//QUI!!! below it must become a notifyError
			notifyError(message);
			// connection.sendNotification('yamma/showinformation', message);
		} else {
			mmParser = new MmParser();
			mmParser.progressListener = notifyProgress;
			const progressToken = 'TEST-PROGRESS-TOKEN';
			await connection.sendRequest(WorkDoneProgressCreateRequest.type, { token: progressToken });
			void connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'begin', title: 'Loading the theory...' });
			// void connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'report', percentage: 50, message: 'Halfway!' });
			// void connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'end', message: 'Completed!' });
			mmParser.ParseFileSync(mmFilePath);
			//QUI!!! use error and information below
			let message: string;
			if (mmParser.parseFailed) {
				message = `The theory file ${mmFilePath} has NOT been successfully parsed`;
				notifyError(message);
			}
			else {
				message = `The theory file ${mmFilePath} has been successfully parsed`;
				notifyInformation(message);
			}
			void connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'end', message: message });
			// notifyInformation(message);
			// connection.sendNotification('yamma/showinformation', message);
		}

		// mmParser.outermostBlock.grammar = mmParser.grammar;
		// mmParser.ParseFile(mmFilePath);
	}
	// connection.console.log("Initialization : " + params.workspaceFolders);
	// log_paramsWorkspaceFolders = params.workspaceFolders
	// log_doYouGetHere = textDocumentUri
	// parser.ParseFile(".")	
}
// parseMainMMfile();

connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	// hasFormattingCapability = !!capabilities.textDocument?.formatting;

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true,
				triggerCharacters: ['.', ' ']
			},

			//Glauco
			documentFormattingProvider: true,
			codeActionProvider: true,
			// below it implements SemanticTokensOptions
			semanticTokensProvider: {
				full: {
					delta: false
				},
				legend: {
					tokenTypes: semanticTokenTypes,
					tokenModifiers: [
						SemanticTokenModifiers.declaration,
						SemanticTokenModifiers.definition,
						SemanticTokenModifiers.deprecated
					]
				}
			},
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}

	//Glauco
	result.capabilities.hoverProvider = true;

	//Glauco
	// parse(params)
	configurationManager = new ConfigurationManager(hasConfigurationCapability,
		hasDiagnosticRelatedInformationCapability, defaultSettings, globalSettings, connection);
	GlobalState.configurationManager = configurationManager;
	// connection.onDidChangeConfiguration(configurationManager.onDidChangeConfiguration);

	// parseMainMMfile(params);



	return result;
});
//#endregion onInitialize

//Glauco
// const mmtSaver: MmtSaver = new MmtSaver(connection,documents);
// connection.onRequest('yamma/storemmt', (fsPath: string) => {
// 	const text: string = <string>documents.get(fsPath)?.getText();
// 	const mmtSaver: MmtSaver = new MmtSaver(fsPath, text, mmParser);
// 	// const mmtSaver: MmtSaver = new MmtSaver(fsPath, mmParser);
// 	mmtSaver.saveMmt();
// 	console.log('Method saveMmt() has been invoked 2');

// });
connection.onRequest('yamma/storemmt', (pathAndUri: PathAndUri) => {
	const text: string = <string>documents.get(pathAndUri.uri)?.getText();
	const mmtSaver: MmtSaver = new MmtSaver(pathAndUri.fsPath, text, mmParser);
	// const mmtSaver: MmtSaver = new MmtSaver(fsPath, mmParser);
	mmtSaver.saveMmt();
	console.log('Method saveMmt() has been invoked 2');

});

connection.onRequest('yamma/loadmmt', (fsPath: string) => {
	const mmtLoader: MmtLoader = new MmtLoader(fsPath, mmParser);
	mmtLoader.loadMmt();
	if (mmtLoader.loadFailed && mmtLoader.diagnostics.length > 0) {
		const errorMessage: string = mmtLoader.diagnostics[0].message;
		notifyError(errorMessage);
	}
	console.log('Method loadmmt() has been invoked');

});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
// interface ExampleSettings {
// 	maxNumberOfProblems: number;
// }

let globalSettings: IExtensionSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<IExtensionSettings>> = new Map();

let configurationManager: ConfigurationManager;

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
		configurationManager.didChangeConfiguration(change);
	} else {
		globalSettings = <IExtensionSettings>(
			(change.settings.yamma || defaultSettings)
		);
	}

	// Revalidate all open text documents
	// documents.all().forEach(validateTextDocument);
	documents.all().forEach(newValidateTextDocument);
});


// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

//#region onDidChangeContent
function newValidateTextDocument(textDocument: TextDocument) {
	const onDidChangeContent: OnDidChangeContentHandler = new OnDidChangeContentHandler(connection,
		hasConfigurationCapability, hasDiagnosticRelatedInformationCapability,
		globalSettings, documentSettings, mmParser);
	onDidChangeContent.validateTextDocument(textDocument, unifyDoneButCursorPositionNotUpdatedYet);
	unifyDoneButCursorPositionNotUpdatedYet = false;
}

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(async change => {
	// validateTextDocument(change.document);
	await parseMainMMfile(change.document.uri);
	GlobalState.mmParser = mmParser;
	newValidateTextDocument(change.document);
});
//#endregion onDidChangeContent

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	async (_textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
		const onCompletionHandler: OnCompletionHandler =
			new OnCompletionHandler(_textDocumentPosition, configurationManager);
		const result: CompletionItem[] = await onCompletionHandler.completionItems();

		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		// return [
		// 	{
		// 		label: 'TypeScript',
		// 		kind: CompletionItemKind.Text,
		// 		data: 1
		// 	},
		// 	{
		// 		label: 'JavaScript',
		// 		kind: CompletionItemKind.Text,
		// 		data: 2
		// 	}
		// ];
		return result;
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		const onCompletionResolveHandler: OnCompletionResolveHandler =
			new OnCompletionResolveHandler();
		onCompletionResolveHandler.addDocumentationIfPossible(item);
		return item;
	}
);

connection.onDocumentFormatting(
	(params: DocumentFormattingParams): Promise<TextEdit[]> => {
		//return OnDocumentFormattingHandler.formatToLowerCase(params,documents)
		const onDocumentFormattingHandler: OnDocumentFormattingHandler =
			new OnDocumentFormattingHandler(params, documents, mmParser, configurationManager);
		const result: Promise<TextEdit[]> = onDocumentFormattingHandler.unify();
		unifyDoneButCursorPositionNotUpdatedYet = true;
		// return onDocumentFormattingHandler.unify();
		return result;
	}
);

//Glauco

//#region onCodeAction
function onCodeActionHandler(params: CodeActionParams): CodeAction[] {
	const onCodeActionHandler: OnCodeActionHandler = new OnCodeActionHandler(documents);
	return onCodeActionHandler.onCodeActionHandler(params);
}
// connection.onCodeAction(OnCodeActionHandler.onCodeActionHandler);
connection.onCodeAction(onCodeActionHandler);
//#endregion onCodeAction

//#region onHover
//Glauco
connection.onHover(async (params): Promise<Hover | undefined> => {
	let hoverResult: Hover | undefined;

	const contentValue: string | undefined = OnHoverHandler.getHoverMessage(params, documents, mmParser);
	let content: MarkupContent | undefined;
	if (contentValue != undefined) {
		// const content : MarkupContent = { kind: MarkupKind.Markdown ,value: contentValue};
		content = { kind: MarkupKind.Markdown, value: contentValue };
		hoverResult = { contents: content };

	}

	return hoverResult;

	// return {

	// 	contents: { language: 'javascript', value: contentValue }
	// }
});
//connection.onHover(OnHoverHandler);
//#endregion onHover

connection.languages.semanticTokens.on(async (semanticTokenParams: SemanticTokensParams) => {
	const onSemanticTokensHandler: OnSemanticTokensHandler =
		new OnSemanticTokensHandler(semanticTokenParams, semanticTokenTypes, configurationManager);
	const result: SemanticTokens = await onSemanticTokensHandler.semanticTokens();
	return result;
});

function notifyInformation(errorMessage: string) {
	connection.sendNotification('yamma/showinformation', errorMessage);
}

function notifyError(errorMessage: string) {
	connection.sendNotification('yamma/showerror', errorMessage);
}


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();



