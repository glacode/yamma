import { Range } from 'vscode-languageserver';
import { MmToken } from '../grammar/MmLexer';
import { arrayRange, concatTokenValuesWithSpaces } from '../mm/Utils';
import { IMmpStatementWithRange } from './MmpStatement';

export class MmpSearchStatement implements IMmpStatementWithRange {
	public searchStatementTokens: MmToken[];

	static searchSymbolsKeyword = "SearchSymbols:"
	static searchCommentKeyword = "SearchComment:"

	symbolsToSearch: string[];

	substringsToSearchInComments: string[];

	constructor(searchStatementTokens: MmToken[]) {
		this.searchStatementTokens = searchStatementTokens;
		const searchStatementFormula: string[] = MmToken.fromTokensToStrings(searchStatementTokens);
		const searchCommentIndex: number = searchStatementFormula.indexOf(MmpSearchStatement.searchCommentKeyword);
		this.symbolsToSearch = this.getSymbolsToSearch(searchStatementFormula, searchCommentIndex);
		this.substringsToSearchInComments = this.getSubstringsForComments(searchStatementFormula, searchCommentIndex);
	}

	getSymbolsToSearch(searchStatementFormula: string[], searchCommentIndex: number): string[] {
		let lastIndexForSymbols: number = searchStatementFormula.length;
		if (searchCommentIndex != -1)
			// the SearchComment: section was present
			lastIndexForSymbols = searchCommentIndex;
		const symbolsToSearch: string[] = searchStatementFormula.slice(1, lastIndexForSymbols);
		return symbolsToSearch;
	}

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