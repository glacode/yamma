import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { editor } from '../test/helper';


//TODO you are defining this interface both on the client and on the server:
//see if there's a way to define it in a single place
interface ISearchCommandParameter {
	uri: string;
	cursorLine: number;
}

export function searchCommandHandler(): any {
	console.log(`Sending request search!`);
	const searchCommandParameter: ISearchCommandParameter = {
		uri: vscode.window.activeTextEditor.document.uri.toString(),
		cursorLine: vscode.window.activeTextEditor.selection.start.line
		// cursorLine: editor.selection.start.line
	};
	(<LanguageClient>this).sendRequest('yamma/search', searchCommandParameter);
}

//TODO you are defining this interface both on the client and on the server:
//see if there's a way to define it in a single place
export interface ISearchCompletionItemCommandParameters {
	uri: string;
	searchStatementRangeStartLine: number;
	searchStatementRangeEndLine: number;
	label: string;
	lineToInsertTheLabel: number
}

export function searchCompletionItemSelectedHandler(args: any[]): any {
	console.log(`Sending search CompletionItem selected!`);
	const searchCompletionItemCommandParameters: ISearchCompletionItemCommandParameters = {
		uri: vscode.window.activeTextEditor.document.uri.toString(),
		searchStatementRangeStartLine: <number>args[0],
		searchStatementRangeEndLine: <number>args[1],
		label: <string>args[2],
		lineToInsertTheLabel: <number>args[3]
	};
	// (<LanguageClient>this).sendRequest('yamma/search', searchCommandParameter);
	// (<LanguageClient>this).sendRequest('yamma/searchcompletionitemselected', 4);
	(<LanguageClient>this).sendRequest('yamma/searchcompletionitemselected', searchCompletionItemCommandParameters);
}