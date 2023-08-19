import { Parameters } from '../../general/Parameters';
import { concatWithSpaces } from '../../mm/Utils';
import { MmpProof } from '../MmpProof';
import { MmpProofStep } from '../MmpProofStep';
import { IMmpStatement, UProofStatementStep } from '../MmpStatement';
import { RpnStep } from '../RPNstep';
import { CreateLabelMapArgs, ILabelMapCreatorForCompressedProof } from './MmpCompressedProofCreator';
import { MmpFifoLabelMapCreator } from './MmpFifoLabelMapCreator';
import { MmpPackedProofStatement } from './MmpPackedProofStatement';



export class MmpCompressedProofStatementFromPackedProof implements IMmpStatement {
	uProof: MmpProof;

	private _leftMargin: number;
	private _charactersPerLine: number;

	private _labelSequenceCreator: ILabelMapCreatorForCompressedProof;

	private _mmpPackedProofStatement: MmpPackedProofStatement;


	/**
	 * step labels
	 */
	labelMap: Map<string, number>;

	//output property
	upperCaseLetterSequence: string[];


	private _proofInNormalMode: UProofStatementStep[]


	/** maps each label (form mandatory hyps and for step labels) to the corresponding 
	 * number in the compressed proof */
	private _mandatoryHypsLabels: Map<string, number>;

	// constructor(uProof: UProof, outermostBlock: BlockStatement) {
	/**
	 * a statement that represents a compressed proof
	 * @param uProof 
	 * @param leftMargin the number of spaces to the left of the proof
	 * @param charactersPerLine the max text column for the proof
	 */
	constructor(uProof: MmpProof, leftMargin?: number, charactersPerLine?: number,
		labelSequenceCreator?: ILabelMapCreatorForCompressedProof) {
		this.uProof = uProof;
		if (leftMargin != undefined)
			this._leftMargin = leftMargin;
		else
			this._leftMargin = Parameters.defaultLeftMarginForCompressedProofs;
		if (charactersPerLine != undefined)
			this._charactersPerLine = charactersPerLine;
		else
			this._charactersPerLine = Parameters.charactersPerLine;
		this._labelSequenceCreator = this.setLabelSequenceCreator(labelSequenceCreator);

		this.labelMap = new Map<string, number>();
		this.upperCaseLetterSequence = [];

		// this._numberSequence = [];
		this._mandatoryHypsLabels = new Map<string, number>();

		//TODO1 18 AUG 2023 this step is slow and is probably not needed (it can be replaced by inspection of this._mmpPackedProofStatement)
		// see if you can remove it
		this._proofInNormalMode = <UProofStatementStep[]>this.uProof.lastMmpProofStep!.proofArray(uProof.outermostBlock);

		this._mmpPackedProofStatement = new MmpPackedProofStatement(this.uProof, 80);

		this.createCompressedProof();
	}
	setLabelSequenceCreator(labelSequenceCreator: ILabelMapCreatorForCompressedProof | undefined): ILabelMapCreatorForCompressedProof {
		if (labelSequenceCreator != undefined)
			// the caller provided a ILabelSequenceCreator
			this._labelSequenceCreator = labelSequenceCreator;
		else
			// the caller did NOT provide a ILabelSequenceCreator
			// we use the FIFO as the default ILabelSequenceCreator
			this._labelSequenceCreator = new MmpFifoLabelMapCreator();
		return this._labelSequenceCreator;
	}

	//#region createCompressedProof

	//#region createMandatoryHypsLabels
	private addMandatoryHypLabel(label: string) {
		const i = this._mandatoryHypsLabels.size + 1;
		this._mandatoryHypsLabels.set(label, i);
	}

	//this is assumed to be invoked by createCompressedProof() and then every eHyp is expected to
	//have a label and a parse node
	private createMandatoryHypsLabels() {
		const mandatoryFHypsLabelsInRPNorder: Set<string> = this.uProof.mandatoryFHypsLabelsInRPNorder;
		mandatoryFHypsLabelsInRPNorder.forEach((label: string) => {
			this.addMandatoryHypLabel(label);
		});
		this.uProof.mmpStatements.forEach((uStatement: IMmpStatement) => {
			if (uStatement instanceof MmpProofStep && uStatement.isEHyp)
				this.addMandatoryHypLabel(uStatement.stepLabel!);
		});
	}
	//#endregion createMandatoryHypsLabels

	private createLabelSequence() {
		const createLabelMapArgs: CreateLabelMapArgs = {
			mandatoryHypsLabels: new Set(this._mandatoryHypsLabels.keys()),
			proofInNormalMode: this._proofInNormalMode,
			mmpPackedProofStatement: this._mmpPackedProofStatement
		};
		this.labelMap = this._labelSequenceCreator.createLabelMap(createLabelMapArgs);
	}

	//#region createUpperCaseLetterSequence

	//#region upperCaseLettersFromNumber

	protected base5base20representation(givenNumber: number): number[] {
		const result: number[] = [];
		const leastSignificantDigit: number = (givenNumber % 20 == 0 ? 20 : givenNumber % 20);
		result.push(leastSignificantDigit);
		let num: number = Math.floor((givenNumber - leastSignificantDigit) / 20);
		// const exp = 1;
		while (num > 0) {
			// const divider: number = Math.pow(20, exp);
			const digit: number = (num % 5 == 0 ? 5 : num % 5);
			result.push(digit);
			num = Math.floor((num - digit) / 5);
		}
		return result.reverse();
	}

	//TODO1 6 AUG 2023 this method is duplicated, build a single one
	protected upperCaseLettersFromNumber(givenNumber: number): string[] {
		const upperCaseLetters: string[] = [];

		const base5base20representation: number[] = this.base5base20representation(givenNumber);
		for (let i = 0; i < base5base20representation.length - 1; i++) {
			const num: number = base5base20representation[i];
			// 85 is the ascii value for 'U'
			const upperCaseLetter = String.fromCharCode(84 + num);
			upperCaseLetters.push(upperCaseLetter);
		}
		// 65 is the ascii value for 'A'
		const letterForLeastSignificantDigit = String.fromCharCode(64 + base5base20representation[base5base20representation.length - 1]);
		upperCaseLetters[base5base20representation.length - 1] = letterForLeastSignificantDigit;
		return upperCaseLetters;
	}
	//#endregion upperCaseLettersFromNumber

	//#region getUpperCaseLettersForThisStep
	getCurrentNumber(rpnStep: RpnStep): number {
		const label: string = rpnStep.labelForCompressedProof;
		let currentNumber: number | undefined;
		if (rpnStep.backRef != undefined)
			// this is a backRef step
			currentNumber = this._mandatoryHypsLabels.size + this.labelMap.size +
				rpnStep.backRef.markedStepNumber!;
		else {
			// this is NOT backRef step
			currentNumber = this._mandatoryHypsLabels.get(label);
			if (currentNumber == undefined)
				// this is NOT backRef step and the current label is not for a mandatory Hyp
				currentNumber = this._mandatoryHypsLabels.size +
					this.labelMap.get(label)!;
		}
		return currentNumber!;
	}
	getUpperCaseLettersForThisStep(rpnStep: RpnStep): string[] {
		const currentNumber: number = this.getCurrentNumber(rpnStep);
		const currentUpperCaseLetters: string[] = this.upperCaseLettersFromNumber(currentNumber!);
		if (rpnStep.isMarkedStep)
			currentUpperCaseLetters.push('Z');
		return currentUpperCaseLetters;
	}
	//#endregion getUpperCaseLettersForThisStep

	private createUpperCaseLetterSequence() {
		this._mmpPackedProofStatement.packedProof.forEach((rpnStep: RpnStep) => {
			const upperCaseLettersForThisStep: string[] = this.getUpperCaseLettersForThisStep(rpnStep);
			this.upperCaseLetterSequence.push(...upperCaseLettersForThisStep);
		});
	}
	//#endregion createUpperCaseLetterSequence


	createCompressedProof() {
		this.createMandatoryHypsLabels();
		this.createLabelSequence();
		// this.createNumberSequence();
		this.createUpperCaseLetterSequence();
	}
	//#endregion createCompressedProof

	//#region toText
	get stringForLabelSequence(): string {
		const labelsArray: string[] = Array.from(this.labelMap.keys());
		const result = concatWithSpaces(labelsArray);
		return result;
	}

	// in .mmp file we have to add left padding, from the second row on, to signal
	// it is a single statement; in .mmt files, instead, all rows in the proof
	// have the same left alignment
	computeLeftPaddingForTheSecondRow(): number {
		const leftPadding: number = this._leftMargin == 0 ? 3 : this._leftMargin;
		return leftPadding;
	}

	private addLabels(currentRow: string, text: string[]): string {
		// let currentRow: string = text[0];
		this.labelMap.forEach((_value: number, label: string) => {
			if (currentRow.length + label.length + 1 <= this._charactersPerLine)
				// the current label can be added to the current row
				currentRow += ' ' + label;
			else {
				// the current label must be moved to a new row
				text[0] += currentRow + '\n';
				const leftPadding: number = this.computeLeftPaddingForTheSecondRow();
				currentRow = ' '.repeat(leftPadding) + label;
			}
		});
		if (currentRow.length < this._charactersPerLine - 3) {
			// the close parenthesis can be added to the current row
			currentRow += ' ) ';
			// text[0]+= currentRow;
		} else if (currentRow.length == this._charactersPerLine - 3)
			// the close parenthesis is exactly at the end of the line
			currentRow += ' )\n';
		else {
			// currentRow.length > this._rightMargin - 3
			// the close parenthesis must be moved to a new row
			text[0] += currentRow + '\n';
			const leftPadding: number = this.computeLeftPaddingForTheSecondRow();
			currentRow = ' '.repeat(leftPadding) + ') ';
		}
		return currentRow;
	}

	addUpperCaseLetterSequenceAnd(currentRow: string, text: string[]): string {
		this.upperCaseLetterSequence.forEach((upperCaseLetter: string) => {
			if (currentRow.length < this._charactersPerLine)
				currentRow += upperCaseLetter;
			else {
				// upperCaseLetter mus be moved to a new line
				text[0] += currentRow + '\n';
				const leftPadding: number = this.computeLeftPaddingForTheSecondRow();
				currentRow = ' '.repeat(leftPadding) + upperCaseLetter;
			}
		});
		text[0] += currentRow;
		return currentRow;
	}

	toText(): string {
		// an array (with a single element) is used, so that it can be passed as in
		// input/output parameter
		const text: string[] = [''];  // we want an empty line, before the proof
		let lastRow: string = ' '.repeat(this._leftMargin) + '$= (';
		if (this._leftMargin > 0)
			// we should be in a .mmt file and the $= is on the $p formula line
			lastRow = ' '.repeat(this._leftMargin) + '(';
		lastRow = this.addLabels(lastRow, text);
		lastRow = this.addUpperCaseLetterSequenceAnd(lastRow, text);
		if (lastRow.length > this._charactersPerLine - 3)
			text[0] += '\n$.';
		else
			text[0] += ' $.';
		return text[0];
	}
	//#endregion toText
}