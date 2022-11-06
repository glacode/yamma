

import { Parameters } from '../general/Parameters';
import { GrammarManager } from '../grammar/GrammarManager';
import { concatTokenValuesWithSpaces } from '../mm/Utils';
import { MmpProofStep } from './MmpProofStep';
import { UProof } from './UProof';
import { IUStatement } from './UStatement';

export class UProofFormatter {
	uProof: UProof;
	constructor(uProof: UProof) {
		this.uProof = uProof;
	}

	//#region toText

	//#region computeIndentationLevels
	private updateIndentationLevel(uProofStep: MmpProofStep, currentLevel: number) {
		if (uProofStep.indentationLevel == undefined || uProofStep.indentationLevel < currentLevel) {
			// this proof step has not been assigned an indentation level, yet
			uProofStep.indentationLevel = currentLevel;
			uProofStep.eHypUSteps.forEach((eHypUStep: MmpProofStep | undefined) => {
				if (eHypUStep instanceof MmpProofStep)
					this.updateIndentationLevel(eHypUStep, currentLevel + 1);
			});
		}
	}

	protected computeIndentationLevels() {
		for (let i = this.uProof.uStatements.length - 1; i >= 0; i--) {
			const uStatement = this.uProof.uStatements[i];
			if (uStatement instanceof MmpProofStep)
				this.updateIndentationLevel(uStatement, 0);
		}
		// this.uProof.uStatements.forEach((uStatement: IUStatement) => {
		// 	if (uStatement instanceof UProofStep)
		// 		this.updateIndentationLevel(uStatement, 0);
		// });
	}
	//#endregion 

	//#region textForUProofStep
	getTextForFormula(uProofStep: MmpProofStep): string {
		let textForFormula = '';
		if (uProofStep.parseNode != undefined)
			textForFormula = GrammarManager.buildStringFormula(uProofStep.parseNode!);
		else
			// this.parseNode == undefined
			if (uProofStep.stepFormula != undefined)
				// uProofStep.parseNode == undefined && uProofStep.stepFormula != undefined
				textForFormula = concatTokenValuesWithSpaces(uProofStep.stepFormula!);
		return textForFormula;
	}

	private textForUProofStep(uProofStep: MmpProofStep): string {
		const textForFirstTokenInfo: string = uProofStep.textForFirstTokenInfo();
		let text: string = textForFirstTokenInfo;
		const formulaStartingColumn: number = Parameters.startCharForIndentedMmpFormula + uProofStep.indentationLevel!;
		let spacePadding: number;
		if (textForFirstTokenInfo.length >= Parameters.startCharForIndentedMmpFormula - 1) {
			// the text of the first token info is long, the formula will be displayed on a new line
			text += '\n';
			spacePadding = formulaStartingColumn - 1;
		} else
			// the text of the first token info is short, the formula will be displayed on the same line
			spacePadding = formulaStartingColumn - 1 - textForFirstTokenInfo.length;
		const textFormula: string = this.getTextForFormula(uProofStep);
		text += ' '.repeat(spacePadding) + textFormula;


		// const textForFirstTokenInfo = this.textForFirstTokenInfo();
		// let textForFormula = "";
		// if (this.parseNode != undefined)
		// 	textForFormula = GrammarManager.buildStringFormula(this.parseNode!);
		// else
		// 	// this.parseNode == undefined
		// 	if (this.stepFormula != undefined)
		// 		// this.parseNode == undefined && this.stepFormula != undefined
		// 		textForFormula = concatTokenValuesWithSpaces(this.stepFormula!);
		// const text: string = textForFirstTokenInfo + " " + textForFormula;
		return text;
	}
	//#endregion textForUProofStep

	textWithIndentedProof() {
		this.computeIndentationLevels();
		let text = "";
		this.uProof.uStatements.forEach((uStatement: IUStatement) => {
			let uStatementText: string;
			if (uStatement instanceof MmpProofStep)
				uStatementText = this.textForUProofStep(uStatement);
			else {
				uStatementText = uStatement.toText();
				if (uStatement == this.uProof.mainComment )
					uStatementText = `\n${uStatementText}\n`;
			}
			text = text + uStatementText + "\n";
		});
		return text;
	}
}