import { Diagnostic, Range } from 'vscode-languageserver';
import { DisjointVarMap } from '../mm/DisjointVarMap';
import { DisjVarUStatement } from '../mm/Statements';
import { ProvableStatement } from "../mm/ProvableStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { AreArrayTheSame, arrayRange, concatWithSpaces, fromTokensToStrings } from '../mm/Utils';
import { MmpParserErrorCode } from '../mmp/MmpParser';
import { MmpValidator } from '../mmp/MmpValidator';
import { ILabeledStatementSignature, ITheoremSignature } from './MmtParser';

export class TheoremCoherenceChecker {
	theorem: ITheoremSignature
	provableStatement: ProvableStatement

	/** it will contain the result of checkCoherence()  */
	isTheoremCoherent?: boolean

	diagnostics: Diagnostic[];

	defaultRangeForDiagnostics: Range

	constructor(theorem: ITheoremSignature, provableStatement: ProvableStatement, defaultRangeForDiagnostics: Range,
		diagnostics: Diagnostic[]) {
		this.theorem = theorem;
		this.provableStatement = provableStatement;
		this.defaultRangeForDiagnostics = defaultRangeForDiagnostics;
		if (diagnostics != undefined)
			this.diagnostics = diagnostics;
		else
			this.diagnostics = [];
	}
	//#region checkCoherence

	//#region checkIfDisjVarConstraintsAreIncluded

	//#region addDiagnosticForInvalidConstraint
	addDiagnosticForInvalidConstraint(var1: string, var2: string) {
		// search the DisjVarUStatement(s) where the two vars are present, in order to get
		// the tokens to compute the range for the Diagnostic.
		this.theorem.disjVarUStatements.forEach((disjVarUStatement: DisjVarUStatement) => {
			const vars: string[] = fromTokensToStrings(disjVarUStatement.disjointVars);
			const indexOfVar1: number = vars.indexOf(var1);
			if (indexOfVar1 > -1) {
				// var1 is a variable in disjVarUStatement
				const indexOfVar2: number = vars.indexOf(var2);
				if (indexOfVar2 > -1) {
					// var1 and var2 are both in disjVarUStatement
					const message = `The theorem ${this.provableStatement.Label} is already in the theory, and it does not have ` +
						`a disjoint constraint for <${var1},${var2}>, but this new version of the theorem has such constraint. It cannot ` +
						`be accepted if this constraint is not removed`;
					// this.addDiagnosticForDisjVarsTokens(disjVarUStatement.disjointVars[indexOfVar1], disjVarUStatement)
					MmpValidator.addDiagnosticError(message, disjVarUStatement.disjointVars[indexOfVar1].range,
						MmpParserErrorCode.disjVarConstraintNotInTheTheory, this.diagnostics);
					MmpValidator.addDiagnosticError(message, disjVarUStatement.disjointVars[indexOfVar2].range,
						MmpParserErrorCode.disjVarConstraintNotInTheTheory, this.diagnostics);
				}
			}
		});
	}
	//#endregion addDiagnosticForInvalidConstraint

	checkIfDisjVarConstraintsAreIncluded(disjVars: DisjointVarMap, theoryDisjVars: DisjointVarMap) {
		// const disjointVarMap: DisjointVarMap = new DisjointVarMap();
		// theoryDisjVars.forEach((disjVarUStatement: DisjVarUStatement) => {
		// 	disjointVarMap.add(disjVarUStatement.var1, disjVarUStatement.var2);
		// });
		// const theoryDisjointVarMap: DisjointVarMap = new DisjointVarMap();
		disjVars.map.forEach((vars: Set<string>, var1: string,) => {
			vars.forEach((var2: string) => {
				const isCurrentDisjConstraintValid: boolean = theoryDisjVars.containsDjContraint(var1, var2);
				this.isTheoremCoherent &&= isCurrentDisjConstraintValid;
				if (!isCurrentDisjConstraintValid)
					this.addDiagnosticForInvalidConstraint(var1, var2);
			});
		});
	}
	//#endregion checkIfDisjVarConstraintsAreIncluded

	//#region areLabeledStatementsEqual
	checkLabels(mmtStatement: ILabeledStatementSignature, theoryStatementLabel: string) {
		if (mmtStatement.label == undefined) {
			const message = `The label is missing. The expected label is ${theoryStatementLabel}`;
			//TODO check case neither label, nor formula is present and compute a good range for that case
			// you will get en exception, otherwise
			MmpValidator.addDiagnosticError(message, mmtStatement.formula![0].range, MmpParserErrorCode.eHypLabelNotCoherent,
				this.diagnostics);
			this.isTheoremCoherent = false;
		} else if (mmtStatement.label.value != theoryStatementLabel) {
			const message = `The label does not match the label in the theory. The expected label is ${theoryStatementLabel}`;
			MmpValidator.addDiagnosticError(message, mmtStatement.label.range, MmpParserErrorCode.eHypLabelNotCoherent,
				this.diagnostics);
			this.isTheoremCoherent = false;
		}
	}
	computeFormulaRange(mmtStatement: ILabeledStatementSignature): Range {
		let range: Range;
		if (mmtStatement.formula != undefined && mmtStatement.formula.length == 0 && mmtStatement.label == undefined)
			range = mmtStatement.rangeIfBothLabelAndFormulaAreEmpty!;
		else if (mmtStatement.formula != undefined && mmtStatement.formula.length > 0)
			range = arrayRange(mmtStatement.formula);
		else
			// mmtStatement.label != undefined
			range = mmtStatement.label!.range;
		return range;
	}
	checkFormulas(mmtStatement: ILabeledStatementSignature, theoryStatementFormula: string[]) {
		if (mmtStatement.formula == undefined) {
			const message =
				`The formula is missing. The expected formula is ${theoryStatementFormula}`;
			const range: Range = this.computeFormulaRange(mmtStatement);
			MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.doesntMatchTheoryFormula,
				this.diagnostics);
			this.isTheoremCoherent = false;
		} else {
			// mmtStatement.formula is defined and it is of type MmToken[]
			const mmtStatementFormulaString = fromTokensToStrings(mmtStatement.formula);
			const areFormulasEqual: boolean = AreArrayTheSame(mmtStatementFormulaString, theoryStatementFormula);
			if (!areFormulasEqual) {
				const theoryFormulaString: string = concatWithSpaces(theoryStatementFormula);
				const message =
					`The formula does not match the formula in the theory. The expected formula is '${theoryFormulaString}'`;
				const range: Range = this.computeFormulaRange(mmtStatement);
				MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.doesntMatchTheoryFormula,
					this.diagnostics);
				this.isTheoremCoherent = false;
			}
		}
	}
	private areLabeledStatementsEqual(mmtStatement: ILabeledStatementSignature | undefined,
		theoryStatement: LabeledStatement) {
		if (mmtStatement == undefined) {
			const message =
				`This theorem is already in the theory, but the label ${theoryStatement.Label}` +
				`is either missing or on the wrong hypothesis`;
			const range: Range = this.defaultRangeForDiagnostics;
			MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.eHypLabelNotCoherent,
				this.diagnostics);
			this.isTheoremCoherent = false;
		} else {
			// mmtStatement is defined
			this.checkLabels(mmtStatement, theoryStatement.Label);
			// const areLabelsEqual: boolean = (mmtStatement.label?.value == theoryStatement.Label);
			this.checkFormulas(mmtStatement, theoryStatement.formula);
			// const areEqual: boolean = areLabelsEqual && areFormulasEqual;
			// return areEqual;
		}
	}
	//#endregion areLabeledStatementsEqual

	//#region checkIfEHypsAreCoherent
	addDiagnosticForWrongNumberOfEHyps() {
		const message =
			`This theorem is already in the theory, and it has ${this.provableStatement.frame?.eHyps.length} $e hypothesis, ` +
			`but this new version of the theorem has ${this.theorem.eHyps.length} $e hypothesis. This cannot be accepted, because ` +
			`it invalidates the verification of the theory`;
		const range: Range = this.defaultRangeForDiagnostics;
		MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.wrongNumberOfEHypsForAlreadyExistingTheorem,
			this.diagnostics);
	}
	private checkIfEHypsAreCoherent() {
		this.isTheoremCoherent = this.theorem.eHyps.length == this.provableStatement.frame?.eHyps.length;
		if (this.isTheoremCoherent) {
			for (let i = 0; i < this.theorem.eHyps.length; i++)
				this.areLabeledStatementsEqual(this.theorem.eHyps[i],
					this.provableStatement.frame!.eHyps[i]);
			// isCoherent &&= AreArrayTheSame(theorem.eHyps[i].formula, provableStatement.frame!.eHyps[i].formula);
			// this.isTheoremCoherent &&= this.checkIfDisjVarConstraintsAreIncluded(
			// 	this.theorem.disjVars, this.provableStatement.frame!.disjVars);
		} else
			// this.theorem.eHyps.length != this.provableStatement.frame?.eHyps.length
			this.addDiagnosticForWrongNumberOfEHyps();
	}
	//#endregion checkIfEHypsAreCoherent


	checkIfPStatementIsCoherent() {
		if (this.theorem.pStatement == undefined) {
			const theoryFormula = concatWithSpaces(this.provableStatement.formula);
			const message =
				`This theorem is already in the theory, but the qed statement is missing. The expected ` +
				`qed formula is '${theoryFormula}'`;
			const range: Range = this.defaultRangeForDiagnostics;
			MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.missingQedStatementForAlreadyExistingTheorem,
				this.diagnostics);
			this.isTheoremCoherent = false;
		} else {
			// this.theorem.pStatement is defined
			this.checkFormulas(this.theorem.pStatement, this.provableStatement.formula);
		}
	}

	/** the theorem can be added iff either it does not exist in the theory, or
	 * it exists, but $e hyps agree and $p agrees and $d are included in those
	 * in the theory
	 */
	checkCoherence() {
		this.isTheoremCoherent = true;
		this.checkIfEHypsAreCoherent();
		this.checkIfPStatementIsCoherent();
		this.checkIfDisjVarConstraintsAreIncluded(this.theorem.disjVars, this.provableStatement.frame!.disjVars);
	}
	//#endregion checkCoherence

}

