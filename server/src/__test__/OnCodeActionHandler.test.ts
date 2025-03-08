import { CodeAction, CodeActionContext, CodeActionParams, Diagnostic, Position, Range, TextDocuments, TextDocumentsConfiguration } from 'vscode-languageserver';
import { TextDocument, TextDocumentContentChangeEvent, TextEdit } from 'vscode-languageserver-textdocument';
import { CodeActionForDiagnostic } from '../languageServerHandlers/OnCodeActionHandler';
import { DataFieldForMissingDjVarConstraintsDiagnostic } from '../mm/DisjointVarsManager';
import { MmpParser, MmpParserWarningCode } from '../mmp/MmpParser';
import { eqeq1iMmParser, kindToPrefixMap } from './GlobalForTest.test';
import { WorkingVars } from '../mmp/WorkingVars';

const mockPosition: Position = { line: 0, character: 0 };
const mockRange: Range = { start: mockPosition, end: mockPosition };

test("Expect 3 CodeAcion(s) for missing dj vars and 1 CodeAction for isDiscouraged", () => {
	const dataField1: DataFieldForMissingDjVarConstraintsDiagnostic =
	{
		missingDisjVar1: 'A',
		missingDisjVar2: 'y'
		// missingDjVarConstraints: new DisjVarUStatement("A", "y")
	};
	const diagnostic1: Diagnostic = {
		message: "Diag message 1", range: mockRange,
		code: MmpParserWarningCode.missingMandatoryDisjVarsStatement,
		data: dataField1
	};
	const dataField2: DataFieldForMissingDjVarConstraintsDiagnostic =
	{
		missingDisjVar1: 'x',
		missingDisjVar2: 'y'
		// missingDjVarConstraints: new DisjVarUStatement("x", "y")
	};
	const diagnostic2: Diagnostic = {
		message: "Diag message 2", range: mockRange,
		code: MmpParserWarningCode.missingMandatoryDisjVarsStatement,
		data: dataField2
	};
	const diagnostic3: Diagnostic = {
		message: "Diag message 3", range: mockRange,
		code: MmpParserWarningCode.isDiscouraged
	};

	const context: CodeActionContext = {
		diagnostics: [diagnostic1, diagnostic2,diagnostic3]
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

	expect(codeActions.length).toBe(4);
	const codeAction1: CodeAction = codeActions[0];
	expect(codeAction1.title).toEqual("Add mandatory disjoint var constraint <A,y>");
	expect(codeAction1.edit?.changes![testURI].length).toBe(1);
	const textEdit1: TextEdit = <TextEdit>codeAction1.edit?.changes![testURI][0];
	expect(textEdit1.newText).toEqual(`\

* The newly added $d constraints are listed below (unify to classify them as mandatory or dummy)
$d A y
`);
	expect(textEdit1.range.start.line).toBe(2);
	expect(textEdit1.range.start.character).toBe(0);
	expect(textEdit1.range.end.line).toBe(2);
	expect(textEdit1.range.end.character).toBe(0);

	const codeAction2: CodeAction = codeActions[1];
	expect(codeAction2.title).toEqual("Add mandatory disjoint var constraint <x,y>");

	// the CodeAction for "Add all missing disjoint var constraints" is at the end of all CodeActions
	const codeAction4: CodeAction = codeActions[3];
	expect(codeAction4.title).toEqual("Add all missing disjoint var constraints");
	const expectedEditTex3 = `\

* The newly added $d constraints are listed below (unify to classify them as mandatory or dummy)
$d A y
$d x y
`;

	const textEdit4: TextEdit = <TextEdit>codeAction4.edit?.changes![testURI][0];
	expect(textEdit4.newText).toEqual(expectedEditTex3);

	const codeAction3: CodeAction = codeActions[2];
	expect(codeAction3.title).toEqual("Add '$allowdiscouraged' statement");
	expect(codeAction3.edit?.changes![testURI].length).toBe(1);
	const textEdit3: TextEdit = <TextEdit>codeAction3.edit?.changes![testURI][0];
	expect(textEdit3.newText).toEqual("$allowdiscouraged\n");
	expect(textEdit3.range.start.line).toBe(1);
	expect(textEdit3.range.start.character).toBe(0);
	expect(textEdit3.range.end.line).toBe(1);
	expect(textEdit3.range.end.character).toBe(0);
	spy.mockClear();
});


test("Expect CodeAction for albidv ", () => {
	//Step 59: Substitution (to) vars subject to DjVars restriction by proof step but
	//not listed as DjVars in theorem to be proved: [<j,ph>, <M,j>, <Z,j>]
	const mmpSource =`\
1::elequ2            |- ( w = x -> ( z e. w <-> z e. x ) )
2:1:bibi1d          |- ( w = x -> ( ( z e. w <-> z e. y ) <-> ( z e. x <-> z e. y ) ) )
3:2:albidv         |- ( w = x -> ( A. z ( z e. w <-> z e. y ) <-> A. z ( z e. x <-> z e. y ) ) )
qed::              |- ( A. z ( z e. x <-> z e. y ) -> x = y )
`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.missingDjVarsStatement)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(3);

	const params: CodeActionParams = {
		context: {
			diagnostics: mmpParser.diagnostics,
		},
		range: mockRange,
		textDocument: {
			uri: 'file:///mock-document.txt',
		}
	};
	
	// Mock textDocuments
	const textDocuments: TextDocuments<TextDocument> = {
		get: jest.fn((_uri: string) => ({
			getText: jest.fn(() => 'mock document text'),
			lineCount: 10
			// Add other methods or properties of TextDocument if needed
		})),
		// Add other methods of TextDocuments if needed
	} as unknown as TextDocuments<TextDocument>;

	const codeActionForDiagnostic: CodeActionForDiagnostic = new CodeActionForDiagnostic(params, textDocuments);
	const codeActions: CodeAction[] = codeActionForDiagnostic.buildCodeActions();
	expect(codeActions.length).toBe(3);
	const codeAction0: CodeAction = codeActions[0];
	expect(codeAction0.title).toEqual("Add dummy disjoint var constraint <w,z>");
	expect(codeAction0.edit?.changes!['file:///mock-document.txt'].length).toBe(1);
	const textEdit0: TextEdit = <TextEdit>codeAction0.edit?.changes!['file:///mock-document.txt'][0];
	expect(textEdit0.newText).toEqual(`\

* The newly added $d constraints are listed below (unify to classify them as mandatory or dummy)
$d w z
`);
	expect(textEdit0.range.start.line).toBe(10);  // comes from the mock TextDocument
	expect(textEdit0.range.start.character).toBe(0);
	const codeAction1: CodeAction = codeActions[1];
	expect(codeAction1.title).toEqual("Add mandatory disjoint var constraint <x,z>");
	expect(codeAction1.edit?.changes!['file:///mock-document.txt'].length).toBe(1);
	const textEdit1: TextEdit = <TextEdit>codeAction1.edit?.changes!['file:///mock-document.txt'][0];
	expect(textEdit1.newText).toEqual(`\

* The newly added $d constraints are listed below (unify to classify them as mandatory or dummy)
$d x z
`);
	expect(textEdit1.range.start.line).toBe(10);  // comes from the mock TextDocument
	expect(textEdit1.range.start.character).toBe(0);

});