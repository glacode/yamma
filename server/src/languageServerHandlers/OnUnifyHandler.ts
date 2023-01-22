import { Connection, TextDocuments, TextEdit } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { GlobalState } from '../general/GlobalState';
import { ConfigurationManager, ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { applyTextEdits } from '../mm/Utils';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { OnDidChangeContentHandler } from './OnDidChangeContentHandler';


export class OnUnifyHandler {
	// params: DocumentFormattingParams;
	// documents: TextDocuments<TextDocument>;
	mmParser: MmParser;
	configurationManager: ConfigurationManager;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;

	// constructor(params: DocumentFormattingParams, mmParser: MmParser,
	constructor(private textDocumentUri: string, mmParser: MmParser, private mmpParser: MmpParser,
		configurationManager: ConfigurationManager, maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		// this.params = params;
		// this.documents = documents;
		this.mmParser = mmParser;
		this.configurationManager = configurationManager;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;
	}

	//#region unify
	parseMmpFile(proofMode: ProofMode): TextEdit[] {
		// const mmpParser: MmpParser = new MmpParser(textDocument, mmParser)
		// const mmpUnifier: MmpUnifier =
		// 	new MmpUnifier(this.mmParser.labelToStatementMap, this.mmParser.outermostBlock,
		// 		this.mmParser.grammar, this.mmParser.workingVars, proofMode, GlobalState.lastMmpParser);
		//TODO manage case GlobalState.lastMmpParser == undefined (invoke unify only if it is not undefined) 
		const mmpUnifier: MmpUnifier =
			new MmpUnifier(this.mmpParser, proofMode, this.maxNumberOfHypothesisDispositionsForStepDerivation);
		// const textToParse: string = textDocument.getText();
		if (this.mmParser.grammar != undefined)
			mmpUnifier.unify();
		return mmpUnifier.textEditArray;
	}
	async unify(): Promise<TextEdit[]> {
		// const proofMode: ProofMode = await this.configurationManager.proofMode(this.params.textDocument.uri);
		const proofMode: ProofMode = await this.configurationManager.proofMode(this.textDocumentUri);
		const textEditArray: TextEdit[] = this.parseMmpFile(proofMode);
		return Promise.resolve(textEditArray);
	}
	//#endregion unify


	static async unifyIfTheCase(textDocumentUri: string, globalState: GlobalState,
		maxNumberOfHypothesisDispositionsForStepDerivation: number): Promise<TextEdit[]> {
		let result: Promise<TextEdit[]> = Promise.resolve([]);
		// if (GlobalState.mmParser != undefined && GlobalState.validatedSinceLastUnify) {
		if (globalState.mmParser != undefined && globalState.lastMmpParser != undefined
			&& globalState.configurationManager != undefined) {
			const onDocumentFormattingHandler: OnUnifyHandler =
				new OnUnifyHandler(textDocumentUri, globalState.mmParser, globalState.lastMmpParser,
					globalState.configurationManager, maxNumberOfHypothesisDispositionsForStepDerivation);
			const textEditArray: TextEdit[] = await onDocumentFormattingHandler.unify();
			// result = onDocumentFormattingHandler.unify();
			result = Promise.resolve(textEditArray);
			globalState.unifyDoneButCursorPositionNotUpdatedYet = true;
		}
		return result;
	}


	//#region unifyAndValidate
	// private static async unifyIfTheCase(textDocumentUri: string): Promise<TextEdit[]> {
	// 	const result: Promise<TextEdit[]> = OnUnifyHandler.unifyIfTheCase(textDocumentUri,
	// 		globalState, Parameters.maxNumberOfHypothesisDispositionsForStepDerivation);
	// 	return result;
	// }

	//#region applyTextEditsAndValidate
	private static async requireValidation(textDocumentUri: string, connection: Connection,
		documents: TextDocuments<TextDocument>, hasConfigurationCapability: boolean,
		hasDiagnosticRelatedInformationCapability: boolean, globalState: GlobalState) {
		const textDocument: TextDocument = documents.get(textDocumentUri)!;
		await OnDidChangeContentHandler.validateTextDocument(textDocument,
			connection, hasConfigurationCapability, hasDiagnosticRelatedInformationCapability, globalState);
	}
	private static async applyTextEditsAndValidate(textEdits: TextEdit[], textDocumentUri: string,
		connection: Connection, documents: TextDocuments<TextDocument>,
		hasConfigurationCapability: boolean,
		globalState: GlobalState) {
		await applyTextEdits(textEdits, textDocumentUri, connection);
		// we require validation explicity, because sometimes applyEdit doesn't trigger a new validation,
		// at least in VSCode (for instance, if the applied change is equal to the previous text);
		// but we want a new validation, because it moves the cursor to the proper position
		await OnUnifyHandler.requireValidation(textDocumentUri, connection, documents, hasConfigurationCapability,
			hasConfigurationCapability, globalState);
	}
	//#endregion applyTextEditsAndValidate
	static async unifyAndValidate(textDocumentUri: string, connection: Connection, documents: TextDocuments<TextDocument>,
		hasConfigurationCapability: boolean, maxNumberOfHypothesisDispositionsForStepDerivation: number,
		globalState: GlobalState) {
		const result: TextEdit[] = await OnUnifyHandler.unifyIfTheCase(textDocumentUri, globalState,
			maxNumberOfHypothesisDispositionsForStepDerivation);
		await OnUnifyHandler.applyTextEditsAndValidate(result, textDocumentUri, connection, documents,
			hasConfigurationCapability, globalState);
	}
	//#endregion unifyAndValidate

}