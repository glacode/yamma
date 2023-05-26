import { Position, Range } from 'vscode-languageserver';
import { MmToken } from '../grammar/MmLexer';
import { MmpParser } from './MmpParser';
import { MmpSearchStatement } from './MmpSearchStatement';
import { MmpProofStep } from "./MmpProofStep";
import { MmpProof } from './MmpProof';
import { IMmpStatementWithRange, IMmpStatement } from './MmpStatement';

/** the cursor position determines which kind of completion is required */

export enum CursorContextForCompletion {
	firstCharacterOfAnEmptyALine = 'firstCharacterOfAnEmptyALine',
	stepFormula = 'stepFormula',
	stepLabel = 'stepLabel',
	searchStatement = 'searchStatement'
}

/** build info about the cursor context, and the proof step where the cursor is */
export class CursorContext {
	/** line of the cursor */
	cursorLine: number;
	/** column of the cursor */
	cursorCharacter: number;

	mmpParser: MmpParser;

	/** after the execution of buildContext() this property contains the cursor context for autocompletion */
	contextForCompletion?: CursorContextForCompletion;

	private _mmpStatement?: IMmpStatementWithRange;

	//#region mmpStatement
	/** sets the mmpStatement the cursor is positioned on */
	private setMmpStatement() {
		const uProof: MmpProof | undefined = this.mmpParser.mmpProof;
		if (uProof != undefined)
			this._mmpStatement = CursorContext.getMmpStatement(uProof.mmpStatements, this.cursorLine);
	}
	/** the MmpProofStep the cursor is positioned on, if any */
	get mmpStatement(): IMmpStatementWithRange | undefined {
		if (this._mmpStatement == undefined)
			this.setMmpStatement();
		return this._mmpStatement;
	}
	//#endregion mmpStatement

	constructor(cursorLine: number, cursorCharacter: number, mmpParser: MmpParser) {
		this.cursorLine = cursorLine;
		this.cursorCharacter = cursorCharacter;
		this.mmpParser = mmpParser;
	}

	/** returns the IMmpStatementWithRange at the given line (it may be a multiline proof step) */
	public static getMmpStatement(uStatements: IMmpStatement[], line: number): IMmpStatementWithRange | undefined {
		let i = 0;
		let mmpStatement: IMmpStatementWithRange | undefined;
		while (i < uStatements.length && mmpStatement == undefined) {
			if ('range' in uStatements[i]) {
				// uStatements[i] implements IMmpStatementWithRange
				const mmpStatementWithRange: IMmpStatementWithRange = <IMmpStatementWithRange>uStatements[i];
				const statementRange: Range = mmpStatementWithRange.range;
				// if (uStatements[i] instanceof MmpProofStep &&
				// 	(<MmpProofStep>uStatements[i]).startPosition.line <= line &&
				// 	line <= (<MmpProofStep>uStatements[i]).endPosition.line)
				if (statementRange != undefined && statementRange.start.line <= line && line <= statementRange.end.line)
					mmpStatement = mmpStatementWithRange;
			}
			i++;
		}
		return mmpStatement;
	}

	//#region buildContext
	//#region formulaBeforeCursor
	private isOnStepLabel(mmpProofStep: MmpProofStep): boolean {
		const firstTokenEnd: Position = mmpProofStep.firstTokenInfo.firstToken.range.end;
		const result: boolean = (firstTokenEnd.line == this.cursorLine && firstTokenEnd.character == this.cursorCharacter);
		return result;
	}

	//#region getFormulaBeforeCursorInUProofStep
	private tokenStartsBefore(formulaToken: MmToken) {
		const result: boolean = formulaToken.range.start.line < this.cursorLine ||
			(formulaToken.range.start.line == this.cursorLine && formulaToken.range.start.character <= this.cursorCharacter);
		return result;
	}
	/** returns the formula before the cursor. If there is no formula or the cursor is not in the formula, it
	 * returns undefined
	 */
	private getFormulaBeforeCursorInUProofStep(mmpProofStep: MmpProofStep): MmToken[] | undefined {
		let formulaBeforeCursor: MmToken[] | undefined;
		const formula: MmToken[] | undefined = mmpProofStep.formula;
		if (formula == undefined || formula.length == 0) {
			// the formula is empty
			const endOfFormula: MmToken = new MmToken('UnxpexcteEndOfFormula', 0, 0);
			formulaBeforeCursor = [endOfFormula];
		} else if (this.tokenStartsBefore(formula[0])) {
			formulaBeforeCursor = [];
			let i = 0;
			while (i < formula.length && this.tokenStartsBefore(formula[i])) {
				formulaBeforeCursor.push(formula[i]);
				i++;
			}
		}
		return formulaBeforeCursor;
	}
	//#endregion getFormulaBeforeCursorInUProofStep

	//TODO remove, if not used
	/** returns undefined if the cursor is not on a proof step; returns [] if the cursor is on an empty proof step formula;
	 * returns the portion of formula that preceeds the cursor (if the cursor is on a nonempty proof step formula)
	 */
	public formulaBeforeCursor(): MmToken[] | undefined {
		let formula: MmToken[] | undefined;
		const uProof: MmpProof | undefined = this.mmpParser.mmpProof;
		if (uProof != undefined) {
			const mmpStatement: IMmpStatementWithRange | undefined = this.mmpStatement;
			if (mmpStatement instanceof MmpProofStep) {
				if (this.isOnStepLabel(mmpStatement))
					//TODO
					this.contextForCompletion = CursorContextForCompletion.stepLabel;
				else {
					formula = this.getFormulaBeforeCursorInUProofStep(mmpStatement);
					//TODO this needs to be improved, now it's not checking if it's in 'free space'
					this.contextForCompletion = CursorContextForCompletion.stepFormula;
				}
			} else if (mmpStatement instanceof MmpSearchStatement) {
				this.contextForCompletion = CursorContextForCompletion.searchStatement;
			}
		}
		return formula;
	}
	//#endregion formulaBeforeCursor

	//#region isfirstCharacterOrAfterDollarSign
	private isAfterDollarSign(): boolean {
		const tokenLine = this.mmpParser.mmLexer.tokenLines[this.cursorLine];
		const result: boolean = tokenLine.length == 1 && tokenLine[0].value.startsWith('$') &&
			this.cursorCharacter <= tokenLine[0].value.length;
		return result;
	}
	private isfirstCharacterOrAfterDollarSign(): boolean {
		const result: boolean = this.cursorCharacter == 0 ||
			this.isAfterDollarSign();
		return result;
	}
	//#endregion isfirstCharacterOrAfterDollarSign


	buildContext() {
		// this.setMmpProofStep();
		// this.formulaBeforeCursor();
		const uProof: MmpProof | undefined = this.mmpParser.mmpProof;
		if (uProof != undefined) {
			const mmpStatement: IMmpStatementWithRange | undefined = this.mmpStatement;
			if (mmpStatement instanceof MmpProofStep) {
				if (this.isOnStepLabel(mmpStatement))
					//TODO
					this.contextForCompletion = CursorContextForCompletion.stepLabel;
				else {
					// formula = this.getFormulaBeforeCursorInUProofStep(mmpStatement);
					//TODO this needs to be improved, now it's not checking if it's in 'free space'
					this.contextForCompletion = CursorContextForCompletion.stepFormula;
				}
			} else if (mmpStatement instanceof MmpSearchStatement) {
				this.contextForCompletion = CursorContextForCompletion.searchStatement;
			} else if (mmpStatement == undefined && this.isfirstCharacterOrAfterDollarSign())
				this.contextForCompletion = CursorContextForCompletion.firstCharacterOfAnEmptyALine;

		}
	}
}
