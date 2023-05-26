import { splitToTokens } from '../mm/Utils';
import { WorkingVars } from "../mmp/WorkingVars";
import { Lexer, LexerState, Token } from "nearley";
import { Range } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver';

// export type MmToken {
// 	value: string;
// 	line: number;
// 	column: number; // starting column
// 	range: Range = {
// 		start: { line: line}
// 	};
//   // starting column
// }

export class MmToken {
	value: string;
	line: number;
	column: number; // starting column
	// type is a string only when working vars are parsed, in a .mmp file; it contains
	// the kind of the string; it is used by Nearly.js to "understand" that the
	// token can be parsed as substring of this type
	type: string | undefined;

	public get range(): Range {
		const start: Position = { line: this.line, character: this.column };

		// the Language Server documentation says that "the end position is exclusive"
		const end: Position = { line: this.line, character: this.column + this.value.length };

		const range: Range = { start: start, end: end };
		return range;
	}

	constructor(value: string, line: number, column: number, type?: string) {
		this.value = value;
		this.line = line;
		this.column = column;
		this.type = type;
	}

	containsTokenValue(value: string): boolean {
		return this.value == value;
	}


	clone(): MmToken {
		throw new Error('Method not implemented.');
	}

	static joinValues(tokens: MmToken[], separator: string): string {
		let result = "";
		for (let i = 0; i < tokens.length; i++) {
			result = result.concat(tokens[i].value);
			if (i < tokens.length - 1)
				// the current token is not the last one
				result = result.concat(separator);
		}
		return result;
	}

	static fromTokensToStrings(tokens: MmToken[]): string[] {
		const result: string[] = [];
		tokens.forEach(token => {
			result.push(token.value);
		});
		return result;
	}
}

export interface MmLexerState extends LexerState {
	mmTokens: MmToken[];
	nextTokenIndex: number;

}

export class MmLexer implements Lexer {
	tokens: MmToken[] = []
	// tokenRow: number[] = []
	// tokenColumn: number[] = []
	tokenLines: MmToken[][] = []
	textToTokenize = ""
	nextTokenIndex = 0;
	workingVars: WorkingVars;

	constructor(workingVars: WorkingVars) {
		this.workingVars = workingVars;
	}

	reset(data: string, state?: MmLexerState): void {
		if (state != undefined) {
			this.tokens = state.mmTokens;
			this.nextTokenIndex = state.nextTokenIndex;
		} else {
			this.textToTokenize = data;
			const textLines: string[] = this.textToTokenize.split("\n");
			const regExp = /[^\s]+/g;
			// let splitResult: MmToken[]
			for (let i = 0; i < textLines.length; i++) {
				const tokensForCurrentLine = splitToTokens(textLines[i], regExp, i, 0);
				this.tokenLines.push(tokensForCurrentLine);
				this.tokens = this.tokens.concat(tokensForCurrentLine);
			}
			this.nextTokenIndex = 0;
		}
	}

	//#region next
	next(): MmToken | undefined {
		let token: MmToken | undefined;
		if (this.nextTokenIndex < this.tokens.length) {
			token = this.tokens[this.nextTokenIndex++];
			token.type = this.workingVars.tokenType(token.value);
			// token.type = this.tokenType(token.value);
		}
		return token;
	}
	//#endregion next

	/** returns the next token, without advancing the index */
	current(): MmToken | undefined {
		let token: MmToken | undefined;
		if (this.nextTokenIndex < this.tokens.length) {
			token = this.tokens[this.nextTokenIndex];
		}
		return token;
	}

	save(): LexerState {
		const lexerState: MmLexerState = {
			nextTokenIndex: this.nextTokenIndex,
			mmTokens: this.tokens
		};
		return lexerState;
	}
	formatError(_token: Token, _message: string): string {
		return "";
	}
}