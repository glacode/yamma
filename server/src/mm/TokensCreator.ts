import { MmToken } from '../grammar/MmLexer';
import { splitToTokensDefaultInLine } from './Utils';
import * as fs from 'fs';
import * as path from 'path';

export class TokensCreator {
	// lines_buf: string[]   // TODO remove, slow method
	// tokens: MmToken[]
	private imported_files: Set<string>
	private isInAComment = false

	constructor() {
		// this.lines_buf = readLines;
		this.imported_files = new Set();


		// const dateTime = new Date();
		// console.log("inizio prova" + dateTime);
		// this.tokens = this.provaSplit();
		// this._lastComment = [];

		// console.log("fine prova");
	}

	private addTokensFromIncludedFile(includedFileName: string, tokens: MmToken[], includingFileFullPath?: string) {
		if (!this.imported_files.has(includedFileName) && includingFileFullPath) {
			const parsedPath = {...path.parse(includingFileFullPath), base: includedFileName};
			const includedFileFullPath: string = path.format(parsedPath);
			const tokensCreator: TokensCreator = new TokensCreator();
			tokensCreator.addTokensFromFile(includedFileFullPath, tokens);
			this.imported_files.add(includedFileName);
		}
	}

	createTokensFromLine(line: string, lineNumber: number, tokens: MmToken[], fileFullPath?: string) {
		// const lineTokens = splitToTokensDefault(line);
		const lineTokens: MmToken[] = splitToTokensDefaultInLine(line, lineNumber);
		let i = 0;
		while (i < lineTokens.length) {
			if (!this.isInAComment && lineTokens[i].value === '$[' && lineTokens[i + 2].value === '$]') {
				// here I'm assuming that the include statement is on a single line
				// The spec does not say that, I may improve this in the future
				this.addTokensFromIncludedFile(lineTokens[i + 1].value, tokens, fileFullPath);
				i += 3;
			} else {
				if ( lineTokens[i].value === '$(' || lineTokens[i].value === '$)' )
					this.isInAComment = !this.isInAComment;
				lineTokens[i].filePath = fileFullPath;
				tokens.push(lineTokens[i]);
				i++;
			}
		}
	}

	private addTokensFromLines(lines: string[], tokens: MmToken[], fileFullPath?: string): MmToken[] {
		// this.lines_buf = readLines;
		for (let i = 0; i < lines.length; i++) {
			this.createTokensFromLine(lines[i], i, tokens, fileFullPath);
		}
		// this.tokens = this.provaSplit();
		return tokens;
	}

	addTokensFromText(text: string, tokens: MmToken[], fileFullPath?: string): MmToken[] {
		this.isInAComment = false;
		const lines: string[] = text.split('\n');
		this.addTokensFromLines(lines, tokens, fileFullPath);
		return tokens;
	}

	createTokensFromText(text: string, fileFullPath?: string): MmToken[] {
		this.isInAComment = false;
		const lines: string[] = text.split('\n');
		const tokens: MmToken[] = this.addTokensFromLines(lines, [], fileFullPath);
		return tokens;
	}

	addTokensFromFile(fileFullPath: string, tokens: MmToken[]): MmToken[] {
		this.isInAComment = false;
		const text: string = fs.readFileSync(fileFullPath, 'utf-8');
		this.addTokensFromText(text, tokens, fileFullPath);
		return tokens;
	}

	createTokensFromFile(fileFullPath: string): MmToken[] {
		this.isInAComment = false;
		this.imported_files.add(fileFullPath);
		const text: string = fs.readFileSync(fileFullPath, 'utf-8');
		const tokens: MmToken[] = this.createTokensFromText(text, fileFullPath);
		return tokens;
	}
}