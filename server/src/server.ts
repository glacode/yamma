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
	Hover,
	MarkupContent,
	MarkupKind,
	CodeAction,
	CodeActionParams,
	SemanticTokensParams,
	SemanticTokens,
	SemanticTokenModifiers,
	_Connection,
	Connection,
	CompletionList,
} from 'vscode-languageserver/node';

import {
	TextDocument, TextEdit
} from 'vscode-languageserver-textdocument';




import { OnHoverHandler } from "./languageServerHandlers/OnHoverHandler";
import { OnDocumentFormattingHandler } from './languageServerHandlers/OnDocumentFormattingHandler';
import { OnDidChangeContentHandler } from './languageServerHandlers/OnDidChangeContentHandler';
import { OnCodeActionHandler } from './languageServerHandlers/OnCodeActionHandler';
import { ConfigurationManager, defaultSettings, IExtensionSettings } from './mm/ConfigurationManager';
import { MmtSaver, PathAndUri } from './mmt/MmtSaver';

import { MmtLoader } from './mmt/MmtLoader';
import { OnCompletionHandler } from './languageServerHandlers/OnCompletionHandler';
import { GlobalState } from './general/GlobalState';
import { OnCompletionResolveHandler } from './languageServerHandlers/OnCompletionResolveHandler';
import { OnSemanticTokensHandler, semanticTokenTypes } from './languageServerHandlers/OnSemanticTokensHandler';
import { applyTextEdits, notifyError, notifyInformation } from './mm/Utils';
import { MmParser } from './mm/MmParser';
import { MmpParser } from './mmp/MmpParser';
import { SearchCommandHandler, ISearchCommandParameters } from './search/SearchCommandHandler';
import { Parameters } from './general/Parameters';
import { ISearchCompletionItemCommandParameters } from './search/SearchCompletionItemSelectedHandler';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
// const connection = createConnection(ProposedFeatures.all);
const connection: Connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

//glaucoconnection

//#region onInitialize

//Glauco
// let mmParser: MmParser;
/** true iff a unify() has been performed, but the cursor has not been updated yet*/
let unifyDoneButCursorPositionNotUpdatedYet = false;




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
	GlobalState.connection = connection;
	// connection.onDidChangeConfiguration(configurationManager.onDidChangeConfiguration);

	// parseMainMMfile(params);



	return result;
});
//#endregion onInitialize

//Glauco
connection.onRequest('yamma/storemmt', (pathAndUri: PathAndUri) => {
	if (GlobalState.mmParser != undefined) {
		const text: string = <string>documents.get(pathAndUri.uri)?.getText();
		const mmtSaver: MmtSaver = new MmtSaver(pathAndUri.fsPath, text, GlobalState.mmParser);
		// const mmtSaver: MmtSaver = new MmtSaver(fsPath, mmParser);
		mmtSaver.saveMmt();
		console.log('Method saveMmt() has been invoked 2');
	}
});

connection.onRequest('yamma/loadmmt', (pathAndUri: PathAndUri) => {
	if (GlobalState.mmParser != undefined) {
		const mmtLoader: MmtLoader = new MmtLoader(pathAndUri.fsPath, GlobalState.mmParser);
		mmtLoader.loadMmt();
		if (mmtLoader.loadFailed && mmtLoader.diagnostics.length > 0) {
			const errorMessage: string = mmtLoader.diagnostics[0].message;
			notifyError(errorMessage, connection);
		} else if (!mmtLoader.loadFailed) {
			notifyInformation('All .mmt files have been successfully loaded and ' +
				'added to the theory', connection);
			// const textDocument: TextDocument = documents.get(semanticTokenParams.textDocument.uri)!;
			const textDocument: TextDocument | undefined = documents.get(pathAndUri.uri);
			if (textDocument != undefined)
				validateTextDocument(textDocument);
		}
		// console.log('Method loadmmt() has been invoked');
	}
});

connection.onRequest('yamma/search', (searchCommandParameters: ISearchCommandParameters) => {
	console.log('Search command has been invoked');
	const searchCommandHandler: SearchCommandHandler = new SearchCommandHandler(
		Parameters.maxNumberOfSymbolsComputedForSearch, searchCommandParameters, connection,
		GlobalState.lastMmpParser, GlobalState.mmStatistics);
	searchCommandHandler.insertSearchStatement();
});

//TODO1 remove this one if not needed anymore
connection.onRequest('yamma/searchcompletionitemselected', async (searchCompletionItemCommandParameters:
	ISearchCompletionItemCommandParameters) => {
	// console.log('Completion item selected' + searchCompletionItemCommandParameters.searchStatementRangeStartLine);
	// const searchCompletionItemSelectedHandler: SearchCompletionItemSelectedHandler =
	// 	new SearchCompletionItemSelectedHandler(searchCompletionItemCommandParameters, connection);
	// searchCompletionItemSelectedHandler.deleteSearchStatement();
	const result: TextEdit[] = await unifyIfTheCase(searchCompletionItemCommandParameters.uri);
	applyTextEdits(result, searchCompletionItemCommandParameters.uri, connection);
});

connection.onRequest('yamma/completionitemselected', async (textDocumentUri: string) => {
	const result: TextEdit[] = await unifyIfTheCase(textDocumentUri);
	applyTextEdits(result, textDocumentUri, connection);
});

//TODO notice that this is identical to completionitemselected, but maybe they will be
//different, in the future
//TODO1
connection.onRequest('yamma/unify', async (textDocumentUri: string) => {
	const result: TextEdit[] = await unifyIfTheCase(textDocumentUri);
	applyTextEdits(result, textDocumentUri, connection);
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
// const documentSettings: Map<string, Thenable<IExtensionSettings>> = new Map();

let configurationManager: ConfigurationManager;

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		// documentSettings.clear();
		configurationManager.didChangeConfiguration(change);
	} else {
		globalSettings = <IExtensionSettings>(
			(change.settings.yamma || defaultSettings)
		);
	}

	// Revalidate all open text documents
	// documents.all().forEach(validateTextDocument);
	documents.all().forEach(validateTextDocument);
});


// Only keep settings for open documents
documents.onDidClose(e => {
	if (GlobalState.configurationManager != undefined)
		GlobalState.configurationManager.delete(e.document.uri);
	// documentSettings.delete(e.document.uri);
});

//#region onDidChangeContent
async function validateTextDocument(textDocument: TextDocument) {
	// const onDidChangeContent: OnDidChangeContentHandler = new OnDidChangeContentHandler(connection,
	// 	hasConfigurationCapability, hasDiagnosticRelatedInformationCapability,
	// 	// globalSettings, documentSettings, GlobalState.mmParser);
	// 	globalSettings, GlobalState.configurationManager, GlobalState.mmParser);
	// onDidChangeContent.validateTextDocument(textDocument, unifyDoneButCursorPositionNotUpdatedYet);
	await OnDidChangeContentHandler.validateTextDocument(textDocument, connection, hasConfigurationCapability,
		hasDiagnosticRelatedInformationCapability, globalSettings, unifyDoneButCursorPositionNotUpdatedYet,
		GlobalState.formulaToParseNodeCache);
	unifyDoneButCursorPositionNotUpdatedYet = false;
}

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(async change => {
	// await parseMainMMfile(change.document.uri);
	console.log('onDidChangeContent: GlobalState.mmParser = ' + GlobalState.mmParser);
	if (GlobalState.mmParser == undefined)
		await configurationManager.updateTheoryIfTheCase();
	await validateTextDocument(change.document);
	GlobalState.validatedSinceLastUnify = true;
});
//#endregion onDidChangeContent

//TODO I believe this is not triggered by a tab click
documents.onDidOpen(async change => {
	console.log('documents.onDidOpen : ' + change.document.uri);
	GlobalState.lastMmpParser = undefined;
	// await parseMainMMfile(change.document.uri);
	// if (GlobalState.mmParser != undefined)
	// 	validateTextDocument(change.document);
});

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	// async (_textDocumentPosition: TextDocumentPositionParams): Promise<CompletionItem[]> => {
	async (_textDocumentPosition: TextDocumentPositionParams): Promise<CompletionList> => {
		const onCompletionHandler: OnCompletionHandler =
			new OnCompletionHandler(_textDocumentPosition, configurationManager, GlobalState.stepSuggestionMap,
				GlobalState.mmParser, GlobalState.lastMmpParser, GlobalState.mmStatistics, GlobalState.mmpStatistics);
		// const result: CompletionItem[] = await onCompletionHandler.completionItems();
		const result: CompletionList = await onCompletionHandler.completionItems();

		return result;
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		const onCompletionResolveHandler: OnCompletionResolveHandler =
			new OnCompletionResolveHandler();
		onCompletionResolveHandler.addDocumentationIfPossible(item);
		return item;
	}
);

//#region unifyIfTheCase
async function requestTextValidationIfUnificationChangedNothing(
	textDocumentUri: string, textEdits: TextEdit[]) {
	const textDocument: TextDocument = documents.get(textDocumentUri)!;
	const currentText: string | undefined = textDocument.getText();
	if (textEdits.length == 0 || textEdits[0].newText == currentText) {
		// current unification either didn't run or returns a text that's identical
		// to the prvious one; in eithre case it will not trigger a new validation,
		// but we want a new validation after the unification (it will move the cursor)
		await validateTextDocument(textDocument);
	}
}
async function unifyIfTheCase(textDocumentUri: string): Promise<TextEdit[]> {
	let result: Promise<TextEdit[]> = Promise.resolve([]);
	if (GlobalState.mmParser != undefined && GlobalState.validatedSinceLastUnify) {
		const onDocumentFormattingHandler: OnDocumentFormattingHandler =
			new OnDocumentFormattingHandler(textDocumentUri, GlobalState.mmParser,
				configurationManager, Parameters.maxNumberOfHypothesisDispositionsForStepDerivation);
		result = onDocumentFormattingHandler.unify();
		GlobalState.validatedSinceLastUnify = false;
		unifyDoneButCursorPositionNotUpdatedYet = true;
	}
	requestTextValidationIfUnificationChangedNothing(textDocumentUri, (await result));
	return result;
}
//#endregion unifyIfTheCase

// connection.onDocumentFormatting(
// 	(params: DocumentFormattingParams): Promise<TextEdit[]> => {
// 		const result: Promise<TextEdit[]> = unifyIfTheCase(params.textDocument.uri);
// 		return result;
// 	}
// );

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
	if (GlobalState.mmParser != undefined) {
		const contentValue: string | undefined = OnHoverHandler.getHoverMessage(params, documents, GlobalState.mmParser);
		let content: MarkupContent | undefined;
		if (contentValue != undefined) {
			// const content : MarkupContent = { kind: MarkupKind.Markdown ,value: contentValue};
			content = { kind: MarkupKind.Markdown, value: contentValue };
			hoverResult = { contents: content };

		}
	}
	return hoverResult;
});
//connection.onHover(OnHoverHandler);
//#endregion onHover

connection.languages.semanticTokens.on(async (semanticTokenParams: SemanticTokensParams) => {
	// this handler computes semantic tokens only when the MmpParser
	// has already been run on the current document
	let result: SemanticTokens = { data: [] };
	console.log('connection.languages.semanticTokens.on1');
	const mmParser: MmParser | undefined = GlobalState.mmParser;
	let mmpParser: MmpParser | undefined = GlobalState.lastMmpParser;
	//TODO move all this handler onSemanticTokensHandler.semanticTokens (pass documents to the
	// OnSemanticTokensHandler constructor) 
	if (mmParser != undefined && mmpParser == undefined) {
		const textDocument: TextDocument = documents.get(semanticTokenParams.textDocument.uri)!;
		await validateTextDocument(textDocument);
		mmpParser = GlobalState.lastMmpParser;
	}
	// if (GlobalState.mmParser != undefined && GlobalState.lastMmpParser != undefined && GlobalState.lastMmpParser.workingVars != undefined) {
	if (mmParser != undefined && mmpParser != undefined && mmpParser.workingVars != undefined) {
		// the handler has been invoked after the .mmp file has been parsed
		const onSemanticTokensHandler: OnSemanticTokensHandler =
			// new OnSemanticTokensHandler(semanticTokenParams, semanticTokenTypes, configurationManager,
			// 	GlobalState.lastMmpParser.workingVars);
			new OnSemanticTokensHandler(semanticTokenParams, semanticTokenTypes, configurationManager,
				mmParser, mmpParser);
		console.log('connection.languages.semanticTokens.on2');
		result = await onSemanticTokensHandler.semanticTokens();
	}
	return result;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();