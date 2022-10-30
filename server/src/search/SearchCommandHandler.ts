import { Connection, Position, TextEditChange, WorkspaceChange } from 'vscode-languageserver/node';
import { MmToken } from '../grammar/MmLexer';
import { CursorContext } from '../mmp/CursorContext';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from '../mmp/MmpStatements';

//TODO you are defining this interface both on the client and on the server:
//see if there's a way to define it in a single place
export interface ISearchCommandParameters {
	uri: string;
	cursorLine: number;
}

export class SearchCommandHandler {
	searchCommandParameter: ISearchCommandParameters;
	mmpParser?: MmpParser;
	connection: Connection;
	constructor(searchCommandParameter: ISearchCommandParameters, connection: Connection, mmpParser?: MmpParser) {
		this.searchCommandParameter = searchCommandParameter;
		this.connection = connection;
		this.mmpParser = mmpParser;
	}

	//#region insertSearchStatement

	private getCurrentProofStep(): MmpProofStep | undefined {
		let currentProofStep: MmpProofStep | undefined;
		if (this.mmpParser?.uProof != undefined)
			currentProofStep = CursorContext.getMmpProofStep(this.mmpParser.uProof.uStatements,
				this.searchCommandParameter.cursorLine);
		return currentProofStep;
	}

	//#region insertSearchStatementBeforeStep
	// insertSearchStatementBeforeStep(insertPosition: Position) {

	//#region positionForInsertionOfTheSearchStatement
	/** if the cursor is on a MmpProofStep, it returns the line where the step begins (it could be
	 * multine); otherwise, it returns the first line after the main comment */
	private positionForInsertionOfTheSearchStatement(currentMmpProofStep?: MmpProofStep): Position {
		let line: number = this.searchCommandParameter.cursorLine;
		if (currentMmpProofStep != undefined)
			line = currentMmpProofStep.range.start.line;
		const insertPosition: Position = { line: line, character: 0 };
		return insertPosition;
	}
	//#endregion positionForInsertionOfTheSearchStatement

	//#region buildSearchStatement

	//#region buildSymbolsString
	buildSymbolsString(currentMmpProofStep: MmpProofStep | undefined): string {
		let symbolsString = '';
		const alreadyAddedSymbols: Set<string> = new Set<string>();
		if (currentMmpProofStep?.formula != undefined)
			currentMmpProofStep.formula.forEach((mmToken: MmToken) => {
				const symbol: string = mmToken.value;
				if (!alreadyAddedSymbols.has(symbol)) {
					symbolsString += ' ' + symbol;
					alreadyAddedSymbols.add(symbol);
				}

			});
		return symbolsString;
	}
	//#endregion buildSymbolsString
	private buildSearchStatement(currentMmpProofStep: MmpProofStep | undefined): string {
		const symbols: string = this.buildSymbolsString(currentMmpProofStep);
		const searchStatement = `$SearchSymbols: ${symbols}  SearchComments: \n`;
		return searchStatement;
	}
	//#endregion buildSearchStatement

	insertNewSearchStatement(insertPosition: Position, searchStatement: string) {
		const workspaceChange: WorkspaceChange = new WorkspaceChange();
		const textEditChange: TextEditChange = workspaceChange.getTextEditChange(
			this.searchCommandParameter.uri);
		textEditChange.insert(insertPosition, searchStatement);
		this.connection.workspace.applyEdit(workspaceChange.edit);
	}

	insertSearchStatementBeforeStep(currentMmpProofStep?: MmpProofStep) {
		const insertPosition: Position = this.positionForInsertionOfTheSearchStatement(currentMmpProofStep);
		const searchStatement: string = this.buildSearchStatement(currentMmpProofStep);
		this.insertNewSearchStatement(insertPosition, searchStatement);
	}
	//#endregion insertSearchStatementBeforeStep

	public insertSearchStatement() {
		const mmpProofStep: MmpProofStep | undefined = this.getCurrentProofStep();
		this.insertSearchStatementBeforeStep(mmpProofStep);
	}
	//#endregion insertSearchStatement
}
