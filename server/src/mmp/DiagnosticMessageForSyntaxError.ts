import { SyntaxCompletion } from '../syntaxCompletion/SyntaxCompletion';

export interface IDiagnosticMessageForSyntaxError {
	diagnosticMessage(earlyParserErrorMessage: string): string;
}

export class VerboseDiagnosticMessageForSyntaxError implements IDiagnosticMessageForSyntaxError {
	diagnosticMessage(earlyParserErrorMessage: string): string {
		return earlyParserErrorMessage;
	}
}

export class ShortDiagnosticMessageForSyntaxError implements IDiagnosticMessageForSyntaxError {
	constructor(private theoryConstants: Set<string>, private theoryVariables: Set<string>,
		private maxNumberOfSymbolsDisplayed: number) {
	}

	//#region diagnosticMessageForSyntaxError

	//#region diagnosticMessageFromSymbols
	//#region getFirstPartOfTheMessage
	getSubstringEndPosition(earlyParserErrorMessage: string): number {
		const substringToSearchFor = "one of the following:";
		const substringStartPosition: number = earlyParserErrorMessage.indexOf(substringToSearchFor);
		const substringEndPosition: number = substringStartPosition + substringToSearchFor.length;
		return substringEndPosition;
	}
	getFirstPartOfTheMessage(earlyParserErrorMessage: string): string {
		const substringEndPosition: number = this.getSubstringEndPosition(earlyParserErrorMessage);
		// below, we use 1 to remove the starting \n character
		const firstPart: string = earlyParserErrorMessage.substring(1, substringEndPosition);
		return firstPart;
	}
	//#endregion getFirstPartOfTheMessage
	getListOfExpectedSymbols(expectedSymbols: string[]): string {
		let diagnosticMessage = '';
		const alreadyAddedSymbols: Set<string> = new Set<string>();
		let i = 0;
		while (i < expectedSymbols.length && i <= this.maxNumberOfSymbolsDisplayed) {
			const nextSymbol = expectedSymbols[i];
			if (this.theoryConstants.has(nextSymbol) || this.theoryVariables.has(nextSymbol) &&
				!alreadyAddedSymbols.has(nextSymbol)) {
				diagnosticMessage += ' ' + nextSymbol;
				alreadyAddedSymbols.add(nextSymbol);
			}
			i++;
		}
		if (i < expectedSymbols.length)
			// there are more expectedSymbols than this.maxNumberOfSymbolsDisplayed
			diagnosticMessage += '...<more>';
		return diagnosticMessage;
	}
	diagnosticMessageFromSymbols(earlyParserErrorMessage: string, expectedSymbols: string[]): string {
		const firstPartOfTheMessage: string = this.getFirstPartOfTheMessage(earlyParserErrorMessage);
		const listOfExpectedSymbols: string = this.getListOfExpectedSymbols(expectedSymbols);
		const diagnosticMessage = firstPartOfTheMessage + listOfExpectedSymbols;
		return diagnosticMessage;
	}
	//#endregion diagnosticMessageFromSymbols
	diagnosticMessage(earlyParserErrorMessage: string): string {
		const expectedSymbols: string[] = SyntaxCompletion.getSymbolsFromErrorMessage(earlyParserErrorMessage);
		const result: string = this.diagnosticMessageFromSymbols(earlyParserErrorMessage, expectedSymbols);
		return result;
	}
	//#endregion diagnosticMessageForSyntaxError
}