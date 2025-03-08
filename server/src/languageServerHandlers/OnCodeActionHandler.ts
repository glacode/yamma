import { CodeActionParams, CodeAction, Diagnostic, TextEdit, CodeActionKind, Range, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DataFieldForMissingDjVarConstraintsDiagnostic } from '../mm/DisjointVarsManager';
import { MmpParserWarningCode } from '../mmp/MmpParser';
import { MmpDisjVarStatement } from "../mmp/MmpDisjVarStatement";
import { Parameters } from '../general/Parameters';


export class CodeActionForDiagnostic {
	params: CodeActionParams
	textDocuments: TextDocuments<TextDocument>;

	private _textDocument: TextDocument;
	// private _text: string;

	codeActions: CodeAction[] = [];

	constructor(params: CodeActionParams, textDocuments: TextDocuments<TextDocument>) {
		this.params = params;
		this.textDocuments = textDocuments;

		this._textDocument = <TextDocument>this.textDocuments.get(this.params.textDocument.uri);
		// this._text = this._textDocument.getText();
	}

	//#region buildCodeActions

	//#region calculateRange
	calculateRangeToAddAtTheEnd(): Range {
		// const line = lineOfTheLastMmpProofStep + 1;
		const line: number = this._textDocument.lineCount;
		const range: Range = { start: { line: line, character: 0 }, end: { line: line, character: 0 } };
		return range;
	}
	//#endregion calculateRange

	buildCodeAction(title: string, range: Range, text: string, diagnostics: Diagnostic[]): CodeAction {
		const textEdit: TextEdit = {
			range: range,
			newText: text
		};
		const documentUri: string = this.params.textDocument.uri;
		const changesObj: {
			[uri: string]: TextEdit[];
		} = {};
		changesObj[documentUri] = [textEdit];
		const codeAction: CodeAction = {
			title: title,
			edit: {
				changes: changesObj
			},
			kind: CodeActionKind.QuickFix,
			diagnostics: diagnostics
		};
		return codeAction;
	}

	private addCodeAction(title: string, range: Range, text: string, diagnostic: Diagnostic, codeActions: CodeAction[]) {
		const textEdit: TextEdit = {
			range: range,
			newText: text
		};
		const documentUri: string = this.params.textDocument.uri;

		const changesObj: {
			[uri: string]: TextEdit[];
		} = {};
		changesObj[documentUri] = [textEdit];

		const codeAction: CodeAction = {
			title: title,
			edit: {
				changes: changesObj
			},
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostic]
		};
		codeActions.push(codeAction);
	}

	textForNewlyAddedConstraintComment() {
		const text: string = '\n' + Parameters.newlyAddedConstraintComment + '\n';
		return text;
	}
	private addCodeActionForMissingDjVarsStatement(diagnostic: Diagnostic, range: Range, codeActions: CodeAction[]) {
		const dataFieldForMissingDjVarConstraintsDiagnostic: DataFieldForMissingDjVarConstraintsDiagnostic =
			<DataFieldForMissingDjVarConstraintsDiagnostic>diagnostic.data;
		const var1 = dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar1;
		const var2 = dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar2;
		const statementText = MmpDisjVarStatement.textForTwoVars(var1, var2);
		const newlyAddedConstraintComment = this.textForNewlyAddedConstraintComment();
		//TODO add test for this text
		// const text: string = carriageReturnIfNeeded + newlyAddedConstraintComment + statementText;
		const text: string = newlyAddedConstraintComment + statementText + '\n';

		// const title = `Add disjoint var constraint <${var1},${var2}>`;
		const title = (diagnostic.code == MmpParserWarningCode.missingMandatoryDisjVarsStatement ?
			`Add mandatory disjoint var constraint <${var1},${var2}>` :
			`Add dummy disjoint var constraint <${var1},${var2}>`);

		this.addCodeAction(title, range, text, diagnostic, codeActions);
	}

	private addCodeActionForDiscouragedStatement(diagnostic: Diagnostic, codeActions: CodeAction[]) {
		const range: Range = { start: { line: 1, character: 0 }, end: { line: 1, character: 0 } };
		const text = '$allowdiscouraged\n';
		const title = `Add '$allowdiscouraged' statement`;
		this.addCodeAction(title, range, text, diagnostic, codeActions);
	}

	//#region codeActionForAddAllMissingDjVarsConstraint
	editTextForAddAllMissingDjVarsConstraints(): string {
		// let editText: string = carriageReturnIfNeeded;
		let editText: string = this.textForNewlyAddedConstraintComment();
		this.params.context.diagnostics.forEach((diagnostic: Diagnostic) => {
			if (diagnostic.code == MmpParserWarningCode.missingMandatoryDisjVarsStatement ||
				diagnostic.code == MmpParserWarningCode.missingDummyDisjVarsStatement) {
				const dataFieldForMissingDjVarConstraintsDiagnostic: DataFieldForMissingDjVarConstraintsDiagnostic =
					<DataFieldForMissingDjVarConstraintsDiagnostic>diagnostic.data;
				editText += MmpDisjVarStatement.textForTwoVars(dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar1,
					dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar2) + "\n";
			}
		});
		return editText;
	}
	codeActionForAddAllMissingDjVarsConstraint(range: Range): CodeAction {
		const title = "Add all missing disjoint var constraints";
		const text: string = this.editTextForAddAllMissingDjVarsConstraints();
		const codeAction: CodeAction = this.buildCodeAction(title, range, text, this.params.context.diagnostics);
		codeAction.isPreferred = true;
		return codeAction;
	}
	//#endregion codeActionForAddAllMissingDjVarsConstraint

	buildCodeActions() {
		const rangeToAddAtTheEnd: Range = this.calculateRangeToAddAtTheEnd();
		const codeActions: CodeAction[] = [];
		// const carriageReturnIfNeeded: string = (this._text[this._text.length - 1] == "\n" ? "" : "\n");

		let containsAtLeastAMissingDjVarsDiagnostic = false;
		this.params.context.diagnostics.forEach((diagnostic: Diagnostic) => {
			if (diagnostic.code == MmpParserWarningCode.missingMandatoryDisjVarsStatement
				|| diagnostic.code == MmpParserWarningCode.missingDummyDisjVarsStatement) {
				this.addCodeActionForMissingDjVarsStatement(diagnostic, rangeToAddAtTheEnd, codeActions);
				containsAtLeastAMissingDjVarsDiagnostic = true;
			} else if (diagnostic.code == MmpParserWarningCode.isDiscouraged)
				this.addCodeActionForDiscouragedStatement(diagnostic, codeActions);
		});

		if (containsAtLeastAMissingDjVarsDiagnostic) {
			const codeActionAddAllMissing: CodeAction = this.codeActionForAddAllMissingDjVarsConstraint(rangeToAddAtTheEnd);
			codeActions.push(codeActionAddAllMissing);
		}
		return codeActions;
	}
	//#endregion buildCodeActions
}

export class OnCodeActionHandler {

	textDocuments: TextDocuments<TextDocument>;

	constructor(textDocuments: TextDocuments<TextDocument>) {
		this.textDocuments = textDocuments;
	}

	onCodeActionHandler(params: CodeActionParams): CodeAction[] {
		const codeActionForDiagnostic: CodeActionForDiagnostic = new CodeActionForDiagnostic(params, this.textDocuments);

		// const codeActions: CodeAction[] = [];
		const codeActions: CodeAction[] = codeActionForDiagnostic.buildCodeActions();

		return codeActions;
	}
}