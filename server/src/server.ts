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
	TextDocument} from 'vscode-languageserver-textdocument';




import { OnHoverHandler } from "./languageServerHandlers/OnHoverHandler";
import { OnUnifyHandler } from './languageServerHandlers/OnUnifyHandler';
import { OnDidChangeContentHandler } from './languageServerHandlers/OnDidChangeContentHandler';
import { OnCodeActionHandler } from './languageServerHandlers/OnCodeActionHandler';
import { ConfigurationManager, defaultSettings, IExtensionSettings } from './mm/ConfigurationManager';
import { MmtSaver, PathAndUri } from './mmt/MmtSaver';

import { MmtLoader } from './mmt/MmtLoader';
import { OnCompletionHandler } from './languageServerHandlers/OnCompletionHandler';
import { GlobalState } from './general/GlobalState';
import { OnCompletionResolveHandler } from './languageServerHandlers/OnCompletionResolveHandler';
import { OnSemanticTokensHandler, semanticTokenTypes } from './languageServerHandlers/OnSemanticTokensHandler';
import { notifyError, notifyInformation } from './mm/Utils';
import { MmParser } from './mm/MmParser';
import { MmpParser } from './mmp/MmpParser';
import { SearchCommandHandler, ISearchCommandParameters } from './search/SearchCommandHandler';
import { Parameters } from './general/Parameters';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
// const connection = createConnection(ProposedFeatures.all);
const connection: Connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

const globalState: GlobalState = new GlobalState();

//#region onInitialize
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

	globalState.connection = connection;
	configurationManager = new ConfigurationManager(hasConfigurationCapability,
		hasDiagnosticRelatedInformationCapability, defaultSettings, globalSettings, connection, globalState);
	globalState.configurationManager = configurationManager;




	return result;
});
//#endregion onInitialize

//Glauco
connection.onRequest('yamma/storemmt', (pathAndUri: PathAndUri) => {
	if (globalState.mmParser != undefined) {
		const text: string = <string>documents.get(pathAndUri.uri)?.getText();
		const mmtSaver: MmtSaver = new MmtSaver(pathAndUri.fsPath, text, globalState.mmParser);
		mmtSaver.saveMmt();
		console.log('Method saveMmt() has been invoked 2');
	}
});

connection.onRequest('yamma/loadmmt', (pathAndUri: PathAndUri) => {
	if (globalState.mmParser != undefined) {
		const mmtLoader: MmtLoader = new MmtLoader(pathAndUri.fsPath, globalState.mmParser);
		mmtLoader.loadMmt();
		if (mmtLoader.loadFailed && mmtLoader.diagnostics.length > 0) {
			const errorMessage: string = mmtLoader.diagnostics[0].message;
			notifyError(errorMessage, connection);
		} else if (!mmtLoader.loadFailed) {
			notifyInformation('All .mmt files have been successfully loaded and ' +
				'added to the theory', connection);
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
		Parameters.maxNumberOfSymbolsComputedForSearch, searchCommandParameters, globalState);
	searchCommandHandler.insertSearchStatement();
});

async function unifyAndValidate(textDocumentUri: string) {
	OnUnifyHandler.unifyAndValidate(textDocumentUri,connection,documents,hasConfigurationCapability,
		Parameters.maxNumberOfHypothesisDispositionsForStepDerivation,globalState);
}

connection.onRequest('yamma/completionitemselected', unifyAndValidate);

//TODO notice that this is identical to completionitemselected, but maybe they will be
//different, in the future
connection.onRequest('yamma/unify', unifyAndValidate);


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
	documents.all().forEach(validateTextDocument);
});


// Only keep settings for open documents
documents.onDidClose(e => {
	if (globalState.configurationManager != undefined)
		globalState.configurationManager.delete(e.document.uri);
});

//#region onDidChangeContent
export async function validateTextDocument(textDocument: TextDocument) {
	await OnDidChangeContentHandler.validateTextDocument(textDocument,
		connection, hasConfigurationCapability, hasDiagnosticRelatedInformationCapability, globalState);
}

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(async change => {
	// await parseMainMMfile(change.document.uri);
	console.log('onDidChangeContent: GlobalState.mmParser = ' + globalState.mmParser);
	if (globalState.mmParser == undefined)
		await configurationManager.updateTheoryIfTheCase();
	await validateTextDocument(change.document);
});
//#endregion onDidChangeContent

//TODO I believe this is not triggered by a tab click
documents.onDidOpen(async change => {
	console.log('documents.onDidOpen : ' + change.document.uri);
	globalState.lastMmpParser = undefined;
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
			new OnCompletionHandler(_textDocumentPosition, configurationManager, globalState.stepSuggestionMap,
				globalState.mmParser, globalState.lastMmpParser, globalState.mmStatistics, globalState.mmpStatistics);
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
			new OnCompletionResolveHandler(globalState.mmParser);
		onCompletionResolveHandler.addDocumentationIfPossible(item);
		return item;
	}
);

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
	if (globalState.mmParser != undefined) {
		const contentValue: string | undefined = OnHoverHandler.getHoverMessage(params, documents, globalState.mmParser);
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
	const mmParser: MmParser | undefined = globalState.mmParser;
	let mmpParser: MmpParser | undefined = globalState.lastMmpParser;
	//TODO move all this handler onSemanticTokensHandler.semanticTokens (pass documents to the
	// OnSemanticTokensHandler constructor) 
	if (mmParser != undefined && mmpParser == undefined) {
		const textDocument: TextDocument = documents.get(semanticTokenParams.textDocument.uri)!;
		await validateTextDocument(textDocument);
		mmpParser = globalState.lastMmpParser;
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