import path = require('path');
import url = require('url');
import { Connection, WorkDoneProgress, WorkDoneProgressCreateRequest, WorkspaceFolder } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { MmParser, MmParserEvents, ParsingProgressArgs } from './MmParser';
import { notifyError, notifyInformation } from './Utils';
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
	// notifyProgress(percentageOfWorkDone: number): void {
	notifyProgress(parsingProgressArgs: ParsingProgressArgs): void {
		// console.log(percentageOfWorkDone + '%');
		const strMessage: string = parsingProgressArgs.percentageOfWorkDone + '%';
		// GlobalState.connection.sendProgress(WorkDoneProgress.type, 'TEST-PROGRESS-TOKEN',
		// 	{ kind: 'report', message: strMessage });
		parsingProgressArgs.connection.sendProgress(WorkDoneProgress.type, 'TEST-PROGRESS-TOKEN',
			{ kind: 'report', message: strMessage });
	}

	//#region loadNewTheorySync
	async getCurrentDocumentDir(): Promise<string | undefined> {
		let currentDir: string | undefined;
		const workspaceFolders: WorkspaceFolder[] | null = await this.connection.workspace.getWorkspaceFolders();
		if (workspaceFolders != null) {
			const workspaceFolder: WorkspaceFolder = workspaceFolders[0];
			const workspaceFolderUri: string = workspaceFolder.uri;
			// currentDir = workspaceFolder.name;
			currentDir = url.fileURLToPath(workspaceFolderUri);
			// url.pathToFileURL(path);
			// currentDir = path.dirname(workspaceFolderUri);
			// const workSpaceDir: string = path.dirname(workspaceFolder.uri);
		}
		return currentDir;
	}

	//#region loadNewTheorySync
	removeTheCurrentTheoryFromTheGlobalState() {
		this.globalState.mmFilePath = undefined;
		this.globalState.mmParser = undefined;
	}
	async loadTheoryFromMmFile(mmFilePath: string) {
		this.mmParser = new MmParser(this.globalState);
		// this.mmParser.progressListener = this.notifyProgress;
		this.mmParser.on(MmParserEvents.parsingProgress, this.notifyProgress);
		const progressToken = 'TEST-PROGRESS-TOKEN';
		await this.connection.sendRequest(WorkDoneProgressCreateRequest.type, { token: progressToken });
		console.log('loadNewTheoryIfNeeded_1');
		void this.connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'begin', title: 'Loading the theory...' });
		console.log('loadNewTheoryIfNeeded_2');
		// this.mmParser.ParseFileSync(this.mmFilePath);
		this.mmParser.ParseFileSync(mmFilePath);
		let message: string;
		if (this.mmParser.parseFailed) {
			// message = `The theory file ${this.mmFilePath} has NOT been successfully parsed`;
			message = `The theory file ${mmFilePath} has NOT been successfully parsed`;
			notifyError(message, this.connection);
		}
		else {
			this.globalState.mmFilePath = mmFilePath;
			this.globalState.mmParser = this.mmParser!;
			message = `The theory file ${mmFilePath} has been successfully parsed`;
			notifyInformation(message, this.connection);
		}
		void this.connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'end', message: message });
	}
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
		// const modelBuilder: ModelBuilder = new ModelBuilder(GlobalState.mmFilePath!, formulaClassifiers);
		// GlobalState.stepSuggestionMap = await modelBuilder.loadSuggestionsMap(this.connection);
		const modelLoader: ModelLoader = new ModelLoader(this.globalState.mmFilePath!, formulaClassifiers);
		this.globalState.stepSuggestionMap = await modelLoader.loadSuggestionsMap(this.connection);
	}

	/** starts a thread to build the statistics for the current theory  */
	private async updateStatistics() {
		if (this.mmParser != undefined) {
			const mmStatistics: MmStatistics = new MmStatistics(this.mmParser);
			mmStatistics.buildStatistics();
			this.globalState.mmStatistics = mmStatistics;
		}
	}

	/** checks if the current mmFilePath is different from the one stored in the GlobalState: if that's the
	 * case, then:
	 * 1. loads the new theory
	 * 2. starts the async update of the step suggestion model
	 * 3. updates statistics for the theory (TODO later)
	 * 
	 */
	async loadNewTheoryIfNeededAndThenTheStepSuggestionModel() {
		if (this.globalState.mmFilePath != this.mmFilePath) {
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
				this.updateStatistics();
				console.log('after updateStatistics');
				console.log('before createParseNodesForAssertions');
				this.globalState.mmParser.createParseNodesForAssertionsAsync();
				console.log('after createParseNodesForAssertions');

			}
		}
	}
	//#endregion loadNewTheoryIfNeededAndThenTheStepSuggestionModel
}