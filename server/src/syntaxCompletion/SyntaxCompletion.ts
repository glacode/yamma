import { Parser } from 'nearley';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { MmLexer, MmToken } from '../grammar/MmLexer';
import { MmLexerFromTokens } from '../grammar/MmLexerFromTokens';
import { CursorContext } from '../languageServerHandlers/OnCompletionHandler';
import { MmParser } from '../mm/MmParser';
import { concatTokenValuesWithSpaces } from '../mm/Utils';
import { MmpParser } from '../mmp/MmpParser';

export class SyntaxCompletion {

	/** the cursor context for autocompletion */
	cursorContext: CursorContext;
	mmParser: MmParser;
	mmpParser: MmpParser;

	constructor(cursorContext: CursorContext, mmParser: MmParser, mmpParser: MmpParser) {
		this.cursorContext = cursorContext;
		this.mmParser = mmParser;
		this.mmpParser = mmpParser;
	}


	//#region completionItems

	//#region getSymbols

	protected static getSymbolsFromErrorMessage(errorMessage: string): string[] {
		const symbols: string[] = errorMessage.match(/(?<=A ).*(?= based on:)/g)!.map(s => s.slice(1, s.length - 1));
		return symbols;
	}

	private getSymbols(): string[] | undefined {
		let symbols: string[] | undefined;
		// const stepFormula: MmToken[] | undefined = this.getFormulaBeforeCursor();
		const stepFormula: MmToken[] | undefined = this.cursorContext.formulaBeforeCursor();
		if (stepFormula != undefined) {
			// the step formula is present
			// stepFormula = nextProofStepTokens.slice(1);
			// formulaParseNode = MmpParser.tryToParse(stepFormula, this.grammar, this.workingVars, this.diagnostics);
			GlobalState.mmParser.grammar.lexer = new MmLexerFromTokens(stepFormula);
			let parser: Parser = new Parser(GlobalState.mmParser.grammar);
			// const stepFormulaString = concatTokenValuesWithSpaces(stepFormula);
			try {
				// parser.feed(stepFormulaString);
				// here we don't need to pass the actual formula string, because we use MmLexerFromTokens
				// that returns the original tokens of the formula
				parser.feed("");
				if (parser.results.length === 0) {
					// the formula was parsed till the end and no error was found, but at the end it
					// was not a valid formula
					const stepFormulaString = concatTokenValuesWithSpaces(stepFormula);
					GlobalState.mmParser.grammar.lexer = new MmLexer(GlobalState.mmParser.workingVars);
					parser = new Parser(GlobalState.mmParser.grammar);
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

	getCompletionItems(symbols: string[]): CompletionItem[] {
		// alreadyAddedSymbols is just used for better performance (a completionItems.includes could have been used, but it should be slower)
		const alreadyAddedSymbols: Set<string> = new Set<string>();
		const completionItems: CompletionItem[] = [];
		symbols.forEach((symbol: string) => {
			if ((this.mmParser.outermostBlock.c.has(symbol) || this.mmParser.outermostBlock.v.has(symbol)) &&
				!alreadyAddedSymbols.has(symbol)) {
				// the current symbol is actually a symbol in the theory and it has not been added to the completion list, yet
				const completionItem: CompletionItem = {
					label: symbol
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