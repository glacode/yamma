import { Position, Range } from 'vscode-languageserver';
import { MmStatistics } from '../mm/MmStatistics';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { WorkingVars } from '../mmp/WorkingVars';
import { SearchCommandHandler } from '../search/SearchCommandHandler';
import { kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

/**
 * This class is used to test protected methods
 */
class TestSearchCommandHandler extends SearchCommandHandler {
	public static buildSearchStatement(maxNumberOfReturnedSymbols: number,
		currentMmpProofStep: MmpProofStep, mmStatistics: MmStatistics): string {
		return super.buildSearchStatement(maxNumberOfReturnedSymbols, currentMmpProofStep, mmStatistics);
	}
	public static computeRangeForCursor(insertPosition: Position, searchStatement: string): Range {
		return super.computeRangeForCursor(insertPosition, searchStatement);
	}
	public static positionForInsertionOfTheSearchStatement(
		cursorLine: number, currentMmpProofStep?: MmpProofStep): Position {
		return super.positionForInsertionOfTheSearchStatement(cursorLine, currentMmpProofStep);
	}
}

test("expect proper string for search command", () => {
	const mmpSource =
		'50::df-c             |- CC = ( R. X. R. )\n' +
		'51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )\n' +
		'52::          |- ( <. A , B >. e. ( R. X. R. ) <-> ( A e. R. /\\ B e. R. ) )\n' +
		'qed:51,52:bitri    |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser.labelToStatementMap,
		opelcnMmParser.outermostBlock, opelcnMmParser.grammar, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofStep52: MmpProofStep = <MmpProofStep>mmpParser.uProof?.uStatements[2];
	const mmStatistics: MmStatistics = new MmStatistics(opelcnMmParser);
	mmStatistics.buildStatistics();
	const searchStatement: string = TestSearchCommandHandler.buildSearchStatement(2, mmpProofStep52, mmStatistics);
	expect(searchStatement).toBe('SearchSymbols: R. X.   SearchComment: \n');
	const positionForInsertionAbove52: Position =
		TestSearchCommandHandler.positionForInsertionOfTheSearchStatement(2, mmpProofStep52);
	//TODO may be you will prefer to insert the search statement below the current MmpStatement
	const expectedPositionForInsertion: Position = { line: 2, character: 0 };
	expect(positionForInsertionAbove52).toEqual(expectedPositionForInsertion);
});

test("computeRangeForCursor", () => {
	const insertPosition: Position = { line: 2, character: 0 };
	const range: Range = TestSearchCommandHandler.computeRangeForCursor(insertPosition,
		'SearchSymbols: R. X.   SearchComment: \n');
	const expectedPositionForCursorStart: Position = { line: 2, character: 21 };
	expect(range.start).toEqual(expectedPositionForCursorStart);
	const expectedPositionForCursorEnd: Position = { line: 2, character: 22 };
	expect(range.end).toEqual(expectedPositionForCursorEnd);
});