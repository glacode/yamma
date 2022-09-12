import { Lexer, LexerState, Token } from 'nearley';
import { MmToken } from './MmLexer';

/**
 * This is a lexer for Nearly.js that uses an already computed array of strings.
 * Thus, it will not consider the string to be passed from the Parser.parse() method.
 * This is useful to parse a formula that's already been split, but token's range is not important.
 * This class will be used by the ModelBuilder, to build parse nodes for formulas on the (proof verification)
 * stack.
 */
export class MmLexerFromStringArray implements Lexer {
	private stringArray: string[];
	private nextTokenIndex = 0;
	constructor(stringArray: string[]) {
		this.stringArray = stringArray;
	}
	reset(_data: string, _state?: LexerState): void {
		this.nextTokenIndex = 0;
	}
	next(): MmToken | undefined {
		let token: MmToken | undefined;
		if (this.nextTokenIndex < this.stringArray.length) {
			const value = this.stringArray[this.nextTokenIndex];
			// with this lexer we don't care about the range, but return a MmToken anyway,
			// in order to take advantage of the GrammarManager's methods
			token = new MmToken(value,0,0);
			// token = { value: value };  this would have worked, but GrammarManager's methods expect MmToken(s), thus we return a MmToken instead
			this.nextTokenIndex++;
		}
		return token;
	}
	save(): LexerState {
		const lexerState: LexerState = {
			nextTokenIndex: this.nextTokenIndex,
			mmTokens: this.stringArray
		};
		return lexerState;
	}
	formatError(_token: Token, _message: string): string {
		return "";
	}
}