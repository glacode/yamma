import { Connection, Position, TextEditChange, WorkspaceChange } from 'vscode-languageserver/node';

//TODO you are defining this interface both on the client and on the server:
//see if there's a way to define it in a single place
export interface ISearchCommandParameters {
	uri: string;
	cursorLine: number;
}

export class SearchCommandHandler {
	searchCommandParameter: ISearchCommandParameters;
	connection: Connection;
	constructor(searchCommandParameter: ISearchCommandParameters, connection: Connection) {
		this.searchCommandParameter = searchCommandParameter;
		this.connection = connection;
	}

	public insertSearchStatement() {
		const workspaceChange: WorkspaceChange = new WorkspaceChange();
		const textEditChange: TextEditChange = workspaceChange.getTextEditChange(
			this.searchCommandParameter.uri);
		const insertPosition: Position = { line: this.searchCommandParameter.cursorLine, character: 0 };
		textEditChange.insert(insertPosition, 'AAAAAAAAAA\n');
		this.connection.workspace.applyEdit(workspaceChange.edit);
	}
}
