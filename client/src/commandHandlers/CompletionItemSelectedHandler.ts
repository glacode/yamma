import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

export function completionItemSelectedHandler(): any {
	console.log(`Sending CompletionItem selected!`);
	const textDocumentUri: string = vscode.window.activeTextEditor.document.uri.toString();
	(<LanguageClient>this).sendRequest('yamma/completionitemselected', textDocumentUri);
}