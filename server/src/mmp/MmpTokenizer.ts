import { splitWithPosition } from '../mm/Utils';

export class MmpTokenizer {
	tokens: string[] = []
	tokenRow: number[] = []
	tokenColumn: number[] = []

	constructor(textToTokenize: string) {
		const textLines: string[] = textToTokenize.split("\n");
		const regExp = /[^\s]+/g;
		let splitResult: { subStrings: string[], positions: number[] };
		for (let i = 0; i < textLines.length; i++) {
			splitResult = splitWithPosition(textLines[i], regExp);
			this.tokens.push(...splitResult.subStrings);
			this.tokenColumn.push(...splitResult.positions);
			this.tokenRow.push(...Array(this.tokens.length).fill(i));
		}
	}
}