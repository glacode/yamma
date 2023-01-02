import { CompletionItem, CompletionList, TextDocumentPositionParams } from 'vscode-languageserver';
import { ConfigurationManager } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmStatistics } from '../mm/MmStatistics';
import { MmpParser } from '../mmp/MmpParser';
import { MmpStatistics } from '../mmp/MmpStatistics';
import { formulaClassifiersExample, IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { StepSuggestion } from '../stepSuggestion/StepSuggestion';
import { StepSuggestionMap } from '../stepSuggestion/StepSuggestionMap';
import { SyntaxCompletion } from '../syntaxCompletion/SyntaxCompletion';
import { CursorContext, CursorContextForCompletion } from '../mmp/CursorContext';
import { SearchStatementCompletionProvider } from '../search/SearchStatementCompletionProvider';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';

export class OnCompletionHandler {
	textDocumentPosition: TextDocumentPositionParams
	/** line of the cursor */
	cursorLine: number;
	/** column of the cursor */
	cursorCharacter: number;

	configurationManager: ConfigurationManager;

	private stepSuggestionMap?: StepSuggestionMap;
	private mmParser?: MmParser;
	private mmpParser?: MmpParser;

	private mmStatistics?: MmStatistics;
	private mmpStatistics: MmpStatistics | undefined;


	constructor(textDocumentPosition: TextDocumentPositionParams, configurationManager: ConfigurationManager,
		stepSuggestionMap?: StepSuggestionMap, mmParser?: MmParser, mmpParser?: MmpParser,
		mmStatistics?: MmStatistics, mmpStatistics?: MmpStatistics) {
		this.textDocumentPosition = textDocumentPosition;
		this.cursorLine = textDocumentPosition.position.line;
		this.cursorCharacter = textDocumentPosition.position.character;
		this.configurationManager = configurationManager;
		this.stepSuggestionMap = stepSuggestionMap;
		this.mmParser = mmParser;
		this.mmpParser = mmpParser;
		this.mmStatistics = mmStatistics;
		this.mmpStatistics = mmpStatistics;
		console.log(textDocumentPosition.position);
	}
	/** returns the array of symbols expected from the early parser */

	//#region completionItems
	stepSuggestion(cursorContext: CursorContext, mmParser: MmParser): CompletionItem[] {
		// console.log(cursorContext.mmpStatement?.label);
		let completionItems: CompletionItem[] = [];
		if (this.stepSuggestionMap != undefined) {
			// the model has already been loaded
			const formulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
			const stepSuggestion = new StepSuggestion(cursorContext, this.stepSuggestionMap,
				formulaClassifiers, <MmpProofStep>cursorContext.mmpStatement, mmParser);
			completionItems = stepSuggestion.completionItems();
		}
		return completionItems;
	}

	// async completionItems(): Promise<CompletionItem[]> {
	async completionItems(): Promise<CompletionList> {
		let completionItems: CompletionItem[] = [];
		if (this.mmParser != undefined && this.mmpParser != undefined &&
			this.mmStatistics != undefined) {
			const mmParser: MmParser = this.mmParser;
			const mmStatistics: MmStatistics = this.mmStatistics;
			const mmpParser: MmpParser = this.mmpParser;
			completionItems = [
				// {
				// 	label: 'TypeScript',
				// 	kind: CompletionItemKind.Text,
				// 	data: 1
				// },
				// {
				// 	label: 'JavaScript',
				// 	kind: CompletionItemKind.Text,
				// 	data: 2
				// }
			];
			const cursorContext: CursorContext = new CursorContext(this.cursorLine, this.cursorCharacter, mmpParser);
			cursorContext.buildContext();
			switch (cursorContext.contextForCompletion) {
				case CursorContextForCompletion.stepFormula: {
					const syntaxCompletion = new SyntaxCompletion(cursorContext, mmParser, mmpParser,
						mmStatistics, this.mmpStatistics);
					completionItems = syntaxCompletion.completionItems();
				}
					break;
				case CursorContextForCompletion.stepLabel: {
					completionItems = this.stepSuggestion(cursorContext, this.mmParser);
				}
					break;
				case CursorContextForCompletion.searchStatement: {
					const searchStatementCompletionProvider = new SearchStatementCompletionProvider(
						<MmpSearchStatement>cursorContext.mmpStatement,this.mmpParser,this.mmStatistics);
					completionItems = searchStatementCompletionProvider.completionItems();
				}
					break;
				default:
					break;
			}
		}
		// return completionItems;
		const completionList: CompletionList = {
			items: completionItems,
			isIncomplete: true
		};
		return completionList;
	}
	//#endregion completionItems
}