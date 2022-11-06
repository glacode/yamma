import { Position } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { MmToken } from '../grammar/MmLexer';
import { InternalNode } from '../grammar/ParseNode';
import { UProof } from './UProof';
import { UProofStep } from './UProofStep';
import { IMmpStatementWithRange } from './UStatement';
import { concatTokenValuesWithSeparator } from '../mm/Utils';
import { ProofStepFirstTokenInfo } from './MmpStatements';


export class MmpProofStep extends UProofStep implements IMmpStatementWithRange {
	firstTokenInfo: ProofStepFirstTokenInfo;
	// isEHyp: boolean;
	stepRefToken: MmToken;
	// eHypRefs?: MmToken[]
	// eHypRefsRanges: Range[]
	stepLabelToken?: MmToken;
	// stepLabelRange: Range
	// stepFormula?: MmToken[]
	// parseNode?: InternalNode   // contains the ParseNode for the fomula, iff the formula nonempty and it is parsable
	// mmpTokenizer: MmpTokenizer
	// indexOfFirstToken: number
	// indexOfLastToken: number
	constructor(uProof: UProof,
		firstTokenInfo: ProofStepFirstTokenInfo,
		isFirstTokenParsable: boolean, isEHyp: boolean, stepRefToken: MmToken, eHypRefs?: MmToken[],
		eHypMmpSteps?: (MmpProofStep | undefined)[],
		// eHypRefsRanges: Range[],
		stepLabelToken?: MmToken,
		// stepLabelRange: Range,
		stepFormula?: MmToken[],
		// mmpTokenizer: MmpTokenizer, indexOfFirstToken: number, indexOfLastToken: number
		formulaParseNode?: InternalNode
	) {
		//TODO most of this properties are a duplication of UProofStep properties, try to remove them
		const actualEHypMmpSteps: (MmpProofStep | undefined)[] = (eHypMmpSteps == undefined ? [] : eHypMmpSteps);
		super(uProof, isFirstTokenParsable, isEHyp, stepRefToken?.value, actualEHypMmpSteps,
			// eHypRefs, stepLabelToken?.value, stepFormula, formulaParseNode);
			eHypRefs, stepLabelToken, stepFormula, formulaParseNode);
		this.firstTokenInfo = firstTokenInfo;
		// this.isEHyp = isEHyp;
		this.stepRefToken = stepRefToken;
		this.stepRef = stepRefToken.value;
		// this.eHypRefs = eHypRefs;
		// this.stepLabel = stepLabelToken?.value;
		this.stepLabelToken = stepLabelToken;
		// this.stepFormula = stepFormula;
		// this.parseNode = formulaParseNode;
	}


	//TODO now that you are also passing firstTokenInfo, you can also use firstTokenInfo.firstToken.range.start	
	public get startPosition() {
		let start: Position = { line: 0, character: 0 };
		if (this.stepRefToken != undefined)
			start = this.stepRefToken.range.start;
		else if (this.eHypRefs != undefined && this.eHypRefs.length > 0)
			start = this.eHypRefs[0].range.start;
		else if (this.stepLabelToken != undefined)
			start = this.stepLabelToken.range.start;
		else if (this.stepFormula != undefined)
			start = this.stepFormula[0].range.start;
		return start;
	}

	public get endPosition() {
		let end: Position = { line: 0, character: 0 };
		if (this.stepFormula != undefined && this.stepFormula.length > 0)
			end = this.stepFormula[this.stepFormula.length - 1].range.end;











		// else if (this.stepLabelToken != undefined)
		// 	end = this.stepLabelToken.range.end;
		// else if (this.eHypRefs != undefined && this.eHypRefs.length > 0)
		// 	end = this.eHypRefs[this.eHypRefs.length - 1].range.end;
		// else if (this.stepRefToken != undefined) {
		// 	end = this.stepRefToken.range.end;
		// 	if (this.stepRefToken.value == '')
		// 		// there should be just a ':' on the line
		// 		end.character += 2;
		// }
		else
			end = this.firstTokenInfo.firstToken.range.end;
		return end;
	}

	/**
	 * returns the range of the whole proof step
	 */
	public get range() {
		const start: Position = this.startPosition;
		const end: Position = this.endPosition;
		const range: Range = {
			start: start,
			end: end
		};
		return range;
	}

	//#region eHypRefsRange
	public get eHypRefsRange(): Range | undefined {
		let range: Range | undefined;
		let startCharacter: number | undefined;
		let endCharacter: number | undefined;
		if (this.stepRefToken != undefined && this.stepLabelToken != undefined) {
			startCharacter = this.stepRefToken.range.end.character + 1;
			endCharacter = this.stepLabelToken.range.start.character - 1;
		} else if (this.stepRefToken != undefined && this.stepLabel == undefined) {
			startCharacter = this.stepRefToken.range.end.character + 1;
			endCharacter = startCharacter + 1;
		} else if (this.stepRefToken == undefined && this.stepLabelToken != undefined) {
			startCharacter = this.stepLabelToken.range.start.character - 1;
			endCharacter = startCharacter + 1;
		}
		if (startCharacter != undefined) {
			const start: Position = { line: this.range.start.line, character: startCharacter };
			const end: Position = { line: this.range.start.line, character: <number>endCharacter };
			range = { start: start, end: end };
		}
		return range;
	}
	//#endregion eHypRefsRange
	public get firstTokenInfoToString(): string {
		let result = "";
		if (this.stepRefToken != undefined)
			result += this.stepRefToken.value;
		result += ":";
		if (this.eHypRefs != undefined)
			result += concatTokenValuesWithSeparator(this.eHypRefs, ',');
		result += ":";
		if (this.stepLabelToken != undefined)
			result += this.stepLabelToken.value;
		return result;
	}
}
