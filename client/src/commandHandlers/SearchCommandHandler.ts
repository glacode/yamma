import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { editor } from '../test/helper';


//TODO you are defining this interface both on the client and on the server:
//see if there's a way to define it in a single place
interface ISearchCommandParameter {
	uri: string;
	cursorLine: number;
}

//TODO1
export function searchCommandHandler(): any {
	console.log(`Sending request search!`);
	const searchCommandParameter: ISearchCommandParameter = {
		uri: vscode.window.activeTextEditor.document.uri.toString(),
		cursorLine: vscode.window.activeTextEditor.selection.start.line
		// cursorLine: editor.selection.start.line
	};
	(<LanguageClient>this).sendRequest('yamma/search', searchCommandParameter);
}