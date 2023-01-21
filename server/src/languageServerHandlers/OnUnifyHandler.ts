import { TextDocuments, TextEdit } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { GlobalState } from '../general/GlobalState';
import { ConfigurationManager, ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { validateTextDocument } from '../server';


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


	//#region unifyIfTheCase
	static async requestTextValidationIfUnificationChangedNothing(
		textDocumentUri: string, documents: TextDocuments<TextDocument>) {
		const textDocument: TextDocument = documents.get(textDocumentUri)!;
		// const currentText: string | undefined = textDocument.getText();
		// if (textEdits.length == 0 || textEdits[0].newText == currentText) {
		// current unification either didn't run or returns a text that's identical
		// to the prvious one; in eithre case it will not trigger a new validation,
		// but we want a new validation after the unification (it will move the cursor)
		await validateTextDocument(textDocument);
		// }
	}
	static async unifyIfTheCase(textDocumentUri: string, globalState: GlobalState,
		maxNumberOfHypothesisDispositionsForStepDerivation: number,
		documents: TextDocuments<TextDocument>): Promise<TextEdit[]> {
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
		OnUnifyHandler.requestTextValidationIfUnificationChangedNothing(textDocumentUri, documents);
		return result;
	}
	//#endregion unifyIfTheCase
}