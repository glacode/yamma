import { Connection, WorkDoneProgress, WorkDoneProgressCreateRequest } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { consoleLogWithTimestamp, notifyInformation } from '../mm/Utils';
import { IFormulaClassifier, formulaClassifiersExample } from '../stepSuggestion/IFormulaClassifier';
import { ModelBuilder } from '../stepSuggestion/ModelBuilder';
import { MmParserEvents, ParsingProgressArgs } from '../mm/MmParser';

export abstract class OnCreateModelHandler {

	//#region createModel
	static buildModelFileFullPath(globalState: GlobalState): string {
		const mmFilePath: string = globalState.mmFilePath!;
		const modelFileFullPath = ModelBuilder.buildModelFileFullPath(mmFilePath);
		return modelFileFullPath;
	}

	static notifyProgress(parsingProgressArgs: ParsingProgressArgs) {
		if (parsingProgressArgs.progressToken != undefined) {
			const strMessage: string = parsingProgressArgs.percentageOfWorkDone + '%';
			parsingProgressArgs.connection.sendProgress(WorkDoneProgress.type, parsingProgressArgs.progressToken,
				{ kind: 'report', message: strMessage });
		}
	}

	// public static createModel(textDocumentUri: string, connection: Connection,
	// 	documents: TextDocuments<TextDocument>, hasConfigurationCapability: boolean, globalState: GlobalState) {
	public static async createModel(connection: Connection, mmFilePath: string) {
		// const mmFilePath = '/mnt/mmt/opelcn.mm';

		consoleLogWithTimestamp('model builder start');
		const formulaClassifiers: IFormulaClassifier[] = formulaClassifiersExample();
		const random: number = Math.floor(Math.random() * 1000000);
		const progressToken: string = 'MODEL-BUILDER-PROGRESS-TOKEN' + random.toString();
		await connection.sendRequest(WorkDoneProgressCreateRequest.type, { token: progressToken });
		void connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'begin', title: 'Creating the model...' });
		const modelBuilder: ModelBuilder = new ModelBuilder(mmFilePath, formulaClassifiers, true,
			connection, progressToken);
		modelBuilder.on(MmParserEvents.parsingProgress, OnCreateModelHandler.notifyProgress);
		modelBuilder.buildModel();

		// const progressToken: string = 'TEST-PROGRESS-TOKEN' + random.toString();
		// this.mmParser.on(MmParserEvents.parsingProgress, this.notifyProgress);
		// await this.connection.sendRequest(WorkDoneProgressCreateRequest.type, { token: progressToken });
		// void this.connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'begin', title: 'Loading the theory...' });
		const modelFileFullPath: string = ModelBuilder.buildModelFileFullPath(mmFilePath);
		void connection.sendProgress(WorkDoneProgress.type, progressToken, { kind: 'end', message: 'Model created' });
		notifyInformation(`A new Model for step suggestions has been created here ${modelFileFullPath}`, connection);
	}
	//#endregion createModel


}