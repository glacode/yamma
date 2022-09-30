import { CompletionItem, CompletionItemKind, Position, TextDocumentPositionParams } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { MmToken } from '../grammar/MmLexer';
import { ConfigurationManager } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from '../mmp/MmpStatements';
import { UProof } from '../mmp/UProof';
import { IUStatement } from '../mmp/UStatement';
import { StepSuggestion } from '../stepSuggestion/StepSuggestion';
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
					//QUI!!!
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

	constructor(textDocumentPosition: TextDocumentPositionParams, configurationManager: ConfigurationManager) {
		this.textDocumentPosition = textDocumentPosition;
		this.cursorLine = textDocumentPosition.position.line;
		this.cursorCharacter = textDocumentPosition.position.character;
		this.configurationManager = configurationManager;
	}
	/** returns the array of symbols expected from the early parser */

	// //#region getSymbols
	// private getSymbols(): string[] | undefined {
	// 	let expected: string[] | undefined;
	// 	const stepFormula: MmToken[] | undefined = this.getFormulaBeforeCursor();
	// 	if (stepFormula != undefined) {
	// 		// the step formula is present
	// 		// stepFormula = nextProofStepTokens.slice(1);
	// 		// formulaParseNode = MmpParser.tryToParse(stepFormula, this.grammar, this.workingVars, this.diagnostics);
	// 		GlobalState.mmParser.grammar.lexer = new MmLexerFromTokens(stepFormula);
	// 		let parser: Parser = new Parser(GlobalState.mmParser.grammar);
	// 		// const stepFormulaString = concatTokenValuesWithSpaces(stepFormula);
	// 		try {
	// 			// parser.feed(stepFormulaString);
	// 			// here we don't need to pass the actual formula string, because we use MmLexerFromTokens
	// 			// that returns the original tokens of the formula
	// 			parser.feed("");
	// 			if (parser.results.length === 0) {
	// 				// the formula was parsed till the end and no error was found, but at the end it
	// 				// was not a valid formula
	// 				const stepFormulaString = concatTokenValuesWithSpaces(stepFormula);
	// 				GlobalState.mmParser.grammar.lexer = new MmLexer(GlobalState.mmParser.workingVars);
	// 				parser = new Parser(GlobalState.mmParser.grammar);
	// 				parser.feed(stepFormulaString + " UnxpexcteEndOfFormula");
	// 			}
	// 			// if (parser.results.length > 1)
	// 			// 	throw new Error("Some ambiguity, let's look into it");
	// 			// parseNode = parser.results[0];
	// 		} catch (error: any) {
	// 			const message: string = error.message!;
	// 			// let range: Range = oneCharacterRange(stepFormula[stepFormula.length - 1].range.end);
	// 			// let errorCode: MmpParserErrorCode = MmpParserErrorCode.unexpectedEndOfFormula;
	// 			// expected = message.match(/(?<=A ).*(?= based on:)/g)!;
	// 			expected = message.match(/(?<=A ).*(?= based on:)/g)!.map(s => s.slice(1, s.length - 1));


	// 			// expected = message.match(/(?<=A ).*(?= based on:)/g)!.map(s => s.replace(/\s+token/i, ''));

	// 			// if (parser.current < stepFormula.length) {
	// 			// 	// the parsing error was NOT for an and UnxpexcteEndOfFormula
	// 			// 	range = stepFormula[parser.current].range;
	// 			// 	errorCode = MmpParserErrorCode.formulaSyntaxError;
	// 			// }
	// 		}
	// 	}
	// 	return expected;
	// }
	// //#endregion getSymbols


	// getCompletionItems(symbols: string[]): CompletionItem[] {
	// 	const completionItems: CompletionItem[] = [];
	// 	symbols.forEach((symbol: string) => {
	// 		const completionItem: CompletionItem = {
	// 			label: symbol,
	// 			kind: CompletionItemKind.Keyword,
	// 			data: symbol
	// 		};
	// 		completionItems.push(completionItem);
	// 	});
	// 	return completionItems;
	// }

	//#region completionItems
	async completionItems(): Promise<CompletionItem[]> {
		let completionItems: CompletionItem[] = [];
		if (GlobalState.mmParser != undefined && GlobalState.lastMmpParser != undefined) {
			const mmParser: MmParser = GlobalState.mmParser;
			const mmpParser: MmpParser = GlobalState.lastMmpParser;
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
					const syntaxCompletion = new SyntaxCompletion(cursorContext, mmParser, mmpParser);
					completionItems = syntaxCompletion.completionItems();
				}
					break;
				case CursorContextForCompletion.stepLabel: {
					// if (GlobalState.stepSuggestionMap == undefined && GlobalState.mmParser != undefined) {
					// 	const modelDataFullPath: string = GlobalState.mmFilePath + 's';
					// 	GlobalState.stepSuggestionMap = await ModelBuilder.loadSuggestionsMap(modelDataFullPath,
					// 		this.connection);
					// }
					// else {
					if (GlobalState.stepSuggestionMap != undefined) {
						// the model has already been loaded
						const stepSuggestion = new StepSuggestion(cursorContext, GlobalState.stepSuggestionMap,
							GlobalState.mmParser);
						completionItems = stepSuggestion.completionItems();
					}
				}
					break;
				default:
					break;
			}

			// const symbols: string[] | undefined = this.getSymbols();

			// if (symbols != undefined)
			// 	// the formula was not succesfully completed: symbols are the possible next symbols
			// 	completionItems = this.getCompletionItems(symbols);
		}


		return completionItems;
	}
	//#endregion completionItems
}