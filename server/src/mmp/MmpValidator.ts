import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { Range, TextDocument } from 'vscode-languageserver-textdocument';
import { MmParser } from '../mm/MmParser';
import { MmpParser, MmpParserErrorCode, MmpParserWarningCode } from './MmpParser';
import { AssertionStatement } from "../mm/AssertionStatement";
import { WorkingVars } from './WorkingVars';
import { GlobalState } from '../general/GlobalState';
import { MmpStatistics } from './MmpStatistics';
import { consoleLogWithTimestamp } from '../mm/Utils';
import { FormulaToParseNodeCache } from './FormulaToParseNodeCache';

/** validates a .mmp files and returns diagnostics
 * for the language server event handlers
 */
export class MmpValidator {
	mmParser: MmParser
	private formulaToParseNodeCache: FormulaToParseNodeCache;
	diagnostics: Diagnostic[] = [];

	constructor(mmParser: MmParser, private globalState: GlobalState ) {
		this.mmParser = mmParser;
		this.formulaToParseNodeCache = globalState.formulaToParseNodeCache;
	}

	//#region validateFullDocument


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

	//#region validateFullDocumentText
	private async updateStatistics(mmpParser: MmpParser) {
		const mmpStatistics: MmpStatistics = new MmpStatistics(mmpParser);
		mmpStatistics.buildStatistics();
		this.globalState.mmpStatistics = mmpStatistics;
	}

	// validateFullDocumentText(textToValidate: string, labelToStatementMap: Map<string, LabeledStatement>,
	// 	outermostBlock: BlockStatement, grammar: Grammar, workingVars: WorkingVars) {
	validateFullDocumentText(textToValidate: string, mmParser: MmParser, workingVars: WorkingVars) {
		// const mmpTokenizer = new MmpTokenizer(textToValidate);
		// const mmpParser: MmpParser = new MmpParser(textToValidate, labelToStatementMap, outermostBlock, grammar, workingVars);
		const mmpParser: MmpParser = new MmpParser(textToValidate, mmParser, workingVars,
			this.formulaToParseNodeCache);
		console.log('before mmpParser.parse()');
		mmpParser.parse();
		console.log('after mmpParser.parse()');
		this.globalState.lastMmpParser = mmpParser;
		this.diagnostics = mmpParser.diagnostics;
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