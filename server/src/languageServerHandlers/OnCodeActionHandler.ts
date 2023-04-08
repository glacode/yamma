import { CodeActionParams, CodeAction, Diagnostic, TextEdit, CodeActionKind, Range, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DataFieldForMissingDjVarConstraintsDiagnostic } from '../mm/DisjointVarsManager';
import { MmpParserWarningCode } from '../mmp/MmpParser';
import { DisjVarMmpStatement } from "../mm/DisjVarMmpStatement";


export class CodeActionForDiagnostic {
	params: CodeActionParams
	textDocuments: TextDocuments<TextDocument>;

	private _textDocument: TextDocument;
	private _text: string;

	codeActions: CodeAction[] = [];

	constructor(params: CodeActionParams, textDocuments: TextDocuments<TextDocument>) {
		this.params = params;
		this.textDocuments = textDocuments;

		this._textDocument = <TextDocument>this.textDocuments.get(this.params.textDocument.uri);
		this._text = this._textDocument.getText();
	}

	//#region buildCodeActions

	//#region calculateRange
	calculateRange(): Range {
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

	private addCodeAction(diagnostic: Diagnostic, range: Range,
		carriageReturnIfNeeded: string, codeActions: CodeAction[]) {
		const dataFieldForMissingDjVarConstraintsDiagnostic: DataFieldForMissingDjVarConstraintsDiagnostic =
			<DataFieldForMissingDjVarConstraintsDiagnostic>diagnostic.data;
		// const missingDjVarConstraints = dataFieldForMissingDjVarConstraintsDiagnostic.missingDjVarConstraints;
		// const var1 = missingDjVarConstraints.var1;
		// const var2 = missingDjVarConstraints.var2;
		const var1 = dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar1;
		const var2 = dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar2;

		// const statementText = `$. ${var1} ${var2}`;
		const statementText = DisjVarMmpStatement.textForTwoVars(var1, var2);


		//TODO add test for this text
		// const text: string = carriageReturnIfNeeded + new DisjVarUStatement(var1, var2).toText();
		const text: string = carriageReturnIfNeeded + statementText;
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
			title: `Add disjoint var constraint <${var1},${var2}>`,
			edit: {
				changes: changesObj
			},
			kind: CodeActionKind.QuickFix,
			diagnostics: [diagnostic]
		};
		codeActions.push(codeAction);
	}

	//#region codeActionForAddAllMissingDjVarsConstraint
	editTextForAddAllMissingDjVarsConstraints(carriageReturnIfNeeded: string): string {
		let editText: string = carriageReturnIfNeeded;
		this.params.context.diagnostics.forEach((diagnostic: Diagnostic) => {
			if (diagnostic.code == MmpParserWarningCode.missingDjVarsStatement) {
				const dataFieldForMissingDjVarConstraintsDiagnostic: DataFieldForMissingDjVarConstraintsDiagnostic =
					<DataFieldForMissingDjVarConstraintsDiagnostic>diagnostic.data;
				editText += DisjVarMmpStatement.textForTwoVars(dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar1,
					dataFieldForMissingDjVarConstraintsDiagnostic.missingDisjVar2) + "\n";
			}
		});
		return editText;
	}
	codeActionForAddAllMissingDjVarsConstraint(range: Range, carriageReturnIfNeeded: string): CodeAction {
		const title = "Add all missing disjoint var constraints";
		const text: string = this.editTextForAddAllMissingDjVarsConstraints(carriageReturnIfNeeded);
		const codeAction: CodeAction = this.buildCodeAction(title, range, text, this.params.context.diagnostics);
		codeAction.isPreferred = true;
		return codeAction;
	}
	//#endregion codeActionForAddAllMissingDjVarsConstraint

	buildCodeActions() {
		const range: Range = this.calculateRange();
		const codeActions: CodeAction[] = [];
		const carriageReturnIfNeeded: string = (this._text[this._text.length - 1] == "\n" ? "" : "\n");

		let containsAtLeastAMissingDjVarsDiagnostic = false;
		this.params.context.diagnostics.forEach((diagnostic: Diagnostic) => {
			if (diagnostic.code == MmpParserWarningCode.missingDjVarsStatement) {
				this.addCodeAction(diagnostic, range, carriageReturnIfNeeded, codeActions);
				containsAtLeastAMissingDjVarsDiagnostic = true;
			}
		});

		if (containsAtLeastAMissingDjVarsDiagnostic) {
			const codeActionAddAllMissing: CodeAction = this.codeActionForAddAllMissingDjVarsConstraint(range,
				carriageReturnIfNeeded);
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