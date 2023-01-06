import * as vscode from 'vscode';
import { LanguageClient, TextDocumentIdentifier } from 'vscode-languageclient/node';

//TODO1 move this file under the client/src/commandHandlers folder and then remove the client/src/mmt folder

//TODO I had to pass both uri and fsPath, because it's har to find a parser that switches
//from one to the other; the only "place" where I've been able to cleanly get both
// is in the function storeMmtFileCommandHandler() where vscode.window.activeTextEditor.document.uri
// seems to be the only object able to provide both formats the way I need it;
// Furthermore, I had to define the interface PathAndUri both here (in the client) and in the
// server, because they are in different rootDir(s)
// It would be nice to find an object that transforms form uri to path and pass only one of the two,
// but the MmtSaver needs both formats
interface PathAndUri  {
	fsPath: string;
	uri: string;
}

export function storeMmtFileCommandHandler(): any {
	// const languageClient: LanguageClient = this;
	console.log(`Sending request storemmt!`);
	// const textDocumentIdentifier: TextDocumentIdentifier = TextDocumentIdentifier.create(
	// 	vscode.window.activeTextEditor.document.uri.scheme);
	// (<LanguageClient>this).sendRequest('yamma/storemmt', vscode.window.activeTextEditor.document.uri.fsPath);
	const pathAndUri: PathAndUri = {
		uri:vscode.window.activeTextEditor.document.uri.toString(),
		fsPath:vscode.window.activeTextEditor.document.uri.fsPath };

	// (<LanguageClient>this).sendRequest('yamma/storemmt', vscode.window.activeTextEditor.document.uri.toString());
	(<LanguageClient>this).sendRequest('yamma/storemmt', pathAndUri);
}

export function loadMmtFilesCommandHandler(): any {
	// const languageClient: LanguageClient = this;
	console.log(`Sending request loadmmt!`);
	// vscode.window.activeTextEditor.document.uri.toString();
	const pathAndUri: PathAndUri = {
		uri:vscode.window.activeTextEditor.document.uri.toString(),
		fsPath:vscode.window.activeTextEditor.document.uri.fsPath };
	(<LanguageClient>this).sendRequest('yamma/loadmmt', pathAndUri);
}




