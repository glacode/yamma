import { Diagnostic, DiagnosticSeverity, TextEdit } from 'vscode-languageserver';
import { Range, TextDocument } from 'vscode-languageserver-textdocument';
import { MmParser } from '../mm/MmParser';
import { MmpParser, MmpParserErrorCode, MmpParserWarningCode } from './MmpParser';
import { AssertionStatement } from "../mm/AssertionStatement";
import { WorkingVars } from './WorkingVars';
import { GlobalState } from '../general/GlobalState';
import { MmpStatistics } from './MmpStatistics';
import { consoleLogWithTimestamp } from '../mm/Utils';

/** validates a .mmp files and returns diagnostics
 * for the language server event handlers
 */
export class MmpValidator {
	mmParser: MmParser
	diagnostics: Diagnostic[] = [];
	// workspaceEdit: WorkspaceEdit | undefined;
	textEdits: TextEdit[] | undefined;

	constructor(mmParser: MmParser) {
		this.mmParser = mmParser;
	}

	//#region validateFullDocument

	//#region validateProofStep

	//#region verifyProofStep
	hypStack(assertionStatement: AssertionStatement): string[][] {
		const stack: string[][] = [];
		assertionStatement.frame?.fHyps.forEach(fHyp => {
			stack.push(fHyp.formula);
		});
		assertionStatement.frame?.eHyps.forEach(eHyp => {
			stack.push(eHyp.formula);
		});
		return stack;
	}
	// verifyProofStep(proofStep: MmpProofStep): Diagnostic[] {
	// 	const diagnostics: Diagnostic[] = [];
	// 	if (proofStep.stepLabel == undefined)
	// 		// TODO handle case proofStep without label
	// 		throw new Error("Case proofStep without label, not hanlded yet!");
	// 	else {
	// 		const labeledStatement: LabeledStatement | undefined = this.mmParser.labelToStatementMap.get(proofStep.stepLabel.value);
	// 		if (labeledStatement == undefined) {
	// 			const diagnostic: Diagnostic = {
	// 				message: `The label ${proofStep.stepLabel.value} doesn't exist`,
	// 				range: proofStep.stepLabel.range,
	// 				severity: DiagnosticSeverity.Error
	// 			};
	// 			diagnostics.push(diagnostic);
	// 		} else if (!(labeledStatement instanceof AssertionStatement)) {
	// 			const diagnostic: Diagnostic = {
	// 				message: `The label ${proofStep.stepLabel.value} does not refer to an Assertion`,
	// 				range: proofStep.stepLabel.range,
	// 				severity: DiagnosticSeverity.Error
	// 			};
	// 			diagnostics.push(diagnostic);
	// 		} else {
	// 			// assertionStatement is an AssertionStatement
	// 			const assertionStatement = <AssertionStatement>labeledStatement;
	// 			const stack: string[][] = this.hypStack(assertionStatement);
	// 			const diagnostics = Verifier.verifyAssertionStatement(assertionStatement, assertionStatement, stack);
	// 		}
	// 	}


	// 	return diagnostics;
	// }
	//#endregion verifyProofStep

	// validateProofStep(proofStep: MmpProofStep): Diagnostic[] {
	// 	const diagnostics: Diagnostic[] = this.verifyProofStep(proofStep);
	// 	// let diagnostics: Diagnostic[] = this.buildDiagnostics(parseErrors)
	// 	return diagnostics;
	// }
	//#endregion validateProofStep

	//#region validateFullDocumentText
	//TODO may be the validateFullDocument could simply be to
	// invoke MmpUnifier.unify and use the returned Diagnostic[]

	//#endregion validateFullDocumentText

	//#region validateFullDocumentText
	private async updateStatistics(mmpParser: MmpParser) {
		const mmpStatistics: MmpStatistics = new MmpStatistics(mmpParser);
		mmpStatistics.buildStatistics();
		GlobalState.mmpStatistics = mmpStatistics;
	}

	// validateFullDocumentText(textToValidate: string, labelToStatementMap: Map<string, LabeledStatement>,
	// 	outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars) {
	validateFullDocumentText(textToValidate: string, mmParser: MmParser, workingVars: WorkingVars) {
		// const mmpTokenizer = new MmpTokenizer(textToValidate);
		// const mmpParser: MmpParser = new MmpParser(textToValidate, labelToStatementMap, outermostBlock, grammar, workingVars);
		const mmpParser: MmpParser = new MmpParser(textToValidate, mmParser, workingVars);
		console.log('before mmpParser.parse()');
		mmpParser.parse();
		console.log('after mmpParser.parse()');
		GlobalState.lastMmpParser = mmpParser;
		this.diagnostics = mmpParser.diagnostics;
		this.textEdits = mmpParser.textEdits;
		this.updateStatistics(mmpParser);
	}
	//#endregionvalidateFullDocumentText

	validateFullDocument(textDocument: TextDocument): Diagnostic[] {
		this.diagnostics = [];
		console.log('validateFullDocument - this.mmParser:' + this.mmParser);
		if (this.mmParser != undefined && this.mmParser.isParsingComplete) {
			// the parser has analyzed all the main .mm
			const textToValidate: string = textDocument.getText();
			if (this.mmParser.grammar != undefined)
				// mmpUnifier.unify(textToParse, mmParser.grammar);
				// this.validateFullDocumentText(textToValidate,
				// 	this.mmParser.labelToStatementMap, this.mmParser.outermostBlock,
				// 	this.mmParser.grammar, this.mmParser.workingVars);
				this.validateFullDocumentText(textToValidate, this.mmParser, this.mmParser.workingVars);
		}
		// const mmpUnifier = new MmpUnifier(this.mmParser.labelToStatementMap, this.mmParser.outermostBlock);
		// const textToParse: string = textDocument.getText();
		// if (this.mmParser.grammar != undefined)
		// 	mmpUnifier.unify(textToParse, this.mmParser.grammar);
		return this.diagnostics;
	}
	//#endregion validateFullDocument

	static addDiagnosticError(message: string, range: Range, code: MmpParserErrorCode, diagnostics: Diagnostic[]) {
		if (range.start.line < 0 || range.start.character < 0 || range.end.line < 0 || range.end.character < 0) {
			consoleLogWithTimestamp("diagnostic error NEGATIVE!!!");
			let forBreakPoint = 0; forBreakPoint = forBreakPoint + 1;
		}
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			message: message,
			range: range,
			code: code
		};
		diagnostics.push(diagnostic);
	}

	static addDiagnosticWarning(message: string, range: Range, code: MmpParserWarningCode, diagnostics: Diagnostic[]) {
		if (range.start.line < 0 || range.start.character < 0 || range.end.line < 0 || range.end.character < 0) {
			consoleLogWithTimestamp("diagnostic warning NEGATIVE!!!");
			let forBreakPoint = 0; forBreakPoint = forBreakPoint + 1;
		}
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			message: message,
			range: range,
			code: code
		};
		diagnostics.push(diagnostic);
	}
}