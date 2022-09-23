import { Connection, WorkDoneProgress, WorkDoneProgressCreateRequest } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { notifyError, notifyInformation } from '../server';
import { ModelBuilder } from '../stepSuggestion/ModelBuilder';
import { MmParser } from './MmParser';

/** loads a new .mm file and updates the step suggestions model */
export class TheoryLoader {
	/** the path of the .mm to be loaded */
	mmFilePath: string;
	// used to notify progress, to the client
	connection: Connection;

	mmParser?: MmParser;

	constructor(mmFilePath: string, connection: Connection) {
		this.mmFilePath = mmFilePath;
		this.connection = connection;
		console.log('TheoryLoader_constructor_connection:' + this.connection);
	}

	//#region loadNewTheoryIfNeededAndThenTheStepSuggestionModel
	notifyProgress(percentageOfWorkDone: number): void {
		// connection.sendProgress(WorkDoneProgress.type, 'TEST-PROGRESS-TOKEN',
		// 	{ kind: 'report', percentage: percentageOfWorkDone, message: 'Halfway!' });
		console.log(percentageOfWorkDone + '%');
		const strMessage: string = percentageOfWorkDone + '%';
		// console.log('notifyProgress_1');
		// console.log('connection:\n' + this.connection);
		// console.log('connection.sendProgress:\n' + this.connection.sendProgress.toString());
		GlobalState.connection.sendProgress(WorkDoneProgress.type, 'TEST-PROGRESS-TOKEN',
			{ kind: 'report', message: strMessage });
		GlobalState.connection.sendProgress(WorkDoneProgress.type, 'TEST-PROGRESS-TOKEN',
			{ kind: 'report', message: strMessage });
		console.log('notifyProgress_2');
		// connection.sendProgress()
	}

	private async loadNewTheorySync() {
		this.mmParser = new MmParser();
		this.mmParser.progressListener = this.notifyProgress;
		const progressToken = 'TEST-PROGRESS-TOKEN';
		await this.connection.sendRequest(WorkDoneProgressCreateRequest.type, { token: progressToken });
		console.log('loadNewTheoryIfNeeded_1');
		void this.connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'begin', title: 'Loading the theory...' });
		console.log('loadNewTheoryIfNeeded_2');
		this.mmParser.ParseFileSync(this.mmFilePath);
		let message: string;
		if (this.mmParser.parseFailed) {
			message = `The theory file ${this.mmFilePath} has NOT been successfully parsed`;
			notifyError(message, this.connection);
		}
		else {
			message = `The theory file ${this.mmFilePath} has been successfully parsed`;
			notifyInformation(message, this.connection);
		}
		void this.connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'end', message: message });
		GlobalState.mmParser = this.mmParser!;
	}

	/** starts a thread to load a step suggestion model  */
	private async loadStepSuggestionModelAsync() {
		const modelFilePath: string = ModelBuilder.buildModelFileFullPath(this.mmFilePath);
		GlobalState.stepSuggestionMap = await ModelBuilder.loadSuggestionsMap(modelFilePath);
	}

	/** checks if the current mmFilePath is different from the one stored in the GlobalState: if that's the
	 * case, then:
	 * 1. loads the new theory
	 * 2. starts the async update of the step suggestion model
	 * 3. updates statistics for the theory (TODO later)
	 * 
	 */
	async loadNewTheoryIfNeededAndThenTheStepSuggestionModel() {
		if ( GlobalState.mmFilePath != this.mmFilePath ) {
			this.loadNewTheorySync();
			//TODO consider using worker threads, I'm afraid this one is 'blocking', not really async
			this.loadStepSuggestionModelAsync();
		}
	}
	//#endregion loadNewTheoryIfNeededAndThenTheStepSuggestionModel
}