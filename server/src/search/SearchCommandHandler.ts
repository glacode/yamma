
import { Connection, Position, Range, TextEditChange, WorkspaceChange } from 'vscode-languageserver/node';
import { GlobalState } from '../general/GlobalState';
import { MmToken } from '../grammar/MmLexer';
import { MmStatistics } from '../mm/MmStatistics';
import { AssertionStatement } from '../mm/Statements';
import { oneCharacterRange } from '../mm/Utils';
import { CursorContext } from '../mmp/CursorContext';
import { MmpParser } from '../mmp/MmpParser';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { IMmpStatementWithRange } from '../mmp/UStatement';

//TODO you are defining this interface both on the client and on the server:
//see if there's a way to define it in a single place
export interface ISearchCommandParameters {
	uri: string;
	cursorLine: number;
}

export class SearchCommandHandler {
	maxNumberOfReturnedSymbols: number;
	searchCommandParameter: ISearchCommandParameters;
	connection: Connection;
	mmpParser?: MmpParser;
	mmStatistics?: MmStatistics;
	constructor(maxNumberOfReturnedSymbols: number, searchCommandParameter: ISearchCommandParameters,
		connection: Connection, mmpParser?: MmpParser, mmStatistics?: MmStatistics) {
		this.maxNumberOfReturnedSymbols = maxNumberOfReturnedSymbols;
		this.searchCommandParameter = searchCommandParameter;
		this.connection = connection;
		this.mmpParser = mmpParser;
		this.mmStatistics = mmStatistics;
	}

	//#region insertSearchStatement

	private getCurrentProofStep(): MmpProofStep | undefined {
		let currentProofStep: MmpProofStep | undefined;
		if (this.mmpParser?.uProof != undefined) {
			const mmpStatement: IMmpStatementWithRange | undefined = CursorContext.getMmpStatement(
				this.mmpParser.uProof.uStatements, this.searchCommandParameter.cursorLine);
			if (mmpStatement instanceof MmpProofStep)
				currentProofStep = mmpStatement;
		}
		return currentProofStep;
	}

	//#region insertSearchStatementBeforeStep
	// insertSearchStatementBeforeStep(insertPosition: Position) {

	//#region positionForInsertionOfTheSearchStatement
	/** if the cursor is on a MmpProofStep, it returns the line where the step begins (it could be
	 * multine); otherwise, it returns the first line after the main comment */
	protected static positionForInsertionOfTheSearchStatement(
		cursorLine: number, currentMmpProofStep?: MmpProofStep): Position {
		let line: number = cursorLine;
		if (currentMmpProofStep != undefined)
			line = currentMmpProofStep.range.start.line;
		const insertPosition: Position = { line: line, character: 0 };
		return insertPosition;
	}
	//#endregion positionForInsertionOfTheSearchStatement

	//#region buildSearchStatement

	//#region buildSymbolsString

	//#region symbolsOrderedByIncreasingPopularity

	//#region unorderedSymbols
	private static addSymbol(symbol: string,
		symbolToAssertionMap: Map<string, Set<AssertionStatement>> | undefined, symbols: Map<string, number>) {
		const assertions: Set<AssertionStatement> | undefined = symbolToAssertionMap?.get(symbol);
		let popularity = 0;
		if (assertions != undefined)
			// the symbol is in the theory's statistics
			popularity = assertions.size;
		symbols.set(symbol, popularity);
	}
	private static unorderedSymbols(currentMmpProofStep?: MmpProofStep,
		mmStatistics?: MmStatistics): Map<string, number> {
		const symbols: Map<string, number> = new Map<string, number>();
		const symbolToAssertionMap: Map<string, Set<AssertionStatement>> | undefined =
			mmStatistics?.symbolToAssertionsMap;
		if (currentMmpProofStep?.formula != undefined)
			currentMmpProofStep.formula.forEach((mmToken: MmToken) => {
				const symbol: string = mmToken.value;
				if (symbols.get(symbol) == undefined)
					// it is the first occourence of symbol in the formula
					SearchCommandHandler.addSymbol(symbol, symbolToAssertionMap, symbols);
			});
		return symbols;
	}
	//#endregion unorderedSymbols
	static symbolsOrderedByIncreasingPopularity(currentMmpProofStep?: MmpProofStep,
		mmStatistics?: MmStatistics): string[] {
		const unorderedSymbols: Map<string, number> =
			SearchCommandHandler.unorderedSymbols(currentMmpProofStep, mmStatistics);
		const orderedSymbolsMap = new Map([...unorderedSymbols.entries()].sort((a, b) => a[1] - b[1]));
		const orderedSymbols: string[] = Array.from(orderedSymbolsMap.keys());
		return orderedSymbols;
	}
	//#endregion symbolsOrderedByIncreasingPopularity
	private static symbolsString(symbolsOrderedByPopularity: string[], maxNumberOfReturnedSymbols: number) {
		let symbolsString = '';
		let i = 0;
		while (i < maxNumberOfReturnedSymbols && i < symbolsOrderedByPopularity.length) {
			const symbol: string = symbolsOrderedByPopularity[i];
			symbolsString += ' ' + symbol;
			i++;
		}
		return symbolsString;
	}
	private static buildSymbolsString(maxNumberOfReturnedSymbols: number,
		currentMmpProofStep?: MmpProofStep, mmStatistics?: MmStatistics): string {
		const symbolsOrderedByPopularity: string[] = SearchCommandHandler.symbolsOrderedByIncreasingPopularity(
			currentMmpProofStep, mmStatistics);
		const symbolsString: string = SearchCommandHandler.symbolsString(symbolsOrderedByPopularity,
			maxNumberOfReturnedSymbols);
		return symbolsString;
	}

	//#endregion buildSymbolsString
	protected static buildSearchStatement(maxNumberOfReturnedSymbols: number,
		currentMmpProofStep?: MmpProofStep, mmStatistics?: MmStatistics): string {
		const symbols: string = SearchCommandHandler.buildSymbolsString(maxNumberOfReturnedSymbols,
			currentMmpProofStep, mmStatistics);
		const searchStatement = `${MmpSearchStatement.searchSymbolsKeyword}${symbols}   ` +
			`${MmpSearchStatement.searchCommentKeyword} \n`;
		return searchStatement;
	}
	//#endregion buildSearchStatement

	private insertNewSearchStatement(insertPosition: Position, searchStatement: string) {
		const workspaceChange: WorkspaceChange = new WorkspaceChange();
		const textEditChange: TextEditChange = workspaceChange.getTextEditChange(
			this.searchCommandParameter.uri);
		textEditChange.insert(insertPosition, searchStatement);
		this.connection.workspace.applyEdit(workspaceChange.edit);
	}

	//#region setSuggestedRangeForCursorPosition
	protected static computeRangeForCursor(insertPosition: Position, searchStatement: string): Range {
		const column: number = searchStatement.indexOf(MmpSearchStatement.searchCommentKeyword);
		const position: Position = { line: insertPosition.line, character: column - 2 };
		const range: Range = oneCharacterRange(position);
		return range;
	}
	private setSuggestedRangeForCursorPosition(insertPosition: Position, searchStatement: string) {
		const range: Range | undefined = SearchCommandHandler.computeRangeForCursor(insertPosition, searchStatement);
		if (range != undefined)
			GlobalState.setSuggestedRangeForCursorPosition(range);
	}
	//#endregion setSuggestedRangeForCursorPosition

	private insertSearchStatementBeforeStep(currentMmpProofStep?: MmpProofStep,) {
		const insertPosition: Position = SearchCommandHandler.positionForInsertionOfTheSearchStatement(
			this.searchCommandParameter.cursorLine, currentMmpProofStep);
		const searchStatement: string = SearchCommandHandler.buildSearchStatement(
			this.maxNumberOfReturnedSymbols, currentMmpProofStep, this.mmStatistics);
		this.insertNewSearchStatement(insertPosition, searchStatement);
		//TODO1 try to add a GlobalState.moveCursor that you set here, 
		this.setSuggestedRangeForCursorPosition(insertPosition, searchStatement);
	}
	//#endregion insertSearchStatementBeforeStep

	public insertSearchStatement() {
		const mmpProofStep: MmpProofStep | undefined = this.getCurrentProofStep();
		this.insertSearchStatementBeforeStep(mmpProofStep);
	}
	//#endregion insertSearchStatement
}
