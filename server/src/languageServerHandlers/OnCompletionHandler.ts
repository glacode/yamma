import { CompletionItem, CompletionItemKind, CompletionList, Position, TextDocumentPositionParams } from 'vscode-languageserver';
import { MmToken } from '../grammar/MmLexer';
import { ConfigurationManager } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmStatistics } from '../mm/MmStatistics';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from '../mmp/MmpStatements';
import { MmpStatistics } from '../mmp/MmpStatistics';
import { UProof } from '../mmp/UProof';
import { IUStatement } from '../mmp/UStatement';
import { formulaClassifiersExample, IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { StepSuggestion } from '../stepSuggestion/StepSuggestion';
import { StepSuggestionMap } from '../stepSuggestion/StepSuggestionMap';
import { SyntaxCompletion } from '../syntaxCompletion/SyntaxCompletion';

/** the cursor position determines which kind of completion is required */
enum CursorContextForCompletion {
	stepFormula = 'stepFormula',
	stepLabel = 'stepLabel'
}

/** build info about the cursor context, and the proof step where the cursor is */
export class CursorContext {
	/** line of the cursor */
	cursorLine: number;
	/** column of the cursor */
	cursorCharacter: number;

	mmpParser: MmpParser;

	/** after the execution of buildContext() this property contains the cursor context for autocompletion */
	contextForCompletion?: CursorContextForCompletion;

	/** the MmpProofStep the cursor is positioned on, if any */
	mmpProofStep: MmpProofStep | undefined;

	constructor(cursorLine: number, cursorCharacter: number, mmpParser: MmpParser) {
		this.cursorLine = cursorLine;
		this.cursorCharacter = cursorCharacter;
		this.mmpParser = mmpParser;
	}

	//#region buildContext

	//#region setMmpProofStep
	private getMmpProofStep(uStatements: IUStatement[]): MmpProofStep | undefined {
		let i = 0;
		let uProofStep: MmpProofStep | undefined;
		while (i < uStatements.length && uProofStep == undefined) {
			if (uStatements[i] instanceof MmpProofStep &&
				(<MmpProofStep>uStatements[i]).startPosition.line <= this.cursorLine &&
				this.cursorLine <= (<MmpProofStep>uStatements[i]).endPosition.line)
				uProofStep = <MmpProofStep>uStatements[i];
			i++;
		}
		return uProofStep;
	}

	/** sets the MmpProofStep the cursor is positioned on */
	private setMmpProofStep() {
		const uProof: UProof | undefined = this.mmpParser.uProof;
		if (uProof != undefined)
			this.mmpProofStep = this.getMmpProofStep(uProof.uStatements);
	}
	//#endregion setMmpProofStep

	//#region formulaBeforeCursor

	private isOnStepLabel(mmpProofStep: MmpProofStep): boolean {
		const firstTokenEnd: Position = mmpProofStep.firstTokenInfo.firstToken.range.end;
		const result: boolean = (firstTokenEnd.line == this.cursorLine && firstTokenEnd.character == this.cursorCharacter);
		return result;
	}

	//#region getFormulaBeforeCursorInUProofStep
	private tokenStartsBefore(formulaToken: MmToken) {
		const result: boolean = formulaToken.range.start.line < this.cursorLine ||
			(formulaToken.range.start.line == this.cursorLine && formulaToken.range.start.character <= this.cursorCharacter);
		return result;
	}
	/** returns the formula before the cursor. If there is no formula or the cursor is not in the formula, it
	 * returns undefined
	 */
	private getFormulaBeforeCursorInUProofStep(mmpProofStep: MmpProofStep): MmToken[] | undefined {
		let formulaBeforeCursor: MmToken[] | undefined;
		const formula: MmToken[] | undefined = mmpProofStep.formula;
		if (formula == undefined || formula.length == 0) {
			// the formula is empty
			const endOfFormula: MmToken = new MmToken('UnxpexcteEndOfFormula', 0, 0);
			formulaBeforeCursor = [endOfFormula];
		} else if (this.tokenStartsBefore(formula[0])) {
			formulaBeforeCursor = [];
			let i = 0;
			while (i < formula.length && this.tokenStartsBefore(formula[i])) {
				formulaBeforeCursor.push(formula[i]);
				i++;
			}
		}
		return formulaBeforeCursor;
	}
	//#endregion getFormulaBeforeCursorInUProofStep



	/** returns undefined if the cursor is not on a proof step; returns [] if the cursor is on an empty proof step formula;
	 * returns the portion of formula that preceeds the cursor (if the cursor is on a nonempty proof step formula)
	 */
	public formulaBeforeCursor(): MmToken[] | undefined {
		let formula: MmToken[] | undefined;
		const uProof: UProof | undefined = this.mmpParser.uProof;
		if (uProof != undefined) {
			const uProofStep: MmpProofStep | undefined = this.getMmpProofStep(uProof.uStatements);
			if (uProofStep != undefined) {
				if (this.isOnStepLabel(uProofStep))
					//TODO
					this.contextForCompletion = CursorContextForCompletion.stepLabel;
				else {
					formula = this.getFormulaBeforeCursorInUProofStep(uProofStep);
					//TODO this needs to be improved, now it's not checking if it's in 'free space'
					this.contextForCompletion = CursorContextForCompletion.stepFormula;
				}
			}
		}
		return formula;
	}
	//#endregion formulaBeforeCursor



	buildContext() {
		this.setMmpProofStep();
		this.formulaBeforeCursor();
	}
	//#endregion buildContext

}

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
		console.log(cursorContext.mmpProofStep?.label);
		let completionItems: CompletionItem[] = [];
		if (this.stepSuggestionMap != undefined) {
			// the model has already been loaded
			const formulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
			const stepSuggestion = new StepSuggestion(cursorContext, this.stepSuggestionMap,
				formulaClassifiers, cursorContext.mmpProofStep, mmParser);
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
				{
					label: 'TypeScript',
					kind: CompletionItemKind.Text,
					data: 1
				},
				{
					label: 'JavaScript',
					kind: CompletionItemKind.Text,
					data: 2
				}
			];
			const cursorContext: CursorContext = new CursorContext(this.cursorLine, this.cursorCharacter, mmpParser);
			cursorContext.buildContext();
			switch (cursorContext.contextForCompletion) {
				case CursorContextForCompletion.stepFormula: {
					const syntaxCompletion = new SyntaxCompletion(cursorContext, mmParser, mmpParser,
						mmStatistics,this.mmpStatistics);
					completionItems = syntaxCompletion.completionItems();
				}
					break;
				case CursorContextForCompletion.stepLabel: {
					completionItems = this.stepSuggestion(cursorContext, this.mmParser);
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