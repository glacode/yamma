import { Range } from 'vscode-languageserver';
import { MmToken } from '../grammar/MmLexer';
import { arrayRange, concatTokenValuesWithSpaces, normalizedFormula } from '../mm/Utils';
import { IMmpStatementWithRange } from './MmpStatement';

export class MmpSearchStatement implements IMmpStatementWithRange {
	public searchStatementTokens: MmToken[];

	static searchSymbolsKeyword = "SearchSymbols:"
	static searchCommentKeyword = "SearchComment:"

	symbolsToSearch: string[];

	normalizedSubstringsToSearch: string[]

	substringsToSearchInComments: string[];

	constructor(searchStatementTokens: MmToken[]) {
		this.searchStatementTokens = searchStatementTokens;
		const searchStatementFormula: string[] = MmToken.fromTokensToStrings(searchStatementTokens);
		const searchCommentIndex: number = searchStatementFormula.indexOf(MmpSearchStatement.searchCommentKeyword);
		this.symbolsToSearch = this.getSymbolsToSearch(searchStatementFormula, searchCommentIndex);
		this.normalizedSubstringsToSearch = this.getNormalizedSubstringsToSearch(searchStatementFormula);
		this.substringsToSearchInComments = this.getSubstringsForComments(searchStatementFormula, searchCommentIndex);
	}
	getSymbolsToSearch(searchStatementFormula: string[], searchCommentIndex: number): string[] {
		let lastIndexForSymbols: number = searchStatementFormula.length;
		if (searchCommentIndex != -1)
			// the SearchComment: section was present
			lastIndexForSymbols = searchCommentIndex;
		let symbolsToSearch: string[] = searchStatementFormula.slice(1, lastIndexForSymbols);
		symbolsToSearch = symbolsToSearch.filter((symbol: string) => symbol != "'");
		return symbolsToSearch;
	}

	//#region getNormalizedSubstringsToSearch
	private getIndexesForStringDelimiter(searchStatementFormula: string[]): number[] {
		const indexesForStringDelimiter: number[] = [];
		let index = -2;
		while (index != -1) {
			const fromIndex: number = (index < 0) ? 0 : index + 1;
			index = searchStatementFormula.indexOf("'", fromIndex);
			if (index != -1)
				// another delimiter has been found
				indexesForStringDelimiter.push(index);
		}
		return indexesForStringDelimiter;
	}

	//#region getNormalizedSubstringsFromDelimeterIndexes

	//#region getNormalizedSubstring
	getSubarrayOfSymbols(searchStatementFormula: string[], indexesForStringDelimiter: number[], delimiterIndex: number): string[] {
		let subarrayOfSymbols: string[];
		if (delimiterIndex + 1 < indexesForStringDelimiter.length)
			// there is a closing delimeter, for the current subarray to search
			subarrayOfSymbols = searchStatementFormula.slice(
				indexesForStringDelimiter[delimiterIndex] + 1, indexesForStringDelimiter[delimiterIndex + 1]);
		else
			// there is no closing delimeter, for the current delimeter (in other words,
			// there is a odd number of delimeters)
			subarrayOfSymbols = searchStatementFormula.slice(
				indexesForStringDelimiter[delimiterIndex] + 1);
		return subarrayOfSymbols;
	}
	getNormalizedSubstring(searchStatementFormula: string[], indexesForStringDelimiter: number[],
		delimiterIndex: number): string {
		const subarrayOfSymbols: string[] = this.getSubarrayOfSymbols(
			searchStatementFormula, indexesForStringDelimiter, delimiterIndex);

		const normalizedSubstring: string = normalizedFormula(subarrayOfSymbols);
		return normalizedSubstring;
	}
	//#endregion getNormalizedSubstring

	getNormalizedSubstringsFromDelimeterIndexes(searchStatementFormula: string[],
		indexesForStringDelimiter: number[]): string[] {
		const normalizedSubstringsFromDelimeterIndexes: string[] = [];
		for (let i = 0; i < indexesForStringDelimiter.length; i += 2) {
			const normalizedSubstring: string = this.getNormalizedSubstring(
				searchStatementFormula, indexesForStringDelimiter, i);

			normalizedSubstringsFromDelimeterIndexes.push(normalizedSubstring);
		}
		return normalizedSubstringsFromDelimeterIndexes;
	}
	//#endregion getNormalizedSubstringsFromDelimeterIndexes

	/** returns an array of normalized strings to search; such strings are delimited by ' characters;
	 * if the delimiters are in odd number, the substring from the last delimeter to the end of
	 * the search string is considered to be an additional string to search
	 */
	private getNormalizedSubstringsToSearch(searchStatementFormula: string[]): string[] {
		const indexesForStringDelimiter: number[] = this.getIndexesForStringDelimiter(searchStatementFormula);
		const normalizedSubstringsToSearch: string[] = this.getNormalizedSubstringsFromDelimeterIndexes(
			searchStatementFormula, indexesForStringDelimiter);
		return normalizedSubstringsToSearch;
	}
	//#endregion getNormalizedSubstringsToSearch


	getSubstringsForComments(searchStatementFormula: string[], searchCommentIndex: number): string[] {
		let substringsForComments: string[] = [];
		if (searchCommentIndex != -1)
			// the SearchComment: section was present
			substringsForComments = searchStatementFormula.slice(searchCommentIndex + 1);
		return substringsForComments;
	}

	get range(): Range {
		const range: Range = arrayRange(this.searchStatementTokens);
		return range;
	}

	toText(): string {
		const text: string = concatTokenValuesWithSpaces(this.searchStatementTokens);
		return text;
	}
}