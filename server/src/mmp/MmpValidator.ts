import { Grammar } from 'nearley';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { Range, TextDocument } from 'vscode-languageserver-textdocument';
import { BlockStatement } from '../mm/BlockStatement';
import { MmParser } from '../mm/MmParser';
import { MmpParser, MmpParserErrorCode, MmpParserWarningCode } from './MmpParser';
import { AssertionStatement, LabeledStatement } from '../mm/Statements';
import { WorkingVars } from './WorkingVars';
import { GlobalState } from '../general/GlobalState';

/** validates a .mmp files and returns diagnostics
 * for the language server event handlers
 */
export class MmpValidator {
	mmParser: MmParser
	diagnostics: Diagnostic[] = [];

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
	validateFullDocumentText(textToValidate: string, labelToStatementMap: Map<string, LabeledStatement>,
		outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars) {
		// const mmpTokenizer = new MmpTokenizer(textToValidate);
		const mmpParser: MmpParser = new MmpParser(textToValidate, labelToStatementMap, outermostBlock, grammar, workingVars);
		mmpParser.parse();
		GlobalState.lastMmpParser = mmpParser;
		this.diagnostics = mmpParser.diagnostics;
	}

	validateFullDocument(textDocument: TextDocument): Diagnostic[] {
		this.diagnostics = [];
		if (this.mmParser != undefined && this.mmParser.isParsingComplete) {
			// the parser has analyzed all the main .mm
			const textToValidate: string = textDocument.getText();
			if (this.mmParser.grammar != undefined)
				// mmpUnifier.unify(textToParse, mmParser.grammar);
				this.validateFullDocumentText(textToValidate,
					this.mmParser.labelToStatementMap, this.mmParser.outermostBlock,
					this.mmParser.grammar, this.mmParser.workingVars);
		}
		// const mmpUnifier = new MmpUnifier(this.mmParser.labelToStatementMap, this.mmParser.outermostBlock);
		// const textToParse: string = textDocument.getText();
		// if (this.mmParser.grammar != undefined)
		// 	mmpUnifier.unify(textToParse, this.mmParser.grammar);
		return this.diagnostics;
	}
	//#endregion validateFullDocument

	static addDiagnosticError(message: string, range: Range, code: MmpParserErrorCode, diagnostics: Diagnostic[]) {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			message: message,
			range: range,
			code: code
		};
		diagnostics.push(diagnostic);
	}

	static addDiagnosticWarning(message: string, range: Range, code: MmpParserWarningCode, diagnostics: Diagnostic[]) {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			message: message,
			range: range,
			code: code
		};
		diagnostics.push(diagnostic);
	}
}