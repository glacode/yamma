import { Position } from 'vscode-languageserver';
import { MmToken } from '../grammar/MmLexer';
import { MmpParser } from './MmpParser';
import { MmpProofStep } from './MmpStatements';
import { UProof } from './UProof';
import { IUStatement } from './UStatement';
import { CursorContextForCompletion } from '../languageServerHandlers/OnCompletionHandler';

/** build info about the cursor context, and the proof step where the cursor is */

export class CursorContext {
	/** line of the cursor */
	cursorLine: number;
	/** column of the cursor */
	cursorCharacter: number;

	mmpParser: MmpParser;

	/** after the execution of buildContext() this property contains the cursor context for autocompletion */
	contextForCompletion?: CursorContextForCompletion;

	/** the MmpProofStep the cursor is positioned on, if any */
	mmpProofStep: MmpProofStep | undefined;

	constructor(cursorLine: number, cursorCharacter: number, mmpParser: MmpParser) {
		this.cursorLine = cursorLine;
		this.cursorCharacter = cursorCharacter;
		this.mmpParser = mmpParser;
	}

	//#region buildContext
	//#region setMmpProofStep
	private getMmpProofStep(uStatements: IUStatement[]): MmpProofStep | undefined {
		let i = 0;
		let uProofStep: MmpProofStep | undefined;
		while (i < uStatements.length && uProofStep == undefined) {
			if (uStatements[i] instanceof MmpProofStep &&
				(<MmpProofStep>uStatements[i]).startPosition.line <= this.cursorLine &&
				this.cursorLine <= (<MmpProofStep>uStatements[i]).endPosition.line)
				uProofStep = <MmpProofStep>uStatements[i];
			i++;
		}
		return uProofStep;
	}

	/** sets the MmpProofStep the cursor is positioned on */
	private setMmpProofStep() {
		const uProof: UProof | undefined = this.mmpParser.uProof;
		if (uProof != undefined)
			this.mmpProofStep = this.getMmpProofStep(uProof.uStatements);
	}
	//#endregion setMmpProofStep
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
	/** returns undefined if the cursor is not on a proof step; returns [] if the cursor is on an empty proof step formula;
	 * returns the portion of formula that preceeds the cursor (if the cursor is on a nonempty proof step formula)
	 */
	public formulaBeforeCursor(): MmToken[] | undefined {
		let formula: MmToken[] | undefined;
		const uProof: UProof | undefined = this.mmpParser.uProof;
		if (uProof != undefined) {
			const uProofStep: MmpProofStep | undefined = this.getMmpProofStep(uProof.uStatements);
			if (uProofStep != undefined) {
				if (this.isOnStepLabel(uProofStep))
					//TODO
					this.contextForCompletion = CursorContextForCompletion.stepLabel;
				else {
					formula = this.getFormulaBeforeCursorInUProofStep(uProofStep);
					//TODO this needs to be improved, now it's not checking if it's in 'free space'
					this.contextForCompletion = CursorContextForCompletion.stepFormula;
				}
			}
		}
		return formula;
	}
	//#endregion formulaBeforeCursor
	buildContext() {
		this.setMmpProofStep();
		this.formulaBeforeCursor();
	}
}
