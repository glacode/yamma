import path = require('path');
import url = require('url');
import { Connection, Diagnostic, PublishDiagnosticsParams, WorkDoneProgress, WorkDoneProgressCreateRequest, WorkspaceFolder } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { MmParser, MmParserEvents, ParsingProgressArgs } from './MmParser';
import { notifyError, notifyInformation, notifyWarning } from './Utils';
import * as fs from "fs";
import { formulaClassifiersExample, IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { ModelLoader } from '../stepSuggestion/ModelLoader';
import { MmStatistics } from './MmStatistics';

/** loads a new .mm file and updates the step suggestions model */
export class TheoryLoader {
	/** the path of the .mm to be loaded */
	mmFilePath: string;
	// used to notify progress, to the client
	connection: Connection;

	mmParser?: MmParser;

	constructor(mmFilePath: string, connection: Connection, private globalState: GlobalState) {
		this.mmFilePath = mmFilePath;
		this.connection = connection;
		// console.log('TheoryLoader_constructor_connection:' + this.connection);
	}

	//#region loadNewTheoryIfNeededAndThenTheStepSuggestionModel
	notifyProgress(parsingProgressArgs: ParsingProgressArgs): void {
		if (parsingProgressArgs.progressToken != undefined) {
			const strMessage: string = parsingProgressArgs.percentageOfWorkDone + '%';
			parsingProgressArgs.connection.sendProgress(WorkDoneProgress.type, parsingProgressArgs.progressToken,
				{ kind: 'report', message: strMessage });
		}
	}

	//#region loadNewTheorySync
	async getCurrentDocumentDir(): Promise<string | undefined> {
		let currentDir: string | undefined;
		const workspaceFolders: WorkspaceFolder[] | null = await this.connection.workspace.getWorkspaceFolders();
		if (workspaceFolders != null) {
			const workspaceFolder: WorkspaceFolder = workspaceFolders[0];
			const workspaceFolderUri: string = workspaceFolder.uri;
			currentDir = url.fileURLToPath(workspaceFolderUri);
		}
		return currentDir;
	}

	//#region loadNewTheorySync
	removeTheCurrentTheoryFromTheGlobalState() {
		this.globalState.mmFilePath = undefined;
		this.globalState.mmParser = undefined;
	}
	//#region loadTheoryFromMmFile
	sendDiagnostics(mmFilePath: string, diagnostics: Diagnostic[]) {
		if (diagnostics.length > 0) {
			const fileUri: string = url.pathToFileURL(mmFilePath).href;
			const publishDiagnosticsParams: PublishDiagnosticsParams = {
				diagnostics: diagnostics,
				uri: fileUri
			};
			this.connection.sendDiagnostics(publishDiagnosticsParams);
		}
	}
	async loadTheoryFromMmFile(mmFilePath: string) {
		const random: number = Math.floor(Math.random() * 1000000);
		const progressToken: string = 'TEST-PROGRESS-TOKEN' + random.toString();
		this.mmParser = new MmParser(this.globalState, progressToken);
		this.mmParser.on(MmParserEvents.parsingProgress, this.notifyProgress);
		await this.connection.sendRequest(WorkDoneProgressCreateRequest.type, { token: progressToken });
		console.log('loadNewTheoryIfNeeded_1');
		void this.connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'begin', title: 'Loading the theory...' });
		console.log('loadNewTheoryIfNeeded_2');
		this.mmParser.ParseFileSync(mmFilePath);
		let message: string;
		if (this.mmParser.parseFailed) {
			message = `The theory file ${mmFilePath} has NOT been successfully parsed. See the ` +
				`PROBLEMS tab for a list of diagnostics`;
			this.sendDiagnostics(mmFilePath, this.mmParser.diagnostics);
			notifyError(message, this.connection);
		}
		else if (this.mmParser.containsUnprovenStatements) {
			message = `The theory file ${mmFilePath} has been successfully parsed, but it contains ` +
				`unproven statements. See the PROBLEMS tab for a list of diagnostics`;
			this.sendDiagnostics(mmFilePath, this.mmParser.diagnostics);
			notifyWarning(message, this.connection);
		} else {
			message = `The theory file ${mmFilePath} has been successfully parsed and verified`;
			notifyInformation(message, this.connection);
		}
		this.globalState.mmFilePath = mmFilePath;
		this.globalState.mmParser = this.mmParser!;
		void this.connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'end', message: message });
		// void this.connection.sendProgress<WorkDoneProgressEnd>(new ProgressType<WorkDoneProgressEnd>(),
		// 	progressToken, { kind: 'end', message: message });
	}
	//#endregion loadTheoryFromMmFile
	private async loadNewTheorySync() {
		this.removeTheCurrentTheoryFromTheGlobalState();
		const currentDocumentDir: string | undefined = await this.getCurrentDocumentDir();
		let mmFilePath: string = this.mmFilePath;
		if (mmFilePath == '') {
			// the main theory mm file has not been defined
			const defaultTheory = 'set.mm';
			if (currentDocumentDir != undefined) {
				mmFilePath = path.join(currentDocumentDir, defaultTheory);
			}
		}
		const fileExist: boolean = fs.existsSync(mmFilePath);
		if (!fileExist) {
			const message = `The theory file ${mmFilePath} does not exist. Thus this extension ` +
				`cannot work properly. To fix this, either input another .mm file in the Workspace configuration ` +
				`or copy a set.mm file in ${currentDocumentDir}`;
			notifyError(message, this.connection);
		} else
			await this.loadTheoryFromMmFile(mmFilePath);
	}
	//#endregion loadNewTheorySync

	/** starts a thread to load a step suggestion model  */
	private async loadStepSuggestionModelAsync() {
		// we use GlobalState.mmFilePath instead of this.mmFilePath, because the TheoryLoader
		// might have used the default theory name, if the configuration mmFilePath is empty
		const formulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
		const modelLoader: ModelLoader = new ModelLoader(this.globalState.mmFilePath!, formulaClassifiers);
		this.globalState.stepSuggestionMap = await modelLoader.loadSuggestionsMap(this.connection);
	}

	/** checks if the current mmFilePath is different from the one stored in the GlobalState: if that's the
	 * case, then:
	 * 1. loads the new theory
	 * 2. starts the async update of the step suggestion model
	 * 3. updates statistics for the theory (TODO later)
	 * 
	 */
	async loadNewTheoryIfNeededAndThenTheStepSuggestionModel() {
		if (this.globalState.mmFilePath != this.mmFilePath && !this.globalState.loadingATheory) {
			this.globalState.loadingATheory = true;
			console.log('before loadNewTheorySync - GlobalState.mmParser = ' + this.globalState.mmParser);
			await this.loadNewTheorySync();
			//TODO consider using worker threads, I'm afraid this one is 'blocking', not really async
			console.log('after loadNewTheorySync - GlobalState.mmParser = ' + this.globalState.mmParser);
			if (this.globalState.mmParser != undefined) {
				// a theory has been succesfully loaded
				console.log('before loadStepSuggestionModelAsync');
				this.loadStepSuggestionModelAsync();
				console.log('after loadStepSuggestionModelAsync');
				console.log('before updateStatistics');
				MmStatistics.updateStatistics(this.globalState.mmParser, this.globalState);
				console.log('after updateStatistics');
				console.log('before createParseNodesForAssertions');
				console.log('this.globalState.mmParser.isParsingComplete=' + this.globalState.mmParser.isParsingComplete);
				console.log('this.globalState.mmParser.parseFailed=' + this.globalState.mmParser.parseFailed);
				this.globalState.mmParser.createParseNodesForAssertionsAsync();
				console.log('after createParseNodesForAssertions');

			}
			this.globalState.loadingATheory = false;
		}
	}
	//#endregion loadNewTheoryIfNeededAndThenTheStepSuggestionModel
}