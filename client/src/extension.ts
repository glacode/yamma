/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { getVSCodeDownloadUrl } from '@vscode/test-electron/out/util';
import * as path from 'path';
import { chdir } from 'process';
import { commands, ExtensionContext, MessageOptions, Position, Selection, window, workspace } from 'vscode';
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
		let disposable: Disposable = commands.registerCommand('yamma.storeInMMTfolder',
			storeMmtFileCommandHandler, client);
		context.subscriptions.push(disposable);
		disposable = commands.registerCommand('yamma.loadFromMMTfolder',
			loadMmtFilesCommandHandler, client);
		context.subscriptions.push(disposable);
		disposable = commands.registerCommand('yamma.search',searchCommandHandler, client);
		context.subscriptions.push(disposable);

		//TODO1 it looks like you could instead do this server side,
		//with connection.window.connection.window.showInformationMessage()
		client.onNotification('yamma/showinformation', (message: string) => {
			// the header 'Header caption' is not displayed because modal is false
			// I leave it there anyway, as a reference, if in the future I want a model message
			const options: MessageOptions = { detail: 'Header caption', modal: false };
			window.showInformationMessage(message, options, ...["Ok"]);
			// window.showInformationMessage(message, options, ...["Ok"]).then((item) => {
			// 	console.log(item);
			// });
			// window.showInformationMessage(message);
		});

		//TODO1 it looks like you could instead do this server side,
		//with connection.window.connection.window.showWarningMessage()
		client.onNotification('yamma/showwarning', (message: string) => {
			window.showWarningMessage(message, ...["Ok"]);
		});

		//TODO1 it looks like you could instead do this server side,
		//with connection.window.connection.window.showErrorMessage()
		client.onNotification('yamma/showerror', (message: string) => {
			window.showErrorMessage(message, ...["Ok"]);
		});

		// client.onNotification('yamma/movecursor', (range: Range) => {
		// 	window.activeTextEditor.selection = new Selection(range.start,range.end);
		// });
		client.onNotification('yamma/movecursor', (range: Range) => {
			// line++;
			const start: Position = new Position(range.start.line, range.start.character);
			const end: Position = new Position(range.end.line, range.end.character);
			window.activeTextEditor.selection = new Selection(start, end);
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
