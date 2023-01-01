import { Grammar, Parser } from 'nearley';
import { Diagnostic, Position, Range } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
import { MmLexer, MmToken } from '../grammar/MmLexer';
import { ProofStepFirstTokenInfo } from './MmpStatements';
import { MmpProofStep } from "./MmpProofStep";
import { MmpValidator } from './MmpValidator';
import { ProvableStatement } from "../mm/ProvableStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement } from "../mm/AssertionStatement";
import { range, oneCharacterRange, concatTokenValuesWithSpaces, concatWithSpaces, splitToTokensAllowingForEmptyValues, AreArrayTheSame, rebuildOriginalStringFromTokens } from '../mm/Utils';
import { WorkingVars } from './WorkingVars';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { IUStatement, UComment, TextForProofStatement, UTheoremLabel } from './UStatement';
import { MmpProof } from './UProof';
import { SubstitutionResult, USubstitutionBuilder } from './USubstitutionBuilder';
import { USubstitutionApplier } from './USubstitutionApplier';
import { GrammarManager } from '../grammar/GrammarManager';
import { OrderedPairOfNodes, UnificationAlgorithmState, WorkingVarsUnifierFinder } from './WorkingVarsUnifierFinder';
import { WorkingVarsUnifierInitializer } from './WorkingVarsUnifierInitializer';
import { DisjointVarsManager } from '../mm/DisjointVarsManager';
import { MmLexerFromTokens } from '../grammar/MmLexerFromTokens';
import { TheoremCoherenceChecker } from '../mmt/TeoremCoherenceChecker';
import { MmpSearchStatement } from './MmpSearchStatement';
import { EHyp } from '../mm/EHyp';
import { MmParser } from '../mm/MmParser';



export enum MmpParserErrorCode {
	unexpectedEndOfFormula = "unexpectedEndOfFormula",
	formulaSyntaxError = "formulaSyntaxError",
	firstTokenWithMoreThanTwoColumns = "gt2colon",
	stepRefCannotContainAComma = "comma",
	unknownLabel = "unknownLabel",
	unificationError = "unificationError",
	workingVarUnificationError = "workingVarUnificationError",
	refStatementUnificationError = "refStatementUnificationError",
	wrongNumberOfEHyps = "wrongNumberOfEHyps",
	wrongVariableKind = "wrongVariableKind",
	notAnAssertion = "notAnAssertion",
	unknownStepRef = "unknownStepRef",
	djVarsRestrictionViolated = "djVarsRestrictionViolated",
	disjVarSyntaxError = "disjVarSyntaxError",
	eHypLabelNotCoherent = "eHypLabelNotCoherent",
	missingQedStatementForAlreadyExistingTheorem = "missingQedStatement",
	doesntMatchTheoryFormula = "doesntMatchTheoryFormula",
	disjVarConstraintNotInTheTheory = "disjVarConstraintNotInTheTheory",
	wrongNumberOfEHypsForAlreadyExistingTheorem = "wrongNumberOfEHypsForAlreadyExistingTheorem"
}


export enum MmpParserWarningCode {
	missingLabel = "missingLabel",
	missingFormula = "missingFormula",
	missingRef = "missingRef",
	missingEHyps = "missingEHyps",
	missingDjVarsStatement = "missingDjVarsStatement",
	missingTheoremLabel = "missingTheoremLabel"
}

// Parser for .mmp files
export class MmpParser {

	textToParse: string;
	mmParser: MmParser;
	labelToStatementMap: Map<string, LabeledStatement>;
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	/** when Parse() is invoked, it will contain the raw tokens produced by the MmLexer */
	mmTokens: MmToken[] | undefined;

	private _orderedPairsOfNodesForMGUalgorithm: OrderedPairOfNodes[];


	// static proofEHyps(mmpTokenizer: MmpTokenizer): EHyp[] {
	// 	throw new Error('Method not implemented.');
	// }
	// textDocument: TextDocument
	// mmParser: MmParser
	// mmpStatements: MmpStatement[] = []
	refToProofStepMap: Map<string, MmpProofStep>;  // maps each proof step id to the proof step
	diagnostics: Diagnostic[] = [] // diagnostics built while parsing
	uProof: MmpProof | undefined;

	//#region constructor
	// constructor(textToParse: string, labelToStatementMap: Map<string, LabeledStatement>,
	// 	outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars) {
	constructor(textToParse: string, mmParser: MmParser, workingVars: WorkingVars) {
		// this.textDocument = textDocument;
		this.textToParse = textToParse;
		this.mmParser = mmParser;
		this.labelToStatementMap = mmParser.labelToStatementMap;
		this.outermostBlock = mmParser.outermostBlock;
		this.grammar = mmParser.grammar;
		this.workingVars = workingVars;

		// this.mmParser = mmParser;
		this.refToProofStepMap = new Map<string, MmpProofStep>();
		// const textToParse: string = textDocument.getText();
		//this.createMmpStatements(textToParse);
		this._orderedPairsOfNodesForMGUalgorithm = [];
	}

	private addDiagnosticError(message: string, range: Range, code: MmpParserErrorCode) {
		MmpValidator.addDiagnosticError(message, range, code, this.diagnostics);
	}

	private addDiagnosticWarning(message: string, range: Range, code: MmpParserWarningCode) {
		MmpValidator.addDiagnosticWarning(message, range, code, this.diagnostics);
	}

	//#region  createProofSteps

	//#region createNextMmpStatement

	//#region createMmpStatementFromStepTokens

	//#region proofStepFirstTokenInfo
	static hypRefRanges(hypRefs: string[], currentRow: number, positions: number[]): Range[] {
		const hypRefRanges: Range[] = [];
		for (let i = 0; i < hypRefs.length; i++) {
			const hypRefRange: Range = range(hypRefs[i], currentRow, positions[i]);
			hypRefRanges.push(hypRefRange);
		}
		return hypRefRanges;
	}

	proofStepFirstTokenInfo(firstToken: MmToken): ProofStepFirstTokenInfo {
		const stringToParse = firstToken.value;

		// const firstTokenSplit = splitToTokens(firstToken.value, /[^:]+/g, firstToken.line, firstToken.column);
		// const stepLabel: MmToken | undefined = firstTokenSplit[firstTokenSplit.length - 1];
		let isEHyp = false;
		let stepRef: MmToken;
		// let hypRefs: MmToken[] = [];
		let hypRefs: MmToken[] | undefined;
		let stepLabel: MmToken | undefined;
		let unparsableToken: string | undefined;

		const firstColon: number = stringToParse.indexOf(":");
		if (firstColon === -1) {
			// there is no colon
			stepRef = new MmToken("", firstToken.line, firstToken.column);
			stepLabel = new MmToken(stringToParse, firstToken.line, firstToken.column);
		}
		else {
			// there is at least one colon
			// if (firstColon > 0) {
			// 	// the first colon is not the first character in the string to parse
			isEHyp = stringToParse.slice(0, firstColon).startsWith('h') ? true : false;
			const refIndexStart: number = isEHyp ? 1 : 0;
			stepRef = new MmToken(stringToParse.slice(refIndexStart, firstColon), firstToken.line, firstToken.column);
			if (stepRef.value.indexOf(",") != -1) {
				// the step ref contains a comm
				const message = "The ref cannot contain a comma";
				const range: Range = stepRef.range;
				const code = MmpParserErrorCode.stepRefCannotContainAComma;
				this.addDiagnosticError(message, range, code);
			}
			// }
			const secondColon: number = stringToParse.indexOf(":", firstColon + 1);
			if (secondColon === -1) {
				// there is only one colon
				if (firstColon < stringToParse.length - 1)
					// the only one colon is not the last character of the string to parse
					stepLabel = new MmToken(stringToParse.slice(firstColon + 1), firstToken.line, firstColon + 1);
			}
			else {
				// there are at least two colons
				const thirdColon: number = stringToParse.indexOf(":", secondColon + 1);
				if (thirdColon === -1) {
					// there are exactly two colons (the "standard" case)
					if (firstColon < secondColon) {
						// there is a nonempty substring between the first colon and the second colon
						const hypRefsSubstring: string = stringToParse.slice(firstColon + 1, secondColon);
						// hypRefs = splitToTokens(hypRefsSubstring, /[^,]+/g, firstToken.line, firstColon + 1);
						hypRefs = splitToTokensAllowingForEmptyValues(hypRefsSubstring, ",", firstToken.line, firstColon + 1);
					}
					if (secondColon < stringToParse.length - 1)
						// the second colon is not the last character of the string to parse
						stepLabel = new MmToken(stringToParse.slice(secondColon + 1), firstToken.line, secondColon + 1);
				} else {
					// there are more than two colons
					const message = "The first token can contain, at most, 2 colons";
					const range: Range = firstToken.range;
					const code = MmpParserErrorCode.firstTokenWithMoreThanTwoColumns;
					this.addDiagnosticError(message, range, code);
					unparsableToken = firstToken.value;
				}
			}
		}

		const firstTokenInfo: ProofStepFirstTokenInfo = new ProofStepFirstTokenInfo(
			firstToken, isEHyp, stepRef, hypRefs, stepLabel, unparsableToken);
		// , stepLabelRange: stepLabelRange
		return firstTokenInfo;
	}
	//#endregion proofStepFirstTokenInfo

	addTheoremLabel(nextProofStepTokens: MmToken[]) {
		let uTheoremLabel: UTheoremLabel | undefined;
		if (nextProofStepTokens.length == 1) {
			// the theorem label is missing
			const message = `The theorem label is missing`;
			const range: Range = oneCharacterRange(nextProofStepTokens[0].range.end);
			MmpValidator.addDiagnosticWarning(message, range,
				MmpParserWarningCode.missingTheoremLabel, this.diagnostics);
			uTheoremLabel = new UTheoremLabel(nextProofStepTokens[0]);
		} else
			// the second token is the theorem label
			uTheoremLabel = new UTheoremLabel(nextProofStepTokens[0], nextProofStepTokens[1]);
		this.uProof?.addUStatement(uTheoremLabel);
	}

	addComment(nextProofStepTokens: MmToken[]) {
		// const commentContent: string = MmToken.joinValues(nextProofStepTokens.slice(1), " ");
		const commentContent: string = rebuildOriginalStringFromTokens(nextProofStepTokens);
		const comment: UComment = new UComment(nextProofStepTokens, commentContent);
		// this.mmpStatements.push(comment);
		this.uProof?.addUStatement(comment);
	}

	addSearchStatement(searchStatementTokens: MmToken[]) {
		const mmpSearchStatement: MmpSearchStatement = new MmpSearchStatement(searchStatementTokens);
		this.uProof?.addUStatement(mmpSearchStatement);
	}

	addProofStep(proofStep: MmpProofStep) {
		this.uProof?.addUProofStepFromMmpStep(proofStep);
		// this.mmpStatements.push(proofStep);
		if (proofStep.stepRefToken != undefined) {
			this.refToProofStepMap.set(proofStep.stepRefToken.value, proofStep);
		}
		// TODO handle case for proofStep.stepRef == undefined
		if (proofStep.formula != undefined) {
			const normalizedFormula: string = concatTokenValuesWithSpaces(proofStep.formula!);
			const proofStatementIndex: number = this.uProof!.uStatements.length - 1;
			this.uProof?.formulaToProofStepMap.set(normalizedFormula, proofStatementIndex);
		}
	}

	addDiagnosticForLabelAndEHypRefs(firstTokenEndPosition: Position, proofStepFirstTokenInfo: ProofStepFirstTokenInfo) {
		if (proofStepFirstTokenInfo.stepLabel === undefined) {
			const message = "Missing label";
			const range: Range = oneCharacterRange(firstTokenEndPosition);
			const code = MmpParserWarningCode.missingLabel;
			this.addDiagnosticWarning(message, range, code);
		} else if (!proofStepFirstTokenInfo.isEHyp) {
			const labeledStatement: LabeledStatement | undefined =
				this.labelToStatementMap.get(proofStepFirstTokenInfo.stepLabel.value);
			if (labeledStatement == undefined) {
				const message = `Unknown label: this label does not exist in the logical system`;
				// const range: Range = proofStepFirstTokenInfo.stepLabel.range;
				// const code = MmpParserErrorCode.unknownLabel;
				// this.addDiagnosticError(message, range, code);
				MmpValidator.addDiagnosticError(message, proofStepFirstTokenInfo.stepLabel.range,
					MmpParserErrorCode.unknownLabel, this.diagnostics);
			} else if (!(labeledStatement instanceof AssertionStatement)) {
				const message = `This is is not a label for an Assertion in the logical system`;
				MmpValidator.addDiagnosticError(message, proofStepFirstTokenInfo.stepLabel.range,
					MmpParserErrorCode.notAnAssertion, this.diagnostics);
			} else {
				// labeledStatement instanceof AssertionStatement
				const refEHyps: number = proofStepFirstTokenInfo.eHypRefs == undefined ?
					0 : proofStepFirstTokenInfo.eHypRefs.length;
				if (proofStepFirstTokenInfo.stepRef.value != '' &&
					labeledStatement.frame?.eHyps.length != refEHyps) {
					const message = `Unification error: the assertion ${proofStepFirstTokenInfo.stepLabel.value} ` +
						`expects ${labeledStatement.frame?.eHyps.length} $e hypothesis, but ${refEHyps} are given`;
					const range: Range = proofStepFirstTokenInfo.eHypRefs == undefined ?
						proofStepFirstTokenInfo.stepLabel.range : <Range>proofStepFirstTokenInfo.eHypRefsRange;
					if (refEHyps == 0)
						// proofStep EHyps are either undefined or 0, but the logical assertion requires EHyps
						MmpValidator.addDiagnosticWarning(message, range, MmpParserWarningCode.missingEHyps,
							this.diagnostics);
					else
						// proofStep EHyps are defined, but their number does not match those of the logical assertion
						MmpValidator.addDiagnosticError(message, range, MmpParserErrorCode.wrongNumberOfEHyps,
							this.diagnostics);
				}
			}

		}
		// this.labelToStatementMap.get(proofStepFirstTokenInfo.stepLabel.value) === undefined) {
		// const message = `Unknown label: this label does not exist in the logical system`;
		// const range: Range = proofStepFirstTokenInfo.stepLabel.range;
		// const code = MmpParserErrorCode.unknownLabel;
		// this.addDiagnosticError(message, range, code);
	}

	static tryToParse(stepFormula: MmToken[], grammar: Grammar, workingVars: WorkingVars,
		diagnostics: Diagnostic[]): InternalNode | undefined {
		let parseNode: InternalNode | undefined;
		// grammar.lexer = new MmLexer(workingVars);
		grammar.lexer = new MmLexerFromTokens(stepFormula);
		let parser: Parser = new Parser(grammar);
		// const stepFormulaString = concatTokenValuesWithSpaces(stepFormula);
		try {
			// parser.feed(stepFormulaString);
			// here we don't need to pass the actual formula string, because we use MmLexerFromTokens
			// that returns the original tokens of the formula
			parser.feed("");
			if (parser.results.length === 0) {
				// the formula was parsed till the end and no error was found, but at the end it
				// was not a valid formula
				const stepFormulaString = concatTokenValuesWithSpaces(stepFormula);
				grammar.lexer = new MmLexer(workingVars);
				parser = new Parser(grammar);
				parser.feed(stepFormulaString + " UnxpexcteEndOfFormula");
			}
			if (parser.results.length > 1)
				throw new Error("Some ambiguity, let's look into it");
			parseNode = parser.results[0];
		} catch (error: any) {
			let range: Range = oneCharacterRange(stepFormula[stepFormula.length - 1].range.end);
			let errorCode: MmpParserErrorCode = MmpParserErrorCode.unexpectedEndOfFormula;
			if (parser.current < stepFormula.length) {
				// the parsing error was NOT for an and UnxpexcteEndOfFormula
				range = stepFormula[parser.current].range;
				errorCode = MmpParserErrorCode.formulaSyntaxError;
			}
			// MmpValidator.addDiagnosticError(error.message, stepFormula[parser.current].range, "formulaError", diagnostics);
			MmpValidator.addDiagnosticError(error.message, range, errorCode, diagnostics);
		}
		return parseNode;
	}

	//#region getEHypMmpSteps
	private getEHypMmpStep(eHypRef: MmToken): (MmpProofStep | undefined) {
		let eHypStep: (MmpProofStep | undefined);
		if (eHypRef instanceof MmToken) {
			eHypStep = this.refToProofStepMap.get(eHypRef.value);
		}
		return eHypStep;
	}
	private getEHypMmpSteps(eHypRefs: MmToken[] | undefined, unknownStepRefs: Set<string>):
		(MmpProofStep | undefined)[] {
		const eHypMmpSteps: (MmpProofStep | undefined)[] = [];
		if (eHypRefs != undefined)
			eHypRefs.forEach((eHypRef: MmToken) => {
				if (eHypRef.value == "") {
					const message = `Missing reference`;
					MmpValidator.addDiagnosticWarning(message, eHypRef.range, MmpParserWarningCode.missingRef,
						this.diagnostics);
				}
				const eHypStep: (MmpProofStep | undefined) = this.getEHypMmpStep(eHypRef);
				if (eHypRef.value != "" && eHypStep == undefined) {
					const message = `This is not a reference for an existing proof step`;
					MmpValidator.addDiagnosticError(message, eHypRef.range, MmpParserErrorCode.unknownStepRef, this.diagnostics);
					unknownStepRefs.add(eHypRef.value);
				}
				eHypMmpSteps.push(eHypStep);
			});
		return eHypMmpSteps;
	}
	//#endregion getEHypMmpSteps

	//#region addDisjointVarConstraint
	addDiagnosticForExpectedVariable(mmToken: MmToken) {
		const errorMessage = `This is not a variable. A $d statement expects two variables`;
		MmpValidator.addDiagnosticError(errorMessage, mmToken.range, MmpParserErrorCode.disjVarSyntaxError, this.diagnostics);
	}
	addDisjointVarConstraint(nextProofStepTokens: MmToken[]) {
		if (nextProofStepTokens.length != 3) {
			const errorMessage = `After a $d , exactly 2 symbols are expected. We got ${nextProofStepTokens.length - 1} symbol/s instead.`;
			MmpValidator.addDiagnosticError(errorMessage, nextProofStepTokens[0].range, MmpParserErrorCode.disjVarSyntaxError, this.diagnostics);
		} else if (!this.outermostBlock.v.has(nextProofStepTokens[1].value))
			// the second symbol is NOT a variable
			this.addDiagnosticForExpectedVariable(nextProofStepTokens[1]);
		else if (!this.outermostBlock.v.has(nextProofStepTokens[2].value))
			// the third symbol is NOT a variable
			this.addDiagnosticForExpectedVariable(nextProofStepTokens[2]);
		else if (nextProofStepTokens[1] == nextProofStepTokens[2]) {
			// the two distinct variables are the same
			const errorMessage = `The two distinct variables are both '${nextProofStepTokens[1]}' : ` +
				`a variable cannot be declared distinct from itself, the two symbols after a $d must be different.`;
			MmpValidator.addDiagnosticError(errorMessage, nextProofStepTokens[0].range, MmpParserErrorCode.disjVarSyntaxError, this.diagnostics);
		}
		else
			// there are exactly 2 distinctvariables, after the $d symbol
			// this.uProof?.addDisjointVarStatement(nextProofStepTokens[1].value, nextProofStepTokens[2].value);
			this.uProof?.addDisjointVarStatement(nextProofStepTokens);
	}
	//#endregion addDisjointVarConstraint

	createMmpProofStep(nextProofStepTokens: MmToken[]) {
		const proofStepFirstTokenInfo: ProofStepFirstTokenInfo =
			this.proofStepFirstTokenInfo(nextProofStepTokens[0]);
		if (proofStepFirstTokenInfo.unparsableToken === undefined)
			// the first token was at least parsable
			this.addDiagnosticForLabelAndEHypRefs(nextProofStepTokens[0].range.end,
				proofStepFirstTokenInfo);

		let stepFormula: MmToken[] | undefined;
		let formulaParseNode: InternalNode | undefined;
		if (nextProofStepTokens.length > 1) {
			// the step formula is present
			stepFormula = nextProofStepTokens.slice(1);
			formulaParseNode = MmpParser.tryToParse(stepFormula, this.grammar, this.workingVars, this.diagnostics);
		}
		else {
			// missing formula
			const message = "Missing Formula";
			// the range for the diagnostic is one character after the first token
			const range: Range = oneCharacterRange({
				// line: nextProofStepTokens[0].line,
				// character: nextProofStepTokens[0].column + 1
				line: proofStepFirstTokenInfo.firstToken.range.start.line,
				character: proofStepFirstTokenInfo.firstToken.range.end.character
			});
			const code = MmpParserWarningCode.missingFormula;
			this.addDiagnosticWarning(message, range, code);
		}
		const unknownStepRefs: Set<string> = new Set<string>();
		const eHypMmpSteps: (MmpProofStep | undefined)[] =
			this.getEHypMmpSteps(proofStepFirstTokenInfo.eHypRefs, unknownStepRefs);
		const isFirstTokenParsable: boolean = proofStepFirstTokenInfo.unparsableToken == undefined;
		const proofStep: MmpProofStep = new MmpProofStep(this.uProof!, proofStepFirstTokenInfo,
			isFirstTokenParsable, proofStepFirstTokenInfo.isEHyp, proofStepFirstTokenInfo.stepRef,
			proofStepFirstTokenInfo.eHypRefs, eHypMmpSteps, proofStepFirstTokenInfo.stepLabel, stepFormula, formulaParseNode);
		if (unknownStepRefs.size > 0)
			// there was at least a step ref pointing to a non existent proof step
			proofStep.skipUnification = true;
		this.addProofStep(proofStep);
	}
	addRemovableStatement(nextProofStepTokens: MmToken[]) {
		const unmanagedStatement: TextForProofStatement = new TextForProofStatement(nextProofStepTokens);
		this.uProof?.addUStatement(unmanagedStatement);
	}
	createMmpStatementFromStepTokens(nextProofStepTokens: MmToken[]) {
		const nextTokenValue = nextProofStepTokens[0].value;
		if (nextTokenValue == "$theorem")
			this.addTheoremLabel(nextProofStepTokens);
		else if (nextTokenValue.startsWith('*'))
			// currente statement is a comment
			this.addComment(nextProofStepTokens);
		else if (nextTokenValue == MmpSearchStatement.searchSymbolsKeyword)
			// current statement is a search statement
			this.addSearchStatement(nextProofStepTokens);
		else if (nextTokenValue.startsWith('$d'))
			// current statement is a disj var constraint
			this.addDisjointVarConstraint(nextProofStepTokens);
		else if (nextTokenValue == '$=')
			// current statement is a proof
			this.addRemovableStatement(nextProofStepTokens);
		else
			// current statement is a proof step
			this.createMmpProofStep(nextProofStepTokens);
	}
	//#endregion createMmpStatementFromStepTokens

	private createNextMmpStatement(token: MmToken | undefined, mmLexer: MmLexer) {
		const nextProofStepTokens: MmToken[] = [];

		while (token != undefined && (nextProofStepTokens.length == 0 || token.column !== 0)) {
			nextProofStepTokens.push(token);
			token = mmLexer.next();
		}

		this.createMmpStatementFromStepTokens(nextProofStepTokens);
		return token;
	}
	//#endregion createNextMmpStatement

	//#region checkUnificationOfLogicalVars

	//#region checkUnificationWithUSubstitutionManager

	//#region  addDiagnisticsForSubstitution
	// static applySubstitution(formula: string[], substitution: Map<string, string[]>): string[] {
	// 	let result: string[] = [];
	// 	formula.forEach(symbol => {
	// 		let symbolSubstitution = [symbol];
	// 		const substituteWith: string[] | undefined = substitution.get(symbol);
	// 		if (substituteWith != undefined)
	// 			symbolSubstitution = substituteWith;
	// 		result = result.concat(symbolSubstitution);
	// 	});
	// 	return result;
	// }

	//#region addDiagnisticsForSubstitutionInEHyps
	addDiagnisticsForSubstitutionInEHyp(frameEHyp: EHyp, referencedEHypProofStep: MmpProofStep, range: Range,
		substitution: Map<string, InternalNode>) {

		// const expectedFormula: string[] =
		// MmpSubstitutionManager.applySubstitution(frameEHyp.formula, substitution);
		const expectedNode: ParseNode = USubstitutionApplier.createParseNode(frameEHyp.parseNode,
			substitution, this.outermostBlock);
		const expectedFormula: string[] = GrammarManager.buildStringArray(expectedNode);
		const referencedFormula: MmToken[] | undefined = referencedEHypProofStep.stepFormula;
		if (referencedFormula != undefined) {
			const strArrReferencedFormula: string[] = MmToken.fromTokensToStrings(referencedFormula);
			if (!AreArrayTheSame(strArrReferencedFormula, expectedFormula)) {
				const strExpectedFormula = concatWithSpaces(expectedFormula);
				const strReferencedFormula = concatWithSpaces(strArrReferencedFormula);
				const message = `Unification error: referenced statement is '${strReferencedFormula}' but it was expected ` +
					`to be '${strExpectedFormula}'`;
				MmpValidator.addDiagnosticError(message, range,
					MmpParserErrorCode.refStatementUnificationError, this.diagnostics);
			}
		}
	}
	addDiagnisticsForSubstitutionInEHyps(frameEHyps: EHyp[], proofStep: MmpProofStep,
		substitution: Map<string, InternalNode>) {
		if (proofStep.eHypRefs != undefined && proofStep.eHypRefs.length == frameEHyps.length) {
			for (let i = 0; i < frameEHyps.length; i++) {
				const referencedEHypProofStep: MmpProofStep | undefined =
					<MmpProofStep | undefined>proofStep.eHypUSteps[i];
				// refToProofStepMap.get(proofStep.eHypRefs[i].value);
				if (referencedEHypProofStep != undefined)
					this.addDiagnisticsForSubstitutionInEHyp(
						frameEHyps[i], referencedEHypProofStep, proofStep.eHypRefs[i].range, substitution);
			}
		}
	}
	addDiagnisticsForAssertion(assertionStatement: AssertionStatement, proofStep: MmpProofStep,
		substitution: Map<string, InternalNode>) {
		const expectedNode = USubstitutionApplier.createParseNode(
			assertionStatement.parseNode, substitution, this.outermostBlock);
		// const expectedFormula: string[] =
		// 	MmpSubstitutionManager.applySubstitution(assertionStatement.formula, substitution);
		const expectedFormula: string[] = GrammarManager.buildStringArray(expectedNode);
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
		proofStep: MmpProofStep, substitution: Map<string, InternalNode>) {
		this.addDiagnisticsForAssertion(assertionStatement, proofStep, substitution);
		this.addDiagnisticsForSubstitutionInEHyps(frameEHyps, proofStep, substitution);
	}
	//#endregion addDiagnisticsForSubstitutionInEHyps

	//#endregion addDiagnisticsForSubstitution
	addStartingPairsForMGUFinder(mmpProofStep: MmpProofStep, assertion: AssertionStatement,
		substitution: Map<string, InternalNode>) {
		const workingVarsUnifierInitializer: WorkingVarsUnifierInitializer =
			new WorkingVarsUnifierInitializer(mmpProofStep, assertion, substitution, this.outermostBlock,
				this.grammar);
		const startingPairsForMGUAlgorthm: OrderedPairOfNodes[] =
			workingVarsUnifierInitializer.buildStartingPairsForMGUAlgorithm();
		this._orderedPairsOfNodesForMGUalgorithm =
			this._orderedPairsOfNodesForMGUalgorithm.concat(...startingPairsForMGUAlgorthm);
	}

	//TODO this method returns a single pair of Diagnostic for every DjVars constraint violation.
	// The reason is that we have a single substitution for every logical var: it is consistent,
	// thus, in principle, we could have multiple substitutions and then a Diagnostic for violating
	// var. Here's an explanatory example (see the corresponding test in DisjointVarsManager.test.ts):
	// qed:ax-5 |- ( y e. A -> A. y y e. A )
	// will return three constraint errors: one underlying ax-5, one underlying the first occurrence of
	// y (from the substitution of ph) and one underlying the second occurrence of y (from the substitution
	// of x). In principle, the third occurrence of y could also be underlined, because the second y e. A
	// is yet another substitution of ph.
	// You may consider adding all these diagnostics, in the future.
	protected checkDisjVarConstraints(assertion: AssertionStatement, substitution: Map<string, InternalNode>,
		stepLabelToken: MmToken, stepRef: string) {
		const disjointVarsManager: DisjointVarsManager =
			new DisjointVarsManager(assertion, substitution, this.outermostBlock, true, stepLabelToken, stepRef, this.uProof);
		disjointVarsManager.checkDisjVarsConstraintsViolation();
		disjointVarsManager.checkMissingDisjVarsConstraints(<MmpProof>this.uProof);
		this.diagnostics = this.diagnostics.concat(...disjointVarsManager.diagnostics);
	}

	checkUnificationWithUSubstitutionManager(mmpProofStep: MmpProofStep,
		outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars) {
		if (mmpProofStep.stepLabel != undefined) {
			const stepLabelToken: MmToken = <MmToken>mmpProofStep.stepLabelToken;
			const labeledStatement: LabeledStatement | undefined =
				this.labelToStatementMap.get(stepLabelToken.value);
			if (labeledStatement instanceof AssertionStatement && !GrammarManager.isSyntaxAxiom2(labeledStatement)) {
				// labeledStatement instanceof AssertionStatement and it is not a syntax axiom
				const uSubstitutionBuilder: USubstitutionBuilder = new USubstitutionBuilder(mmpProofStep,
					labeledStatement, outermostBlock, workingVars, grammar, this.diagnostics);
				// const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitutionForExistingParseNodes();
				const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
				if (!substitutionResult.hasBeenFound) {
					const substitution: Map<string, InternalNode> =
						uSubstitutionBuilder.buildACompleteSubstitutionEvenIfNonUnifiable();
					this.addDiagnisticsForSubstitution(labeledStatement.frame!.eHyps, labeledStatement,
						mmpProofStep, substitution);
				} else {
					// a valid substitution has been found
					const substitution: Map<string, InternalNode> =
						<Map<string, InternalNode>>substitutionResult.substitution;
					this.addStartingPairsForMGUFinder(mmpProofStep, labeledStatement, substitution);
					this.checkDisjVarConstraints(labeledStatement, substitution,
						mmpProofStep.stepLabelToken!, mmpProofStep.stepRef);
				}

			}
		}
	}
	//#endregion checkUnificationWithUSubstitutionManager

	/**
	 * Adds diagnostics for each unification in the proof
	 */
	checkUnificationOfLogicalVars(outermostBlock: BlockStatement,
		grammar: Grammar, workingVars: WorkingVars) {
		// this.mmpStatements.forEach((mmpStatement: MmpStatement) => {
		this.uProof?.uStatements.forEach((mmpStatement: IUStatement) => {
			// if (mmpStatement instanceof MmpProofStep && !mmpStatement.isEHyp) {
			if (mmpStatement instanceof MmpProofStep && !mmpStatement.isEHyp) {
				// const substitutionManager: MmpSubstitutionManager =
				// 	new MmpSubstitutionManager(labelToStatementMap, outermostBlock, this.diagnostics);
				// substitutionManager.checkUnificationForSingleMmpStep(mmpStatement, grammar, workingVars, this.refToProofStepMap);

				//tentativo nuovo con USubstitutionBuilder
				this.checkUnificationWithUSubstitutionManager(mmpStatement, outermostBlock, grammar, workingVars);
			}
		});
	}
	//#endregion checkUnificationOfLogicalVars


	/**
	 * parses the given text and builds the properties mmpStatements , refToProofStepMap and diagnostics;
	 * builds diagnostics, but it doesn't check for unification errors.
	 * This is mainly used for testing it separately from the whole method parse
	 * @param textToParse 
	 * @param labelToStatementMap  
	 * @param grammar 
	 */
	protected createMmpStatements() {
		const mmLexer: MmLexer = new MmLexer(this.workingVars);
		mmLexer.reset(this.textToParse);
		this.mmTokens = mmLexer.tokens;
		let token: MmToken | undefined = mmLexer.next();
		this.uProof = new MmpProof(this.outermostBlock, this.workingVars);
		while (token != undefined) {
			token = this.createNextMmpStatement(token, mmLexer);
			// token = mmLexer.current();
		}
	}

	checkCoherenceIfAlreadyExistingTheorem() {
		const theoremName: string | undefined = this.uProof?.theoremLabel?.value;
		if (theoremName != undefined) {
			// the $theorem statement is present
			const labeledStatement: LabeledStatement | undefined = this.labelToStatementMap.get(theoremName);
			if (labeledStatement instanceof ProvableStatement) {
				// the current theorem is already in the theory
				const defaultRange: Range = this.uProof!.theoremLabel!.range;
				const theoremCoherenceChecker: TheoremCoherenceChecker = new TheoremCoherenceChecker(
					this.uProof!, labeledStatement, defaultRange, this.diagnostics);
				theoremCoherenceChecker.checkCoherence();
			}
		}
	}

	//#region checkUnificationOfWorkingVars

	//#region addDiagnosticsForWorkingVarsMGUerror
	buildErrorMessageForOccourCheckOrderedPair(workingVar: string, parseNode2: InternalNode): string {
		const strParseNode2: string = GrammarManager.buildStringFormula(parseNode2);
		const errorMessage: string = `Working Var unification error: the  working var ${workingVar} should be ` +
			`replaced with the following subformula, containing itself ${strParseNode2}`;
		return errorMessage;
	}

	//#region addDiagnosticForEachOccourenceOfWorkingVar
	addDiagnosticForOccourenceOfWorkingVarToSingleParseNode(parseNode: InternalNode, workingVar: string, errorMessage: string) {
		parseNode.parseNodes.forEach((childNode: ParseNode) => {
			if (childNode instanceof MmToken) {
				if (childNode.value == workingVar)
					MmpValidator.addDiagnosticError(errorMessage, childNode.range, MmpParserErrorCode.workingVarUnificationError,
						this.diagnostics);
			} else
				// parseNode instanceof InternalNode
				this.addDiagnosticForOccourenceOfWorkingVarToSingleParseNode(childNode, workingVar, errorMessage);

		});
	}
	addDiagnosticForOccourenceOfWorkingVarToSingleFormula(stepFormula: MmToken[], workingVar: string, errorMessage: string) {
		stepFormula.forEach((mmToken: MmToken) => {
			if (mmToken.value == workingVar)
				MmpValidator.addDiagnosticError(errorMessage, mmToken.range,
					MmpParserErrorCode.workingVarUnificationError, this.diagnostics);
		});
	}
	addDiagnosticForEachOccourenceOfWorkingVar(workingVar: string, errorMessage: string) {
		this.uProof?.uStatements.forEach((uStatement: IUStatement) => {
			// if (uStatement instanceof UProofStep && uStatement.parseNode != undefined) {
			// 	this.addDiagnosticForOccourenceOfWorkingVarToSingleParseNode(uStatement.parseNode,
			// 		workingVar, errorMessage);
			// }
			if (uStatement instanceof MmpProofStep && uStatement.stepFormula != undefined) {
				this.addDiagnosticForOccourenceOfWorkingVarToSingleFormula(uStatement.stepFormula,
					workingVar, errorMessage);
			}
		});
	}
	//#endregion addDiagnosticForEachOccourenceOfWorkingVar
	protected addDiagnosticsForWorkingVarsMGUerror(occourCheckOrderedPair: OrderedPairOfNodes) {
		const workingVar: string = GrammarManager.getTokenValueFromInternalNode(occourCheckOrderedPair.parseNode1);
		const errorMessage: string = this.buildErrorMessageForOccourCheckOrderedPair(workingVar, occourCheckOrderedPair.parseNode2);
		this.addDiagnosticForEachOccourenceOfWorkingVar(workingVar, errorMessage);
	}
	//#endregion addDiagnosticsForWorkingVarsMGUerror

	protected checkUnificationOfWorkingVars() {
		const workingVarsUnifierFinder: WorkingVarsUnifierFinder =
			new WorkingVarsUnifierFinder(this._orderedPairsOfNodesForMGUalgorithm);
		workingVarsUnifierFinder.findMostGeneralUnifier();
		if (workingVarsUnifierFinder.currentState == UnificationAlgorithmState.occourCheckFailure) {
			// the MGU algorithm stopped in error: a Working Var was required to be unified with a
			// node containing the Working Var itself

			this.addDiagnosticsForWorkingVarsMGUerror(
				<OrderedPairOfNodes>workingVarsUnifierFinder.occourCheckOrderedPair);
		}
	}
	//#endregion checkUnificationOfWorkingVars

	/**
	 * parses the given text and builds the properties mmpStatements , refToProofStepMap and diagnostics
	 * @param textToParse 
	 */
	parse() {
		// consoleLogWithTimestamp("Glauco_3: MmpParser.createProofSteps started");
		// TODO add diagnostics for mmParser.parseFailed == true
		// TODO add diagnostic for missing qed statement
		// TODO add diagnostics for missing theorem name
		this.createMmpStatements();
		this.checkCoherenceIfAlreadyExistingTheorem();

		this.checkUnificationOfLogicalVars(this.outermostBlock, this.grammar, this.workingVars);
		this.checkUnificationOfWorkingVars();
		// consoleLogWithTimestamp("Glauco_5: MmpParser.createProofSteps end");
	}
	//#endregion createProofSteps

	//#endregion constructor
}
