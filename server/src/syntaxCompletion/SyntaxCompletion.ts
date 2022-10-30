import { Parser } from 'nearley';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';

import { MmLexer, MmToken } from '../grammar/MmLexer';
import { MmLexerFromTokens } from '../grammar/MmLexerFromTokens';
import { CursorContext } from "../mmp/CursorContext";
import { MmParser } from '../mm/MmParser';
import { MmStatistics } from '../mm/MmStatistics';
import { AssertionStatement } from '../mm/Statements';
import { concatTokenValuesWithSpaces } from '../mm/Utils';
import { MmpParser } from '../mmp/MmpParser';
import { MmpStatistics } from '../mmp/MmpStatistics';

export class SyntaxCompletion {

	/** the cursor context for autocompletion */
	cursorContext: CursorContext;
	mmParser: MmParser;
	mmpParser: MmpParser;
	mmStatistics: MmStatistics;
	mmpStatistics?: MmpStatistics;

	constructor(cursorContext: CursorContext, mmParser: MmParser, mmpParser: MmpParser,
		mmStatistics: MmStatistics, mmpStatistics?: MmpStatistics) {
		this.cursorContext = cursorContext;
		this.mmParser = mmParser;
		this.mmpParser = mmpParser;
		this.mmStatistics = mmStatistics;
		this.mmpStatistics = mmpStatistics;
	}


	//#region completionItems

	//#region getSymbols

	protected static getSymbolsFromErrorMessage(errorMessage: string): string[] {
		const regExpMatchArray: RegExpMatchArray | null = errorMessage.match(/(?<=A ).*(?= based on:)/g);
		let symbols: string[] = [];
		if (regExpMatchArray != null)
			// const symbols: string[] = errorMessage.match(/(?<=A ).*(?= based on:)/g)!.map(s => s.slice(1, s.length - 1));
			symbols = regExpMatchArray.map(s => s.slice(1, s.length - 1));
		return symbols;
	}

	private getSymbols(): string[] | undefined {
		let symbols: string[] | undefined;
		// const stepFormula: MmToken[] | undefined = this.getFormulaBeforeCursor();
		const stepFormula: MmToken[] | undefined = this.cursorContext.formulaBeforeCursor();
		// if (GlobalState.mmParser != undefined && stepFormula != undefined) {
		if (this.mmParser != undefined && stepFormula != undefined) {
			// the step formula is present
			// GlobalState.mmParser.grammar.lexer = new MmLexerFromTokens(stepFormula);
			// let parser: Parser = new Parser(GlobalState.mmParser.grammar);
			this.mmParser.grammar.lexer = new MmLexerFromTokens(stepFormula);
			let parser: Parser = new Parser(this.mmParser.grammar);
			try {
				// parser.feed(stepFormulaString);
				// here we don't need to pass the actual formula string, because we use MmLexerFromTokens
				// that returns the original tokens of the formula
				parser.feed("");
				if (parser.results.length === 0) {
					// the formula was parsed till the end and no error was found, but at the end it
					// was not a valid formula
					const stepFormulaString = concatTokenValuesWithSpaces(stepFormula);
					// GlobalState.mmParser.grammar.lexer = new MmLexer(GlobalState.mmParser.workingVars);
					// parser = new Parser(GlobalState.mmParser.grammar);
					this.mmParser.grammar.lexer = new MmLexer(this.mmParser.workingVars);
					parser = new Parser(this.mmParser.grammar);
					parser.feed(stepFormulaString + " UnxpexcteEndOfFormula");
				}
				// if (parser.results.length > 1)
				// 	throw new Error("Some ambiguity, let's look into it");
				// parseNode = parser.results[0];
			} catch (error: any) {
				const message: string = error.message!;
				// let range: Range = oneCharacterRange(stepFormula[stepFormula.length - 1].range.end);
				// let errorCode: MmpParserErrorCode = MmpParserErrorCode.unexpectedEndOfFormula;
				// expected = message.match(/(?<=A ).*(?= based on:)/g)!;
				// symbols = message.match(/(?<=A ).*(?= based on:)/g)!.map(s => s.slice(1, s.length - 1));
				symbols = SyntaxCompletion.getSymbolsFromErrorMessage(message);


				// expected = message.match(/(?<=A ).*(?= based on:)/g)!.map(s => s.replace(/\s+token/i, ''));

				// if (parser.current < stepFormula.length) {
				// 	// the parsing error was NOT for an and UnxpexcteEndOfFormula
				// 	range = stepFormula[parser.current].range;
				// 	errorCode = MmpParserErrorCode.formulaSyntaxError;
				// }
			}
		}
		return symbols;
	}
	//#endregion getSymbols

	//#region getCompletionItems

	//#region sortText
	/** returns '0' if the symbol is in the current .mmp file, returns '1' otherwise */
	firstCharacterForSorting(symbol: string): string {
		let firstCharacter = '1';
		if (this.mmpStatistics?.symbols != undefined) {
			const isInCurrentMmpFile: boolean = this.mmpStatistics.symbols.has(symbol);
			if (isInCurrentMmpFile)
			firstCharacter = '0';
		}
		return firstCharacter;
	}
	sortingByPopularity(symbol: string): string {
		const assertions: Set<AssertionStatement> | undefined = this.mmStatistics.symbolToAssertionMap!.get(symbol)!;
		const defaultOrder = 99999;
		let size = defaultOrder;
		if (assertions != undefined)
			// a set of assertions has been found, for the given symbol
			size = defaultOrder - assertions.size;
		const result: string = String(size).padStart(5, '0');
		return result;
	}
	/** symbols already in the current .mmp file are listed first; then are
	 * sorted by popularity in the whole theory
	 */
	private sortText(symbol: string): string | undefined {
		const firstCharacterForSorting: string = this.firstCharacterForSorting(symbol);
		const sortingByPopularity: string = this.sortingByPopularity(symbol);
		// const assertions: Set<AssertionStatement> | undefined = this.mmStatistics.symbolToAssertionMap!.get(symbol)!;
		// const defaultOrder = 99999;
		// let size = defaultOrder;
		// if (assertions != undefined)
		// 	// a set of assertions has been found, for the given symbol
		// 	size = defaultOrder - assertions.size;
		// const result: string = String(size).padStart(5, '0');
		const result = firstCharacterForSorting + sortingByPopularity;
		return result;
	}
	//#endregion sortText

	getCompletionItems(symbols: string[]): CompletionItem[] {
		// alreadyAddedSymbols is just used for better performance (a completionItems.includes could have been used, but it should be slower)
		const alreadyAddedSymbols: Set<string> = new Set<string>();
		const completionItems: CompletionItem[] = [];
		symbols.forEach((symbol: string) => {
			if ((this.mmParser.outermostBlock.c.has(symbol) || this.mmParser.outermostBlock.v.has(symbol)) &&
				!alreadyAddedSymbols.has(symbol)) {
				// the current symbol is actually a symbol in the theory and it has not been added to the completion list, yet
				const completionItem: CompletionItem = {
					label: symbol,
					sortText: this.sortText(symbol),
					// detail: this.sortText(symbol)
					//TODO search how to remove the icon from the completion list
					// kind: CompletionItemKind.Keyword
					// data: symbol
				};
				completionItems.push(completionItem);
				alreadyAddedSymbols.add(symbol);
			}
		}
		);
		return completionItems;
	}
	//#endregion getCompletionItems

	completionItems(): CompletionItem[] {
		let completionItems: CompletionItem[] = [
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
		const symbols: string[] | undefined = this.getSymbols();

		if (symbols != undefined)
			// the formula was not succesfully completed: symbols are the possible next symbols
			completionItems = this.getCompletionItems(symbols);


		return completionItems;
	}
	//#endregion completionItems
}