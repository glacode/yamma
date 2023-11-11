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
	PublishDiagnosticsParams,
	Diagnostic,
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';




import { OnHoverHandler } from "./languageServerHandlers/OnHoverHandler";
import { IUnificationResult, OnUnifyHandler } from './languageServerHandlers/OnUnifyHandler';
import { OnDidChangeContentHandler } from './languageServerHandlers/OnDidChangeContentHandler';
import { OnCodeActionHandler } from './languageServerHandlers/OnCodeActionHandler';
import { ConfigurationManager, defaultSettings, IExtensionSettings, LabelsOrderInCompressedProof } from './mm/ConfigurationManager';
import { MmtSaver, MmtSaverArgs, PathAndUri } from './mmt/MmtSaver';

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
import { ILabelMapCreatorForCompressedProof, MmpCompressedProofCreatorFromPackedProof } from './mmp/proofCompression/MmpCompressedProofCreator';

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
				triggerCharacters: ['.', '$', '-', '/', '\\', ' ']
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
connection.onRequest('yamma/storemmt', async (pathAndUri: PathAndUri) => {
	if (globalState.mmParser != undefined) {
		const text: string = <string>documents.get(pathAndUri.uri)?.getText();
		//TODO1 21 AUG 2023 add IMmpLabelMapCreator (based on configuration)
		//TODO1 21 AUG 2023 remove the hardcoded test below
		// const hardCodedLabelSequence: string[] = [
		// 	"cpi", "co", "wceq", "wcel", "a1i", "cc0", "cr", "c4", "cdiv", "cn", "c2", "cmul", "c1", "cmin",
		// 	"csin", "cfv", "caddc", "cli", "wbr", "cmpt", "wtru", "cvv", "oveq1d", "oveq12d", "adantl",
		// 	"id", "ovex", "fvmptd", "cc", "recni", "mulcld", "0red", "resubcld", "clt", "oveq1i", "eqtr2i",
		// 	"cle", "divcld", "cdm", "picn", "wne", "cdvds", "cif", "cmo", "wa", "wf", "eqid", "sylancl",
		// 	"0re", "pipos", "oveq1", "oveq2d", "adantr", "wb", "simpl", "iftrued", "eqtrd", "cdv", "cioo",
		// 	"eqtri", "cres", "pire", "eqcomi", "oveq2i", "syl6eq", "syl3anc", "wss", "wn", "cxr", "0xr",
		// 	"rexri", "elioore", "iooltub", "mp3an12", "eliood", "mp2an", "sseli", "ioossre", "ax-mp",
		// 	"ioogtlb", "ltled", "lttrd", "syl22anc", "crest", "cin", "syl", "eleqtri", "mptru", "mpbid",
		// 	"breqtrd", "iffalsed", "pm2.61dan", "mp2b", "cmnf", "mnfxr", "mpbi", "cpnf", "pnfxr", "climc",
		// 	"constlimc", "ctop", "mp3an", "3eltr4d", "c0", "eqcomd", "ltsub1dd", "eqtr2d", "csu", "vy",
		// 	"cv", "cseq", "nnuz", "1zzd", "eqidd", "oveq2", "fveq2d", "nnz", "zmulcld", "zsubcld", "zcnd",
		// 	"sincld", "2re", "cz", "1red", "remulcld", "zred", "0lt1", "2t1e2", "2m1e1", "breqtri", "nnre",
		// 	"nnge1", "lemul2ad", "lesub1dd", "2z", "0le2", "ltletrd", "gtned", "4cn", "4ne0", "cioc",
		// 	"cneg", "0cnd", "nncn", "mulcl", "nnne0", "gtneii", "ifcld", "mulne0d", "fmpti", "breq2",
		// 	"ifbieq2d", "c0ex", "ifex", "2nn", "nndivdvds", "mpbird", "3adant1", "cn0", "1re", "simpr",
		// 	"renegcli", "ifcli", "breq1d", "ifbid", "cbvmptv", "remulcli", "eqeltri", "mulid2i", "crp",
		// 	"2pos", "mulgt0ii", "elrpii", "modcyc", "readdcld", "fvmpt2", "mpan2", "eqtr4d", "csn", "cfn",
		// 	"eldifi", "negpilt0", "cdif", "snfi", "ltleii", "iooss1", "reseq1i", "resmpt", "pirp",
		// 	"2timesgt", "modid", "eqbrtrd", "mpteq2ia", "3eqtrri", "cpr", "reelprrecn", "ccnfld", "ctopn",
		// 	"crn", "ctg", "iooretop", "tgioo2", "1cnd", "dvmptconst", "ssid", "ax-resscn", "fss",
		// 	"dvresioo", "3eqtr3i", "dmeqi", "dmmpti", "eqtr3i", "ssdmres", "mpbir", "elind", "dmres",
		// 	"adantlr", "ad2antrr", "neqne", "ad2antlr", "lttri5d", "iooss2", "modcld", "2timesi", "negpicn",
		// 	"syl6eleqr", "addassi", "addcomli", "addid2i", "ltadd1dd", "readdcli", "syl6breq", "recnd",
		// 	"addcomd", "negidi", "ltaddneg", "jca", "modid2", "eqtr3d", "lensymd", "negcld", "sylan",
		// 	"eldifn", "condan", "sylibr", "velsn", "ssriv", "ssfi", "ccncf", "inss1", "eqsstri", "ioosscn",
		// 	"sstri", "dvf", "fresin", "ffdm", "cuni", "cun", "simpli", "sseldi", "elun1", "nltled", "ccnp",
		// 	"mnfltd", "lptioo2", "incom", "fveq2i", "syl6eleq", "ltpnfd", "clp", "df-ss", "lptioo1",
		// 	"syl6ss", "resabs1", "eqtr4i", "fssres", "cnt", "0le0", "w3a", "elioc2", "mpbir3an", "mnfle",
		// 	"cnfldtop", "resttop", "iocopn", "iocssre", "elexi", "restabs", "isopn3i", "ioounsn", "fveq12i",
		// 	"mnflt0", "limcres", "ltpnf", "wi", "xrltle", "cico", "elico2", "icoopn", "rge0ssre",
		// 	"snunioo1", "neg1lt0", "0ltpnf", "lttri", "ltneii", "jumpncnp", "inss2", "syl31anc", "eqneltrd",
		// 	"necon2ai", "leneltd", "elun2", "dvcnp2", "mto", "syl2anc", "unipr", "ineq2", "retop", "resex",
		// 	"dmex", "pm3.2i", "restopnb", "ssini", "eqssi", "3pm3.2i", "3eltr4i", "syl6eqel", "elprn1",
		// 	"sylan2", "cncfuni", "reseq2d", "resabs2", "limcresioolb", "constcncfg", "reseq2", "ne0ii",
		// 	"eqnetrd", "icossre", "icogelb", "icoltub", "eldifd", "resres", "iooin", "iftruei", "oveq12i",
		// 	"reseq2i", "limcresiooub", "negpitopissre", "iocgtlb", "iocleub", "necon3bi", "mp4an", "3syl",
		// 	"mnflt", "xrltnle", "iffalsei", "ioossioc", "modcl", "resubcli", "ltsubrpd", "ioossico",
		// 	"elrpd", "feqresmpt", "ltmod", "mpteq2dva", "lbioc", "sselda", "rexrd", "addcli", "subadd23",
		// 	"pncan3oi", "3eqtri", "pncan2", "modabs2", "addid1d", "3eqtrd", "npcand", "3eqtrrd", "3brtr4d",
		// 	"ltsubrp", "syl6req", "modaddabs", "pm4.56", "biimpi", "olc", "modge0", "orcd", "pm2.61dane",
		// 	"nsyl", "modlt", "elicod", "ubioc1", "wo", "eleqtrd", "syl5req", "gtnelioc", "nnncan2d",
		// 	"sub31", "posdifd", "ltsub2dd", "eqbrtri", "eqeltrd", "neg1cn", "nncan", "eqbrtrrd",
		// 	"modsubmodmod", "nncand", "ltaddsublt", "pm2.61i", "subge02", "subidi", "addid1i", "ltadd2dd",
		// 	"lelttrd", "pncan3i", "pncan3d", "ltaddrpd", "ltnled", "ibir", "fvmpt", "readdcl", "1ex",
		// 	"sylancr", "addgegt0d", "eqeltrrd", "ccos", "sqwvfoura", "sqwvfourb", "nnnn0", "coscld",
		// 	"mul02d", "citg", "addid2d", "iftrue", "sylan9eqr", "iffalse", "fourierclim", "0nn0", "div0i",
		// 	"divcli", "subid1i", "sumnnodd", "sylanbrc", "dvdsmul1", "oddp1even", "mulcomd", "divdiv1d",
		// 	"div32d", "seqeq3", "3brtr3i", "elnnz", "fourierswlem", "subcld", "syl5eqel", "1lt2",
		// 	"syl6breqr", "subne0d", "ffvelrnda", "divcan6", "mulid2d", "mulassd", "3eqtr3a", "syl6eqelr",
		// 	"climrel", "releldmi", "climuni", "mulassi", "mulcomli", "isermulc2", "isumclim2", "3eqtr2i",
		// ];

		// const hardCodedLabelsLabelMapCreator: MmpHardcodedLabelSequenceCreator =
		// 	new MmpHardcodedLabelSequenceCreator(hardCodedLabelSequence);
		// const mmpCompressedProofCreatorFromPackedProof: MmpCompressedProofCreatorFromPackedProof =
		// 	new MmpCompressedProofCreatorFromPackedProof(hardCodedLabelsLabelMapCreator);
		const labelsOrderInCompressedProof: LabelsOrderInCompressedProof =
			await configurationManager.labelsOrderInCompressedProof(pathAndUri.uri);

		const labelMapCreatorForCompressedProof: ILabelMapCreatorForCompressedProof =
			MmpCompressedProofCreatorFromPackedProof.getLabelMapCreatorForCompressedProof(
				labelsOrderInCompressedProof, 7, 79);

		const mmtSaverArgs: MmtSaverArgs = {
			textDocumentPath: pathAndUri.fsPath,
			documentContentInTheEditor: text,
			mmParser: globalState.mmParser,
			leftMargin: Parameters.defaultLeftMarginForMmtFilesCompressedProof,
			charactersPerLine: Parameters.charactersPerLine,
			mmpCompressedProofCreator:
				// new MmpCompressedProofCreatorFromPackedProof(new MmpSortedByReferenceWithKnapsackLabelMapCreator(7, 79))
				new MmpCompressedProofCreatorFromPackedProof(labelMapCreatorForCompressedProof)
		};
		// const mmtSaver: MmtSaver = new MmtSaver(pathAndUri.fsPath, text, globalState.mmParser,
		// 	Parameters.defaultLeftMarginForMmtFilesCompressedProof,
		// 	Parameters.charactersPerLine);
		const mmtSaver: MmtSaver = new MmtSaver(mmtSaverArgs);
		mmtSaver.saveMmt();
		if (mmtSaver.isMmtFileSuccessfullyCreated)
			notifyInformation(`The file ${mmtSaver.newFileUri} was successfully created`, connection);
		else
			notifyError(`Something went wrong, the .mmt file was NOT created`, connection);
		console.log('Method saveMmt() has been invoked 2');
	}
});

//#region loadmmt
function sendDiagnosticsFromLoadMmt(diagnosticsMap: Map<string, Diagnostic[]>) {
	diagnosticsMap.forEach((diagnostics: Diagnostic[], uri: string) => {
		const publishDiagnosticsParams: PublishDiagnosticsParams = {
			diagnostics: diagnostics,
			uri: uri
		};
		connection.sendDiagnostics(publishDiagnosticsParams);
	});
}

connection.onRequest('yamma/loadmmt', (pathAndUri: PathAndUri) => {
	if (globalState.mmParser != undefined) {
		const mmtLoader: MmtLoader = new MmtLoader(pathAndUri.fsPath, globalState.mmParser,
			globalState);
		mmtLoader.loadMmt();
		if (mmtLoader.loadFailed && mmtLoader.diagnostics.length > 0) {
			const errorMessage: string = mmtLoader.diagnostics[0].message;
			notifyError(errorMessage, connection);
			sendDiagnosticsFromLoadMmt(mmtLoader.diagnosticsMap);

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
//#endregion loadmmt


connection.onRequest('yamma/search', (searchCommandParameters: ISearchCommandParameters) => {
	console.log('Search command has been invoked');
	const searchCommandHandler: SearchCommandHandler = new SearchCommandHandler(
		Parameters.maxNumberOfSymbolsComputedForSearch, searchCommandParameters, globalState);
	searchCommandHandler.insertSearchStatement();
});

//#region showCatchError
function showCatchError(error: any) {
	let errorStringForNotifyError: string = error.toString();
	if (error instanceof Error)
		errorStringForNotifyError = `${error.name}\n${error.message}\n${error.stack}\n`;
	console.log('Unexpected error:\n', error);
	notifyError('Unexpected error:\n' + errorStringForNotifyError, connection);
}
//#endregion showCatchError


async function unifyAndValidate(textDocumentUri: string) {
	try {
		//TODO1 see if an await here solves the response back before the unify is complete
		const unificationResult: IUnificationResult =
			await OnUnifyHandler.unifyAndValidate(textDocumentUri, connection, documents, hasConfigurationCapability,
				Parameters.maxNumberOfHypothesisDispositionsForStepDerivation, globalState,
				false);
		if (unificationResult.mmpParser?.mmpProof != undefined &&
			unificationResult.mmpParser.mmpProof.isProofComplete)
			notifyInformation('The proof is complete!', connection);
	} catch (error: any) {
		showCatchError(error);
	}
}

connection.onRequest('yamma/completionitemselected', unifyAndValidate);

//TODO notice that this is identical to completionitemselected, but maybe they will be
//different, in the future
connection.onRequest('yamma/unify', unifyAndValidate);


async function unifyRenumberAndValidate(textDocumentUri: string) {
	await OnUnifyHandler.unifyAndValidate(textDocumentUri, connection, documents, hasConfigurationCapability,
		Parameters.maxNumberOfHypothesisDispositionsForStepDerivation, globalState,
		true);
}

connection.onRequest('yamma/unifyAndRenumber', unifyRenumberAndValidate);


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
	//consoleLogWithTimestamp('validateTextDocument mar 12 before setTimeout');
	//uncomment the following line, for debugging (otherwise the theory is loaded before the debugger is attached)
	// await new Promise((resolve) => { setTimeout(resolve, 2000); });
	// consoleLogWithTimestamp('validateTextDocument mar 12 afer setTimeout');
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
