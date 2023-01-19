import { Connection, Range, TextEdit, TextEditChange, WorkspaceChange } from 'vscode-languageserver';

export interface ISearchCompletionItemCommandParameters {
	uri: string;
	searchStatementRangeStartLine: number;
	searchStatementRangeEndLine: number;
	label: string;
	lineToInsertTheLabel: number
}

export class SearchCompletionItemSelectedHandler {
	searchCompletionItemCommandParameters: ISearchCompletionItemCommandParameters;
	connection: Connection;
	constructor(searchCompletionItemCommandParameters: ISearchCompletionItemCommandParameters,
		connection: Connection) {
		this.searchCompletionItemCommandParameters = searchCompletionItemCommandParameters;
		this.connection = connection;
	}

	//#region deleteSearchStatement
	suggestCursorPosition() {
		// const labelLine: number = this.searchCompletionItemCommandParameters.searchStatementRangeStartLine - 1;
		// const labelLine: number = this.searchCompletionItemCommandParameters.lineToInsertTheLabel;
		// const labelLength: number = this.searchCompletionItemCommandParameters.label.length;
		// const rangeForCursor: Range = Range.create(labelLine, labelLength, labelLine, labelLength + 1);
		// GlobalState.setSuggestedRangeForCursorPosition(rangeForCursor);
	}
	deleteSearchStatement() {
		// for rangeToDelete we add one line, because the label has been added above, in the meanwhile,
		// thus, the SearchStatement to be deleted is one line below, respect when the Command was created
		const rangeToDelete: Range = Range.create(this.searchCompletionItemCommandParameters.searchStatementRangeStartLine + 1, 0,
			this.searchCompletionItemCommandParameters.searchStatementRangeEndLine + 2, 0);
		const textEdit: TextEdit = TextEdit.del(rangeToDelete);
		const workspaceChange: WorkspaceChange = new WorkspaceChange();
		const textEditChange: TextEditChange = workspaceChange.getTextEditChange(
			this.searchCompletionItemCommandParameters.uri);
		textEditChange.add(textEdit);
		this.connection.workspace.applyEdit(workspaceChange.edit);
		this.suggestCursorPosition();
	}
	//#endregion deleteSearchStatement
}