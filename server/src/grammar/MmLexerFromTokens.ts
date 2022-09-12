import { Lexer, LexerState, Token } from 'nearley';
import { MmLexerState, MmToken } from './MmLexer';

/**
 * This is a lexer for Nearly.js that uses an already computed array of tokens.
 * Thus, it will not consider the string to be passed from the Parser.parse() method.
 * This is useful to parse every formula keeping the range of each token.
 * This class will be used by the MmpParser, to build parse nodes with token ranges
 * that are exactly the same as in the original fomula.
 */
export class MmLexerFromTokens implements Lexer {
	private mmTokens: MmToken[];
	private nextTokenIndex = 0;
	constructor(mmTokens: MmToken[]) {
		this.mmTokens = mmTokens;
	}
	reset(_data: string, _state?: LexerState): void {
		this.nextTokenIndex = 0;
	}
	next(): Token | undefined {
		let mmToken: MmToken | undefined;
		if (this.nextTokenIndex < this.mmTokens.length) {
			mmToken = this.mmTokens[this.nextTokenIndex];
			this.nextTokenIndex++;
		}
		return mmToken;
	}
	save(): LexerState {
		const lexerState: MmLexerState = {
			nextTokenIndex: this.nextTokenIndex,
			mmTokens: this.mmTokens
		};
		return lexerState;
	}
	formatError(_token: Token, _message: string): string {
		return "";
	}
}