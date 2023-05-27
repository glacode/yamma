import { commands } from 'vscode';

export function triggerSuggestionHandler(): any {
	// const searchCommandParameter: ISearchCommandParameter = {
	// 	uri: vscode.window.activeTextEditor.document.uri.toString(),
	// 	cursorLine: vscode.window.activeTextEditor.selection.start.line
	// 	// cursorLine: editor.selection.start.line
	// };
	// (<LanguageClient>this).sendRequest('yamma/search', searchCommandParameter);
	console.log('triggerSuggest');
	commands.executeCommand('editor.action.triggerSuggest');
}