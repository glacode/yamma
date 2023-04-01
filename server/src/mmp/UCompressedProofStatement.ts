import { Grammar } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmpProof } from './MmpProof';
import { IMmpStatement, UProofStatementStep } from './MmpStatement';
import { concatWithSpaces } from '../mm/Utils';
import { Parameters } from '../general/Parameters';
import { MmpProofStep } from "./MmpProofStep";

export class UCompressedProofStatement implements IMmpStatement {
	uProof: MmpProof;

	private _leftMargin: number;
	private _charactersPerLine: number;

	/**
	 * step labels
	 */
	labelSequence: Map<string, number>;

	//output property
	upperCaseLetterSequence: string[];


	private _proofInNormalMode: UProofStatementStep[]

	/**
	 * numbers representing the compressed proof string; every number will be translated
	 * to a sequence of upper case letters (the base 5 base 20 representation of the number);
	 * -1 will represent a 'Z' (to be inserted into the upper case string representation)
	 */
	private _numberSequence: number[];


	/** maps each label (form mandatory hyps and for step labels) to the corresponding 
	 * number in the compressed proof */
	private _mandatoryHypsLabels: Map<string, number>;

	/**
	 * used to build this._zStatements and this._zStatementsMap, it
	 * contains only the labels in the compact proof sequence (in other
	 * words, it doesn't contain labels for mandatory hyps)
	 */
	private _compactProofLabelToStatementMap: Map<string, UProofStatementStep[]>;

	private _zStatements: Set<UProofStatementStep>;
	private _zStatementsMap: Map<UProofStatementStep, UProofStatementStep>;
	private _zStatementIndex: Map<UProofStatementStep, number>;

	// constructor(uProof: UProof, outermostBlock: BlockStatement) {
	/**
	 * a statement that represents a compressed proof
	 * @param uProof 
	 * @param leftMargin the number of spaces to the left of the proof
	 * @param charactersPerLine the max text column for the proof
	 */
	constructor(uProof: MmpProof, leftMargin?: number, charactersPerLine?: number) {
		this.uProof = uProof;
		if (leftMargin != undefined)
			this._leftMargin = leftMargin;
		else
			this._leftMargin = Parameters.defaultLeftMarginForCompressedProofs;
		if (charactersPerLine != undefined)
			this._charactersPerLine = charactersPerLine;
		else
			this._charactersPerLine = Parameters.charactersPerLine;

		this.labelSequence = new Map<string, number>();
		this.upperCaseLetterSequence = [];

		this._numberSequence = [];
		this._mandatoryHypsLabels = new Map<string, number>();
		this._compactProofLabelToStatementMap = new Map<string, UProofStatementStep[]>();

		this._proofInNormalMode = <UProofStatementStep[]>this.uProof.lastMmpProofStep!.proofArray(uProof.outermostBlock);

		this._zStatements = new Set<UProofStatementStep>();
		this._zStatementsMap = new Map<UProofStatementStep, UProofStatementStep>();
		this._zStatementIndex = new Map<UProofStatementStep, number>();


		this.createCompressedProof();
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

		this._proofInNormalMode.forEach((uProofStatementStep: UProofStatementStep) => {
			const label = uProofStatementStep.label;
			if (this._mandatoryHypsLabels.get(label) == undefined && this.labelSequence.get(label) == undefined) {
				// the current label in the normal proof is not a label for a mandatory hypothesis and it
				// has not been added to the label sequence, yet
				const i = this._mandatoryHypsLabels.size + this.labelSequence.size + 1;
				this.labelSequence.set(label, i);
			}
		});
	}

	//#region createNumberSequence
	getZStatementIndex(uProofStatementStep: UProofStatementStep): number | undefined {
		let zStatementIndex: number | undefined;
		const zStatement: UProofStatementStep | undefined = this._zStatementsMap.get(uProofStatementStep);
		if (zStatement != undefined)
			// uProofStatementStep is equal to a previous step that has already been proven
			zStatementIndex = <number>this._zStatementIndex.get(zStatement);
		return zStatementIndex;
	}
	// computes the number of steps to be removed, accounting for Z references that shorten
	// the actual number of steps to be removed
	// private numberOfStepsToBeRemoved(fullNumberOfSteps: number): number {
	// 	let result = 0;
	// 	let currentIndexToCheck: number = this._numberSequence.length - 1;
	// 	while (this._numberSequence.length - 1 - fullNumberOfSteps < currentIndexToCheck) {
	// 		if (this._numberSequence[currentIndexToCheck] > this._mandatoryHypsLabels.size + this._proofInNormalMode.length) {
	// 			// the current index is for a Z reference
	// 			result += 1;
	// 		}
	// 		else {
	// 			// the current index is not for a Z reference (the full sub proof has to be removed)

	// 		}
	// 	}
	// }
	private createNumberSequence() {
		let currentLabelInReverseOrder: number = this._proofInNormalMode.length - 1;
		while (0 <= currentLabelInReverseOrder) {
			const uProofStatementStep: UProofStatementStep = this._proofInNormalMode[currentLabelInReverseOrder];
			const zStatementIndex = this.getZStatementIndex(uProofStatementStep);
			if (zStatementIndex != undefined) {
				// uProofStatementStep is equal to a previous step that has already been proven
				const numberForTheZReference = this._mandatoryHypsLabels.size + this.labelSequence.size +
					zStatementIndex;
				// const stepsToBeRemoved = uProofStatementStep.parseNode.proofArray().length - 1;
				// removeItemsFromEndOfArray(this._numberSequence, stepsToBeRemoved);
				this._numberSequence.unshift(numberForTheZReference);
				//TODO the statement below works for syntactic proofs, but you sould probably have
				// to user UProofStep.proofArray() for the general case
				currentLabelInReverseOrder -= uProofStatementStep.parseNode.proofArray(
					this.uProof.outermostBlock, <Grammar>this.uProof.outermostBlock.grammar).length;
			}
			else {
				// uProofStatementStep is different from all previous steps
				if (this._zStatements.has(uProofStatementStep))
					// uProofStatementStep is a ZStatement
					this._numberSequence.unshift(-1);
				let nextNumberInTheSequence: number | undefined =
					this._mandatoryHypsLabels.get(uProofStatementStep.label);
				if (nextNumberInTheSequence == undefined) {
					// the current label in the proof (in normal mode) is not the label for a mandatory hyp. Then it
					// must be a label in this.labelSequence
					nextNumberInTheSequence = this.labelSequence.get(uProofStatementStep.label);
				}
				this._numberSequence.unshift(<number>nextNumberInTheSequence);
				currentLabelInReverseOrder -= 1;
			}
		}
		// this._proofInNormalMode.forEach((uProofStatementStep: UProofStatementStep) => {
		// 	const zStatementIndex = this.getZStatementIndex(uProofStatementStep);
		// 	if (zStatementIndex != undefined) {
		// 		// uProofStatementStep is equal to a previous step that has already been proven
		// 		const numberForTheZReference = this._mandatoryHypsLabels.size + this.labelSequence.size +
		// 			zStatementIndex;
		// 		const stepsToBeRemoved = uProofStatementStep.parseNode.proofArray().length - 1;
		// 		removeItemsFromEndOfArray(this._numberSequence, stepsToBeRemoved);
		// 		this._numberSequence.push(numberForTheZReference);
		// 	}
		// 	else {
		// 		// uProofStatementStep is different from all previous steps
		// 		let nextNumberInTheSequence: number | undefined =
		// 			this._mandatoryHypsLabels.get(uProofStatementStep.label);
		// 		if (nextNumberInTheSequence == undefined)
		// 			// the current label in the proof (in normal mode) is not the label for a mandatory hyp. Then it
		// 			// must be a label in this.labelSequence
		// 			nextNumberInTheSequence = this.labelSequence.get(uProofStatementStep.label);
		// 		this._numberSequence.push(<number>nextNumberInTheSequence);
		// 		if (this._zStatements.has(uProofStatementStep))
		// 			// uProofStatementStep is a ZStatement
		// 			this._numberSequence.push(-1);
		// 	}

		// });
	}
	//#endregion createNumberSequence

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

	private createUpperCaseLetterSequence() {
		this._numberSequence.forEach((currentNumber: number) => {
			let currentUpperCaseLetter = ["Z"];
			if (currentNumber != -1)
				// the current number does not represent a Z statement
				currentUpperCaseLetter = this.upperCaseLettersFromNumber(currentNumber);
			this.upperCaseLetterSequence.push(...currentUpperCaseLetter);
		});
	}
	//#endregion createUpperCaseLetterSequence

	createLabelToStatementMap() {
		this._proofInNormalMode.forEach((uProofStatementStep: UProofStatementStep) => {
			const stepsWithTheSameLabel: UProofStatementStep[] | undefined =
				this._compactProofLabelToStatementMap.get(uProofStatementStep.label);
			if (stepsWithTheSameLabel == undefined) {
				// this is the first UProofStatementStep with this label
				// const newStepsSet: Set<UProofStatementStep> = new Set<UProofStatementStep>();
				// newStepsSet.add(uProofStatementStep);
				this._compactProofLabelToStatementMap.set(uProofStatementStep.label, [uProofStatementStep]);
			} else
				// there were previous UProofStatementStep(s) with this label
				stepsWithTheSameLabel.push(uProofStatementStep);
		});
	}

	//#region createZStatemens


	// it looks like metamath.exe and mmj2 don't use Z for 1 step proofs (it makes sense,
	// the spec in the metamath book doesn't make such distinction)
	private isAZStatementCandidate(uProofStatementStep: UProofStatementStep): boolean {
		const result = uProofStatementStep.parseNode.proofArray(
			this.uProof.outermostBlock, <Grammar>this.uProof.outermostBlock.grammar).length > 1;
		return result;
	}
	createZStatemens() {
		this._proofInNormalMode.forEach((uProofStatementStep: UProofStatementStep) => {
			if (this.isAZStatementCandidate(uProofStatementStep)) {
				const previousStatemenstWithTheSameLabel: UProofStatementStep[] | undefined =
					this._compactProofLabelToStatementMap.get(uProofStatementStep.label);
				if (previousStatemenstWithTheSameLabel != undefined) {
					// there are previous statements with the same label
					let i = 0;
					let foundPreviousZStatementWithEqualParseNode = false;
					while (i < previousStatemenstWithTheSameLabel.length &&
						!foundPreviousZStatementWithEqualParseNode) {
						const previousStatementStep = previousStatemenstWithTheSameLabel[i];
						if (GrammarManager.areParseNodesEqual(uProofStatementStep.parseNode, previousStatementStep.parseNode)) {
							this._zStatements.add(previousStatementStep);
							this._zStatementsMap.set(uProofStatementStep, previousStatementStep);
							foundPreviousZStatementWithEqualParseNode = true;
						}
						i++;
					}
					if (!foundPreviousZStatementWithEqualParseNode)
						// no previous statement have the same parse node
						previousStatemenstWithTheSameLabel.push(uProofStatementStep);
				} else if (this.labelSequence.has(uProofStatementStep.label)) {
					// no previous compact proof label step had the same label				
					this._compactProofLabelToStatementMap.set(uProofStatementStep.label, [uProofStatementStep]);
				}
			}
		});
	}
	//#endregion createZStatemens

	private assignZStatementsIndex() {
		this._proofInNormalMode.forEach((uProofStatementStep: UProofStatementStep) => {
			if (this._zStatements.has(uProofStatementStep) &&
				this._zStatementIndex.get(uProofStatementStep) == undefined) {
				// uProofStatementStep is a step repeated later in the proof
				// and this is the first occurence of this step
				const index = this._zStatementIndex.size + 1;
				this._zStatementIndex.set(uProofStatementStep, index);
			}
		});
	}
	//#endregion createZStatements

	createCompressedProof() {
		this.createMandatoryHypsLabels();
		this.createLabelSequence();
		// this.createLabelToStatementMap();
		this.createZStatemens();
		this.assignZStatementsIndex();
		this.createNumberSequence();
		this.createUpperCaseLetterSequence();
	}
	//#endregion createCompressedProof

	//#region toText
	get stringForLabelSequence(): string {
		const labelsArray: string[] = Array.from(this.labelSequence.keys());
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
		this.labelSequence.forEach((_value: number, label: string) => {
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

	/** plain vanilla version, with no format at all */
	toTextOld(): string {
		const text = `$= ( ${this.stringForLabelSequence} ) ${this.upperCaseLetterSequence.join('')} $.`;
		return text;
	}
	//#endregion toText
}