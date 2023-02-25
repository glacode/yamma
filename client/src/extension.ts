/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { commands, ExtensionContext, Range as VsCodeRange, Position, Selection, TextEditorRevealType, window, workspace } from 'vscode';
// import {  } from "../../server/src/mmt/MmtSaver";

import {
	Disposable,
	LanguageClient,
	LanguageClientOptions,
	Range,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

import { loadMmtFilesCommandHandler, storeMmtFileCommandHandler } from "./mmt/MmtCommandHandler";

import { searchCommandHandler } from "./commandHandlers/SearchCommandHandler";
import { completionItemSelectedHandler } from './commandHandlers/CompletionItemSelectedHandler';
import { editor } from './test/helper';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		//		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		// documentSelector: [{ scheme: 'file', language: 'metamath-zero' }],
		documentSelector: [{ scheme: 'file', language: 'yamma' }],

		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.mmp')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'yamma',
		'Yamma',
		serverOptions,
		clientOptions
	);

	// const mmtCommandHandler: MmtCommandHandler = new MmtCommandHandler(client);


	//Glauco
	client.onReady().then(() => {
		//TODO1 use context.subscription.push for any disposable (write a function)
		let disposable: Disposable = commands.registerCommand('yamma.storeInMMTfolder',
			storeMmtFileCommandHandler, client);
		context.subscriptions.push(disposable);
		disposable = commands.registerCommand('yamma.loadFromMMTfolder',
			loadMmtFilesCommandHandler, client);
		context.subscriptions.push(disposable);
		disposable = commands.registerCommand('yamma.unify',
			() => { client.sendRequest('yamma/unify', window.activeTextEditor.document.uri.toString()); });
		disposable = commands.registerCommand('yamma.unifyAndRenumber',
			() => { client.sendRequest('yamma/unifyAndRenumber', window.activeTextEditor.document.uri.toString()); });
		disposable = commands.registerCommand('yamma.search', searchCommandHandler, client);
		disposable = commands.registerCommand('yamma.completionitemselected',
			completionItemSelectedHandler, client);
		context.subscriptions.push(disposable);

		client.onNotification('yamma/movecursor', (range: Range) => {
			const start: Position = new Position(range.start.line, range.start.character);
			const end: Position = new Position(range.end.line, range.end.character);
			window.activeTextEditor.selection = new Selection(start, end);
			const vsCodeRange: VsCodeRange = new VsCodeRange(start, end);
			window.activeTextEditor.revealRange(vsCodeRange, TextEditorRevealType.Default);
		});

		client.onNotification('yamma/triggerSuggest', () => {
			commands.executeCommand('editor.action.triggerSuggest');
		});
	});

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
