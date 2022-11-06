import { Diagnostic } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { BlockStatement } from '../mm/BlockStatement';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmToken } from '../grammar/MmLexer';
import { MmpParserErrorCode } from './MmpParser';
import { MmpProofStep } from "./MmpProofStep";
import { MmpValidator } from './MmpValidator';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { LabeledStatement, AssertionStatement, EHyp } from '../mm/Statements';
import { concatWithSpaces, AreArrayTheSame } from '../mm/Utils';


//TODO remove this file (you are keeping it just to see if some specific diagnostic can
// be added in USubstitutionBuilder)

/**
 * Tries to build a susbstitution for a single MmpStatement and adds related diagnostics.
 * Similar to the USubstitutionManager, but the MmpSubstitutionManager uses MmToken's instead
 * of plain strings, because the MmpSubstitutionManager returnes Diagnostic's also
 */
export class MmpSubstitutionManager_OLD_notUsedAnymore {
	labelToStatementMap: Map<string, LabeledStatement>;
	outerBlock: BlockStatement;
	diagnostics: Diagnostic[];
	substitution: Map<string, string[]>;
	constructor(labelToStatementMap: Map<string, LabeledStatement>, outerBlock: BlockStatement, diagnostics: Diagnostic[]) {
		this.outerBlock = outerBlock;
		this.diagnostics = diagnostics;
		this.labelToStatementMap = labelToStatementMap;
		this.substitution = new Map<string, string[]>();
	}

	//#region buildSubstitutionForSingleMmpStep

	//#region buildSubstitution

	isVariable(symbol: string): boolean {
		return this.outerBlock.v.has(symbol);
	}

	isSameKind(logicalSystemVariable: string, proofStepFormulaNode: any): boolean {
		//TODO proofStepFormulaNode should be of type ParseNode, not of type any
		// if you change it, you will see that below you are just handling the case
		// proofStepFormulaNode is an InternalNode, but you should also handle the case
		// that proofStepFormulaNode is a MmToken (see USubstitutionManager.isSameKind() )
		let isSameKind = false;
		const variableKind: string = <string>this.outerBlock.varToKindMap.get(logicalSystemVariable);
		if (proofStepFormulaNode.kind === undefined) {
			const message = `Unification error. A formula of kind ${variableKind} was expected ` +
				`but "${GrammarManager.buildStringFormula(proofStepFormulaNode)}" is not of that kind.`;
			//TODO this range would probably need to be adjusted using rangeForDiagnostic
			const range: Range = proofStepFormulaNode.range;
			MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.wrongVariableKind, this.diagnostics);
		} else if (proofStepFormulaNode.kind != variableKind) {
			const message = `Unification error. A formula of kind ${variableKind} was expected ` +
				`but "${GrammarManager.buildStringFormula(proofStepFormulaNode)}" is of kind ` +
				`${proofStepFormulaNode.kind} .`;
			//TODO this range would probably need to be adjusted using rangeForDiagnostic
			const range: Range = proofStepFormulaNode.range;
			MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.wrongVariableKind, this.diagnostics);
		} else
			// proofStepFormulaNode.kind == variableKind
			isSameKind = true;
		return isSameKind;
	}

	addSubstitution(variable: string, substituteWith: string[],
		rangeForDiagnostic: Range) {
		const currentSubstitution: string[] | undefined = this.substitution.get(variable);
		if (currentSubstitution === undefined)
			this.substitution.set(variable, substituteWith);
		else if (!AreArrayTheSame(currentSubstitution, substituteWith)) {
			const message = `Unification error. The variable ${variable} should be substituted with ` +
				`  "${concatWithSpaces(<string[]>currentSubstitution)}" and with ` +
				`${concatWithSpaces(substituteWith)} .`;
			//TODO this range would probably need to be adjusted using rangeForDiagnostic
			const range: Range = rangeForDiagnostic;
			//TODO below we are not actually adding the diagnostic (see []), because it would appear
			//at the referenced statements; we instead (later in the process) add a diagnostic
			//at the assertion statement, specifically at the ref for this eHyp
			//TODO but this may be left for the assertion statement itself (see if you can manage it)
			MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.unificationError, []);
		}
	}

	buildSubstitutionForLeafNode(logicalSystemFormulaToken: MmToken,
		proofStepFormulaNode: ParseNode, rangeForDiagnostic: Range) {
		if (this.isVariable(logicalSystemFormulaToken.value)) {
			if (this.isSameKind(logicalSystemFormulaToken.value, proofStepFormulaNode)) {
				const substituteWith: string[] = GrammarManager.buildStringArray(proofStepFormulaNode);
				this.addSubstitution(logicalSystemFormulaToken.value, substituteWith,
					rangeForDiagnostic);
			}
			else {
				const formula: string = GrammarManager.buildStringFormula(proofStepFormulaNode);
				const message = `Unification error. ${logicalSystemFormulaToken.value} is a variable of kind <TODO> ` +
					`that should be unified with the formula "${formula}" , but this formula is not of kind <TODO> `;
				//TODO this range would probably need to be adjusted using rangeForDiagnostic
				const range: Range = logicalSystemFormulaToken.range;
				MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.wrongVariableKind, this.diagnostics);
			}
		} else
			// logicalSystemFormulaToken is note a variable
			if (!(proofStepFormulaNode instanceof MmToken)) {
				const message = `Unification error. Expected "${logicalSystemFormulaToken.value}" but we got ` +
					` "${GrammarManager.buildStringFormula(proofStepFormulaNode)}" `;
				//TODO this range would probably need to be adjusted using rangeForDiagnostic
				const range: Range = logicalSystemFormulaToken.range;
				MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.unificationError, this.diagnostics);
			} else
				// also proofStepFormulaNode is a MmToken
				if (logicalSystemFormulaToken.value != (<MmToken>proofStepFormulaNode).value) {
					const message = `Unification error. Expected "${logicalSystemFormulaToken.value}" but we got ` +
						` "${(<MmToken>proofStepFormulaNode).value}" `;
					//TODO this range would probably need to be adjusted using rangeForDiagnostic
					const range: Range = logicalSystemFormulaToken.range;
					MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.unificationError, this.diagnostics);
				}
	}
	//#endregion buildSubstitutionForLeafNode


	buildSubstitutionForInternalNode(logicalSystemFormulaInternalNode: InternalNode, proofStepFormulaNode: ParseNode,
		rangeForDiagnostic: Range) {
		if (proofStepFormulaNode instanceof MmToken) {
			const message = `Unification error. Expected a formula of type ${logicalSystemFormulaInternalNode.kind} but we got ` +
				` "${(<MmToken>proofStepFormulaNode).value}" `;
			//TODO this range would probably need to be adjusted using rangeForDiagnostic
			const range: Range = proofStepFormulaNode.range;
			MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.unificationError, this.diagnostics);
		} else {
			// proofStepFormulaNode is an internal node
			const proofStepFormulaInternalNode = <InternalNode>proofStepFormulaNode;
			if (logicalSystemFormulaInternalNode.kind != proofStepFormulaInternalNode.kind) {
				const message = `Unification error. A formula of kind "${logicalSystemFormulaInternalNode.kind} ` +
					` was expected, but the formula ` +
					` "${GrammarManager.buildStringFormula(proofStepFormulaInternalNode)}" has kind " ` +
					` "${proofStepFormulaInternalNode.kind}" instead.`;
				//TODO this range would probably need to be adjusted using rangeForDiagnostic
				const range: Range = rangeForDiagnostic;
				MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.unificationError, this.diagnostics);
			} else
				// logicalSystemFormulaInternalNode.kind == proofStepFormulaInternalNode.kind
				if (logicalSystemFormulaInternalNode.parseNodes.length === 1 &&
					logicalSystemFormulaInternalNode.parseNodes[0] instanceof MmToken)
					this.buildSubstitutionForLeafNode(logicalSystemFormulaInternalNode.parseNodes[0],
						proofStepFormulaNode, rangeForDiagnostic);
				else
					// logicalSystemFormulaInternalNode.parseNodes.length > 1
					if (logicalSystemFormulaInternalNode.parseNodes.length !=
						proofStepFormulaInternalNode.parseNodes.length) {
						const message = `Unification error: statement at ref <TODO> is ` +
							`'${GrammarManager.buildStringFormula(proofStepFormulaInternalNode)}' but it was expected to be ` +
							`'${GrammarManager.buildStringFormula(logicalSystemFormulaInternalNode)}'`;
						//TODO this range would probably need to be adjusted using rangeForDiagnostic
						const range: Range = rangeForDiagnostic;
						//TODO below we are not actually adding the diagnostic (see []), because it would appear
						//at the referenced statements; we instead (later in the process) add a diagnostic
						//at the assertion statement, specifically at the ref for this eHyp
						//TODO but this may be left for the assertion statement itself (see if you can manage it)
						MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.unificationError, []);
					} else
						// logicalSystemFormulaInternalNode.parseNodes.length > 1 and 
						// logicalSystemFormulaInternalNode.parseNodes.length == proofStepFormulaInternalNode.parseNodes.length
						for (let i = 0; i < logicalSystemFormulaInternalNode.parseNodes.length; i++)
							this.buildSubstitutionForParseNode(logicalSystemFormulaInternalNode.parseNodes[i],
								proofStepFormulaInternalNode.parseNodes[i], rangeForDiagnostic);

		}
	}

	buildSubstitutionForParseNode(parseNodeForLogicalSystemFormula: ParseNode,
		parseNodeForProofStepFormula: ParseNode, rangeForDiagnostic: Range) {
		// if (parseNodeForLogicalSystemFormula == undefined) {
		// 	const forBreakPoint = 3;
		// }
		if (parseNodeForLogicalSystemFormula instanceof MmToken)
			this.buildSubstitutionForLeafNode(<MmToken>parseNodeForLogicalSystemFormula,
				parseNodeForProofStepFormula, rangeForDiagnostic);
		else
			// parseNodeForLogicalSystemFormula is an InternalNode
			this.buildSubstitutionForInternalNode(<InternalNode>parseNodeForLogicalSystemFormula,
				parseNodeForProofStepFormula, rangeForDiagnostic);

	}
	//#endregion buildSubstitutionForParseNode

	buildSubstitutionForSingleFormula(
		labeledStatement: LabeledStatement,
		// logicalSystemFormula: string[],
		proofStep: MmpProofStep) {
		const proofStepFormula: MmToken[] = <MmToken[]>proofStep.stepFormula;

		// const parseNodeForLogicalSystemFormula: ParseNode =
		// 	<ParseNode>MmpParser.parseStrArray(logicalSystemFormula, grammar, workingVars);
		const parseNodeForLogicalSystemFormula: ParseNode = labeledStatement.parseNode;

		// proofStep.formulaParseNode should have been assigned by the previous syntax check
		const parseResultForProofStepFormula: ParseNode | undefined = proofStep.parseNode;
		// MmpParser.tryToParse(proofStepFormula, grammar, this.diagnostics);

		//TODO see if you can improve the range for diagnostic
		const rangeForDiagnostic: Range = proofStepFormula[0].range;
		if (parseResultForProofStepFormula !== undefined)
			// the formula was parsable with respect to the grammar and then parseResultForProofStepFormula is a ParseNode 
			this.buildSubstitutionForParseNode(parseNodeForLogicalSystemFormula, parseResultForProofStepFormula,
				rangeForDiagnostic);
	}
	//#region buildSubstitutionForEHyps
	buildSubstitutionForEHypsSameNumber(frameEHyps: EHyp[], proofStepEHyps: MmToken[], refToProofStepMap: Map<string, MmpProofStep>) {
		for (let i = 0; i < frameEHyps.length; i++) {
			const stepEHypRef = proofStepEHyps[i];
			if (stepEHypRef.value != "") {
				const referencedEHypProofStep: MmpProofStep | undefined = refToProofStepMap.get(stepEHypRef.value);
				if (referencedEHypProofStep != undefined && referencedEHypProofStep.stepFormula != undefined) {
					// this.buildSubstitutionForSingleFormula(frameEHyps[i].formula, referencedEHypProofStep,
					// 	grammar, workingVars);
					this.buildSubstitutionForSingleFormula(frameEHyps[i], referencedEHypProofStep);
				}
			}
			// TODO handle case referencedEHypProofStep.stepFormula == undefined
		}
	}
	buildSubstitutionForEHyps(frameEHyps: EHyp[], proofStep: MmpProofStep,
		refToProofStepMap: Map<string, MmpProofStep>) {
		if (proofStep.eHypRefs == undefined && frameEHyps.length > 0 ||
			proofStep.eHypRefs != undefined && proofStep.eHypRefs.length != frameEHyps.length) {
			const label: string = <string>proofStep.stepLabelToken?.value;
			const refEHyps: number = proofStep.eHypRefs == undefined ? 0 : proofStep.eHypRefs.length;
			const message = `Unification error: the assertion ${label} expects ${frameEHyps.length} ` +
				`$e hypothesis, but only ${refEHyps} are given`;
			MmpValidator.addDiagnosticError(message, <Range>proofStep.eHypRefsRange,
				MmpParserErrorCode.unificationError, this.diagnostics);
		} else if (proofStep.eHypRefs != undefined && proofStep.eHypRefs.length == frameEHyps.length)
			this.buildSubstitutionForEHypsSameNumber(frameEHyps, proofStep.eHypRefs, refToProofStepMap);
		// for (let i = 0; i < frameEHyps.length; i++) {
		// 	const eHypRef = proofStep.eHypRefs[i];
		// 	const referencedEHypProofStep: MmpProofStep | undefined = refToProofStepMap.get(eHypRef.value);
		// 	if (referencedEHypProofStep == undefined) {
		// 		// the current referenced eHyp is not a proof step
		// 		const diagnostic: Diagnostic = {
		// 			message: `This is not a reference for an existing proof step`,
		// 			range: eHypRef.range
		// 		};
		// 		this.diagnostics.push(diagnostic);
		// 		const message = `This is not a reference for an existing proof step`;
		// 		MmpValidator.addDiagnosticError(message, eHypRef.range, MmpParserErrorCode.unknownStepRef, this.diagnostics);
		// 	} else if (referencedEHypProofStep.stepFormula != undefined) {
		// 		this.buildSubstitutionForSingleFormula(frameEHyps[i].formula, referencedEHypProofStep,
		// 			grammar);
		// 	}
		// 	// TODO handle case referencedEHypProofStep.stepFormula == undefined
		// }
	}
	//#endregion buildSubstitutionForEHyps

	//#region  addDiagnisticsForSubstitution
	static applySubstitution(formula: string[], substitution: Map<string, string[]>): string[] {
		let result: string[] = [];
		formula.forEach(symbol => {
			let symbolSubstitution = [symbol];
			// TODO sotto, invece di usare substitution.get(symbol) fai un metodo apposta che usa anche
			// una nuova classe WorkingVars e genera i vari &W1 , &C1 e &X1
			const substituteWith: string[] | undefined = substitution.get(symbol);
			if (substituteWith != undefined)
				symbolSubstitution = substituteWith;
			result = result.concat(symbolSubstitution);
		});
		return result;
	}

	//#region addDiagnisticsForSubstitutionInEHyps
	addDiagnisticsForSubstitutionInEHyp(frameEHyp: EHyp, referencedEHypProofStep: MmpProofStep, range: Range) {
		const expectedFormula: string[] =
			MmpSubstitutionManager_OLD_notUsedAnymore.applySubstitution(frameEHyp.formula, this.substitution);
		const referencedFormula: MmToken[] | undefined = referencedEHypProofStep.stepFormula;
		if (referencedFormula != undefined) {
			const strArrReferencedFormula: string[] = MmToken.fromTokensToStrings(referencedFormula);
			if (!AreArrayTheSame(strArrReferencedFormula, expectedFormula)) {
				const strExpectedFormula = concatWithSpaces(expectedFormula);
				const strReferencedFormula = concatWithSpaces(strArrReferencedFormula);
				const message = `Unification error: referenced statement is '${strReferencedFormula}' but it was expected ` +
					`to be '${strExpectedFormula}'`;
				MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.unificationError, this.diagnostics);
			}
		}
	}
	addDiagnisticsForSubstitutionInEHyps(frameEHyps: EHyp[], proofStep: MmpProofStep,
		refToProofStepMap: Map<string, MmpProofStep>) {
		if (proofStep.eHypRefs != undefined && proofStep.eHypRefs.length == frameEHyps.length) {
			for (let i = 0; i < frameEHyps.length; i++) {
				const referencedEHypProofStep: MmpProofStep | undefined =
					refToProofStepMap.get(proofStep.eHypRefs[i].value);
				if (referencedEHypProofStep != undefined)
					this.addDiagnisticsForSubstitutionInEHyp(
						frameEHyps[i], referencedEHypProofStep, proofStep.eHypRefs[i].range);
			}
		}
	}
	addDiagnisticsForAssertion(assertionStatement: AssertionStatement, proofStep: MmpProofStep) {
		const expectedFormula: string[] =
			MmpSubstitutionManager_OLD_notUsedAnymore.applySubstitution(assertionStatement.formula, this.substitution);
		const proofStepFormula: MmToken[] | undefined = proofStep.stepFormula;
		if (proofStepFormula != undefined) {
			const strArrProofStepFormula: string[] = MmToken.fromTokensToStrings(proofStepFormula);
			if (!AreArrayTheSame(strArrProofStepFormula, expectedFormula)) {
				const strExpectedFormula = concatWithSpaces(expectedFormula);
				const strProofStepFormula = concatWithSpaces(strArrProofStepFormula);
				const message = `Unification error: statement is '${strProofStepFormula}' but it was expected ` +
					`to be '${strExpectedFormula}'`;
				MmpValidator.addDiagnosticError(message, (<MmToken>proofStep.stepLabelToken).range,
					MmpParserErrorCode.unificationError, this.diagnostics);
			}
		}
	}
	addDiagnisticsForSubstitution(frameEHyps: EHyp[], assertionStatement: AssertionStatement,
		proofStep: MmpProofStep, refToProofStepMap: Map<string, MmpProofStep>) {
		this.addDiagnisticsForAssertion(assertionStatement, proofStep);
		this.addDiagnisticsForSubstitutionInEHyps(frameEHyps, proofStep, refToProofStepMap);
	}
	//#endregion addDiagnisticsForSubstitutionInEHyps

	//#endregion addDiagnisticsForSubstitution
	checkUnificationForAssertion(assertionStatement: AssertionStatement, proofStep: MmpProofStep,
		refToProofStepMap: Map<string, MmpProofStep>) {
		const frameEHyps: EHyp[] = <EHyp[]>assertionStatement.frame?.eHyps;
		if (proofStep.stepFormula != undefined && proofStep.parseNode != undefined)
			// this.buildSubstitutionForSingleFormula(assertionStatement.formula, proofStep, grammar, workingVars);
			this.buildSubstitutionForSingleFormula(assertionStatement, proofStep);
		this.buildSubstitutionForEHyps(frameEHyps, proofStep, refToProofStepMap);
		// const substitution: Map<string, string[]> = new Map<string, string[]>();
		this.addDiagnisticsForSubstitution(frameEHyps, assertionStatement, proofStep, refToProofStepMap);
	}
	//#endregion buildSubstitution

	// buildSubstitutionForStepWithLabel(proofStep: MmpProofStep, grammar: Grammar,
	// 	refToProofStepMap: Map<string, MmpProofStep>) {
	// 	// const textEditArray: TextEdit[] = [];
	// 	// herewe are sure that proofStep.stepLabel is defined
	// 	const stepLabel: MmToken = <MmToken>proofStep.stepLabel;
	// 	const labeledStatement: LabeledStatement | undefined =
	// 		this.labelToStatementMap.get(stepLabel.value);
	// 	if (labeledStatement === undefined) {
	// 		const message = `Label ${proofStep.stepLabel} doesn't exist in the logical system`;
	// 		MmpValidator.addDiagnosticError(message, stepLabel.range, MmpParserErrorCode.unknownLabel, this.diagnostics);
	// 	} else if (!(labeledStatement instanceof AssertionStatement)) {
	// 		const message = `Label ${proofStep.stepLabel} is not a label for an Assertion`;
	// 		MmpValidator.addDiagnosticError(message, stepLabel.range, MmpParserErrorCode.notAnAssertion, this.diagnostics);
	// 	} else {
	// 		// labeledStatement instanceof AssertionStatement
	// 		this.buildSubstitutionForAssertion(labeledStatement, proofStep, grammar, refToProofStepMap);
	// 	}
	// }
	//#region addDiagnisticsForSubstitution
	// addDiagnosticsForEHyps(proofStep: MmpProofStep, grammar: Grammar, refToProofStepMap: Map<string, MmpProofStep>) {
	// 	array.forEach(element => {

	// 	});
	// 	throw new Error('Method not implemented.');
	// }
	// addDiagnisticsForSubstitution(proofStep: MmpProofStep, grammar: Grammar, refToProofStepMap: Map<string, MmpProofStep>) {
	// 	this.addDiagnosticsForEHyps(proofStep, grammar, refToProofStepMap);
	// 	this.addDiagnisticsForAssertion(proofStep, grammar, refToProofStepMap);
	// }
	//#endregion
	checkUnificationForSingleMmpStep(proofStep: MmpProofStep, refToProofStepMap: Map<string, MmpProofStep>) {
		if (proofStep.stepLabel != undefined) {
			const stepLabelToken: MmToken = <MmToken>proofStep.stepLabelToken;
			const labeledStatement: LabeledStatement | undefined =
				this.labelToStatementMap.get(stepLabelToken.value);
			// if (labeledStatement === undefined) {
			// 	const message = `Label ${proofStep.stepLabel} doesn't exist in the logical system`;
			// 	MmpValidator.addDiagnosticError(message, stepLabelToken.range, MmpParserErrorCode.unknownLabel, this.diagnostics);
			// } else if (!(labeledStatement instanceof AssertionStatement)) {
			// 	const message = `Label ${proofStep.stepLabel} is not a label for an Assertion`;
			// 	MmpValidator.addDiagnosticError(message, stepLabelToken.range, MmpParserErrorCode.notAnAssertion, this.diagnostics);
			// } else {
			if (labeledStatement instanceof AssertionStatement) {
				// labeledStatement instanceof AssertionStatement
				this.checkUnificationForAssertion(labeledStatement, proofStep, refToProofStepMap);
			}
			// this.buildSubstitutionForStepWithLabel(proofStep, grammar, refToProofStepMap);

		}
	}
	//#endregion buildSubstitutionForSingleMmpStep
}