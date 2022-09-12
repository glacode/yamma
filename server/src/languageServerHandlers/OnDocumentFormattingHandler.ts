import { DocumentFormattingParams, TextDocuments, TextEdit } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ConfigurationManager, ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpUnifier } from '../mmp/MmpUnifier';


export class OnDocumentFormattingHandler {

	params: DocumentFormattingParams;
	documents: TextDocuments<TextDocument>;
	mmParser: MmParser;
	configurationManager: ConfigurationManager;

	constructor( params: DocumentFormattingParams, documents: TextDocuments<TextDocument>,mmParser: MmParser,
		configurationManager: ConfigurationManager) {
		this.params = params;
		this.documents = documents;
		this.mmParser = mmParser;
		this.configurationManager = configurationManager;
	}

	//#region  unify

	parseMmpFile(textDocument: TextDocument,proofMode: ProofMode): TextEdit[] {
		// const mmpParser: MmpParser = new MmpParser(textDocument, mmParser)
		const mmpUnifier: MmpUnifier =
			new MmpUnifier(this.mmParser.labelToStatementMap, this.mmParser.outermostBlock,
				this.mmParser.grammar, this.mmParser.workingVars, proofMode);
		const textToParse: string = textDocument.getText();
		if (this.mmParser.grammar != undefined)
			mmpUnifier.unify(textToParse);
		return mmpUnifier.textEditArray;
	}
	async unify(): Promise<TextEdit[]> {
		const textDocument: TextDocument = <TextDocument>this.documents.get(this.params.textDocument.uri);
		const proofMode: ProofMode = await this.configurationManager.proofMode(this.params.textDocument.uri);
		const textEditArray: TextEdit[] = this.parseMmpFile(textDocument,proofMode);

		// this is just a test for an additional fixed textEdit
		// const textEdit: TextEdit = {
		// 	range: {
		// 		start: { line: 2, character: 2 }, end: { line: 2, character: 2 }
		// 	}, newText: "GGGGGGG"
		// };
		// textEditArray.push(textEdit);
	
		return Promise.resolve(textEditArray);
	}
	//#endregion
}