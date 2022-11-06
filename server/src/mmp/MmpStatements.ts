import { Position } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { MmToken } from '../grammar/MmLexer';

// export class MmpComment {
// 	comment: string
// 	constructor(comment: string) {
// 		this.comment = comment;
// 	}
// }

export class ProofStepFirstTokenInfo {
	/** the original whole token */
	firstToken: MmToken
	isEHyp: boolean
	stepRef: MmToken
	eHypRefs: MmToken[] | undefined
	//eHypRefsRanges: Range[]
	stepLabel?: MmToken
	//stepLabelRange: Range
	unparsableToken?: string // this is assigned only when the first token cannot be interpreted in its three components
	constructor(
		firstToken: MmToken,
		isEHyp: boolean,
		stepRef: MmToken,
		eHypRefs?: MmToken[],
		//eHypRefsRanges: Range[]
		stepLabel?: MmToken,
		//stepLabelRange: Range
		unparsableToken?: string) {
		this.firstToken = firstToken;
		this.isEHyp = isEHyp;
		this.stepRef = stepRef;
		this.eHypRefs = eHypRefs;
		this.stepLabel = stepLabel;
		this.unparsableToken = unparsableToken;
	}

	public get eHypRefsRange(): Range | undefined {
		let range: Range | undefined;
		let startCharacter: number | undefined;
		let endCharacter: number | undefined;
		if (this.stepRef != undefined && this.stepLabel != undefined) {
			startCharacter = this.stepRef.range.end.character + 1;
			endCharacter = this.stepLabel.range.start.character - 1;
		} else if (this.stepRef != undefined && this.stepLabel == undefined) {
			startCharacter = this.stepRef.range.end.character + 1;
			endCharacter = startCharacter + 1;
		} else if (this.stepRef == undefined && this.stepLabel != undefined) {
			startCharacter = this.stepLabel.range.start.character - 1;
			endCharacter = startCharacter + 1;
		}
		if (startCharacter != undefined) {
			const start: Position = { line: this.stepRef.range.start.line, character: startCharacter };
			const end: Position = { line: this.stepRef.range.start.line, character: <number>endCharacter };
			range = { start: start, end: end };
		}
		return range;
	}
}

