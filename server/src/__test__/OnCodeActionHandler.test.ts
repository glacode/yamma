import { CodeAction, CodeActionContext, CodeActionParams, Diagnostic, Position, Range, TextDocuments, TextDocumentsConfiguration } from 'vscode-languageserver';
import { TextDocument, TextDocumentContentChangeEvent, TextEdit } from 'vscode-languageserver-textdocument';
import { CodeActionForDiagnostic } from '../languageServerHandlers/OnCodeActionHandler';
import { DataFieldForMissingDjVarConstraintsDiagnostic } from '../mm/DisjointVarsManager';
import { MmpParserWarningCode } from '../mmp/MmpParser';

const mockPosition: Position = { line: 0, character: 0 };
const mockRange: Range = { start: mockPosition, end: mockPosition };

test("Expect 3 CodeAcion(s) ", () => {
	const dataField1: DataFieldForMissingDjVarConstraintsDiagnostic =
	{
		missingDisjVar1: 'A',
		missingDisjVar2: 'y'
		// missingDjVarConstraints: new DisjVarUStatement("A", "y")
	};
	const diagnostic1: Diagnostic = {
		message: "Diag message 1", range: mockRange,
		code: MmpParserWarningCode.missingDjVarsStatement,
		data: dataField1
	};
	const dataField2: DataFieldForMissingDjVarConstraintsDiagnostic =
	{
		missingDisjVar1: 'x',
		missingDisjVar2: 'y'
		// missingDjVarConstraints: new DisjVarUStatement("x", "y")
	};
	const diagnostic2: Diagnostic = {
		message: "Diag message 1", range: mockRange,
		code: MmpParserWarningCode.missingDjVarsStatement,
		data: dataField2
	};

	const context: CodeActionContext = {
		diagnostics: [diagnostic1, diagnostic2]
	};
	const text = "qed:ax-5 |- ( x e. A -> A. y x e. A )";
	const testURI = "testURI";
	const textDocument: TextDocument = {
		uri: testURI,
		languageId: "test",
		lineCount: 2,
		getText: (() => text),
		positionAt: ((_offset: number) => mockPosition),
		offsetAt: ((_position: Position) => 0),
		version: 0
	};
	const params: CodeActionParams = { context: context, range: mockRange, textDocument: textDocument };
	const configuration: TextDocumentsConfiguration<TextDocument> = {
		create: ((_uri: string, _languageId: string, _version: number, _content: string) => textDocument),
		update: ((_document: TextDocument, _changes: TextDocumentContentChangeEvent[], _version: number) => textDocument)
	};
	const textDocuments: TextDocuments<TextDocument> = new TextDocuments<TextDocument>(configuration);
	const spy = jest.spyOn<TextDocuments<TextDocument>, any>(textDocuments, 'get').mockImplementation(() => textDocument);
	const codeActionForDiagnostic: CodeActionForDiagnostic = new CodeActionForDiagnostic(params, textDocuments);
	const codeActions: CodeAction[] = codeActionForDiagnostic.buildCodeActions();

	expect(codeActions.length).toBe(3);
	const codeAction1: CodeAction = codeActions[0];
	expect(codeAction1.title).toEqual("Add disjoint var constraint <A,y>");
	expect(codeAction1.edit?.changes![testURI].length).toBe(1);
	const textEdit1: TextEdit = <TextEdit>codeAction1.edit?.changes![testURI][0];
	expect(textEdit1.newText).toEqual("\n$d A y");
	expect(textEdit1.range.start.line).toBe(2);
	expect(textEdit1.range.start.character).toBe(0);
	expect(textEdit1.range.end.line).toBe(2);
	expect(textEdit1.range.end.character).toBe(0);

	const codeAction2: CodeAction = codeActions[1];
	expect(codeAction2.title).toEqual("Add disjoint var constraint <x,y>");
	const codeAction3: CodeAction = codeActions[2];
	expect(codeAction3.title).toEqual("Add all missing disjoint var constraints");
	const expectedEditTex3 = `
$d A y
$d x y
`;

	const textEdit3: TextEdit = <TextEdit>codeAction3.edit?.changes![testURI][0];
	expect(textEdit3.newText).toEqual(expectedEditTex3);


	spy.mockClear();
});