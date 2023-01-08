import { TextEdit } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { ConfigurationManager, ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpUnifier } from '../mmp/MmpUnifier';


export class OnDocumentFormattingHandler {

	// params: DocumentFormattingParams;
	// documents: TextDocuments<TextDocument>;
	mmParser: MmParser;
	configurationManager: ConfigurationManager;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;

	// constructor(params: DocumentFormattingParams, mmParser: MmParser,
	constructor(private textDocumentUri: string, mmParser: MmParser,
		configurationManager: ConfigurationManager, maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		// this.params = params;
		// this.documents = documents;
		this.mmParser = mmParser;
		this.configurationManager = configurationManager;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;
	}

	//#region  unify

	// parseMmpFile(textDocument: TextDocument, proofMode: ProofMode): TextEdit[] {
	parseMmpFile(proofMode: ProofMode): TextEdit[] {
		// const mmpParser: MmpParser = new MmpParser(textDocument, mmParser)
		// const mmpUnifier: MmpUnifier =
		// 	new MmpUnifier(this.mmParser.labelToStatementMap, this.mmParser.outermostBlock,
		// 		this.mmParser.grammar, this.mmParser.workingVars, proofMode, GlobalState.lastMmpParser);
		//TODO manage case GlobalState.lastMmpParser == undefined (invoke unify only if it is not undefined) 
		const mmpUnifier: MmpUnifier =
			new MmpUnifier(GlobalState.lastMmpParser!, proofMode, this.maxNumberOfHypothesisDispositionsForStepDerivation);
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
	//#endregion
}