import path = require('path');
import { Connection, TextDocuments, TextEdit } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { GlobalState } from '../general/GlobalState';
import { ConfigurationManager, LabelsOrderInCompressedProof, ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { applyTextEdits } from '../mm/Utils';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { MmpValidator } from '../mmp/MmpValidator';
import { OnDidChangeContentHandler } from './OnDidChangeContentHandler';
import { ILabelMapCreatorForCompressedProof, IMmpCompressedProofCreator, MmpCompressedProofCreatorFromPackedProof } from '../mmp/proofCompression/MmpCompressedProofCreator';

export class OnUnifyHandler {
	// params: DocumentFormattingParams;
	// documents: TextDocuments<TextDocument>;
	mmParser: MmParser;
	configurationManager: ConfigurationManager;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;

	// constructor(params: DocumentFormattingParams, mmParser: MmParser,
	constructor(private textDocumentUri: string, mmParser: MmParser, private mmpParser: MmpParser,
		configurationManager: ConfigurationManager, maxNumberOfHypothesisDispositionsForStepDerivation: number,
		private renumber: boolean) {
		// this.params = params;
		// this.documents = documents;
		this.mmParser = mmParser;
		this.configurationManager = configurationManager;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;
	}

	//#region unifyIfTheCase

	//#region unify

	//#region parseMmpFile

	//#region buildMmpCompressedProofCreator
	private buildMmpCompressedProofCreator(labelsOrderInCompressedProof: LabelsOrderInCompressedProof):
		IMmpCompressedProofCreator {
		const labelMapCreatorForCompressedProof: ILabelMapCreatorForCompressedProof =
			MmpCompressedProofCreatorFromPackedProof.getLabelMapCreatorForCompressedProof(
				labelsOrderInCompressedProof, 4, 79);
		const mmpCompressedProofCreator: MmpCompressedProofCreatorFromPackedProof
			= new MmpCompressedProofCreatorFromPackedProof(labelMapCreatorForCompressedProof);
		return mmpCompressedProofCreator;
	}
	//#endregion buildMmpCompressedProofCreator

	private parseMmpFile(proofMode: ProofMode, labelsOrderInCompressedProof: LabelsOrderInCompressedProof):
		TextEdit[] {
		// const mmpParser: MmpParser = new MmpParser(textDocument, mmParser)
		// const mmpUnifier: MmpUnifier =
		// 	new MmpUnifier(this.mmParser.labelToStatementMap, this.mmParser.outermostBlock,
		// 		this.mmParser.grammar, this.mmParser.workingVars, proofMode, GlobalState.lastMmpParser);
		//TODO manage case GlobalState.lastMmpParser == undefined (invoke unify only if it is not undefined)
		const expectedTheoremLabel: string = path.parse(this.textDocumentUri).name;
		const mmpCompressedProofCreator: IMmpCompressedProofCreator =
			this.buildMmpCompressedProofCreator(labelsOrderInCompressedProof);
		const mmpUnifier: MmpUnifier =
			new MmpUnifier(this.mmpParser, proofMode, this.maxNumberOfHypothesisDispositionsForStepDerivation,
				this.renumber, expectedTheoremLabel, undefined, undefined, mmpCompressedProofCreator);
		// const textToParse: string = textDocument.getText();
		if (this.mmParser.grammar != undefined)
			mmpUnifier.unify();
		return mmpUnifier.textEditArray;
	}
	//#endregion parseMmpFile

	private async unify(): Promise<TextEdit[]> {
		// const proofMode: ProofMode = await this.configurationManager.proofMode(this.params.textDocument.uri);
		const proofMode: ProofMode = await this.configurationManager.proofMode(this.textDocumentUri);
		const labelsOrderInCompressedProof: LabelsOrderInCompressedProof =
			await this.configurationManager.labelsOrderInCompressedProof(this.textDocumentUri);
		const textEditArray: TextEdit[] = this.parseMmpFile(proofMode, labelsOrderInCompressedProof);
		return Promise.resolve(textEditArray);
	}
	//#endregion unify

	static async unifyIfTheCase(textDocumentUri: string, documents: TextDocuments<TextDocument>,
		globalState: GlobalState, maxNumberOfHypothesisDispositionsForStepDerivation: number,
		renumber: boolean): Promise<TextEdit[]> {
		let result: Promise<TextEdit[]> = Promise.resolve([]);
		if (globalState.mmParser != undefined && globalState.lastMmpParser != undefined
			&& globalState.configurationManager != undefined) {
			const mmpParser: MmpParser | undefined = MmpValidator.buildMmpParserFromUri(
				textDocumentUri, documents, globalState.mmParser, globalState.formulaToParseNodeCache);
			if (mmpParser != undefined) {
				const onDocumentFormattingHandler: OnUnifyHandler =
					new OnUnifyHandler(textDocumentUri, globalState.mmParser, mmpParser,
						globalState.configurationManager, maxNumberOfHypothesisDispositionsForStepDerivation,
						renumber);
				const textEditArray: TextEdit[] = await onDocumentFormattingHandler.unify();
				result = Promise.resolve(textEditArray);
				globalState.requireCursorPositionUpdate();
			}
		}
		return result;
		//#endregion unifyIfTheCase
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
		if (textDocument != undefined)
			// this happens if unification is (mistakenly) required from a .mmt file
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
		globalState: GlobalState, renumber: boolean) {
		const result: TextEdit[] = await OnUnifyHandler.unifyIfTheCase(textDocumentUri, documents,
			globalState, maxNumberOfHypothesisDispositionsForStepDerivation, renumber);
		await OnUnifyHandler.applyTextEditsAndValidate(result, textDocumentUri, connection, documents,
			hasConfigurationCapability, globalState);
	}
	//#endregion unifyAndValidate

}