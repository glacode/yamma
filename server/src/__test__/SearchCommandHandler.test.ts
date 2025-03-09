import { Position, Range } from 'vscode-languageserver';
import { MmStatistics } from '../mm/MmStatistics';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
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
	const mmpSource = `\
50::df-c             |- CC = ( R. X. R. )
51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )
52::          |- ( <. A , B >. e. ( R. X. R. ) <-> ( A e. R. /\\ B e. R. ) )
qed:51,52:bitri    |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: opelcnMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofStep52: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[2];
	const mmStatistics: MmStatistics = new MmStatistics(opelcnMmParser);
	mmStatistics.buildStatistics();
	const searchStatement: string = TestSearchCommandHandler.buildSearchStatement(2, mmpProofStep52, mmStatistics);
	expect(searchStatement).toBe('SearchSymbols: R. X.   SearchComment: \n');
	const positionForInsertionAbove52: Position =
		TestSearchCommandHandler.positionForInsertionOfTheSearchStatement(2, mmpProofStep52);
	const expectedPositionForInsertion: Position = { line: 3, character: 0 };
	expect(positionForInsertionAbove52).toEqual(expectedPositionForInsertion);
});

test("expect no working var (or other non-defined symbol) in the generated search command", () => {
	const mmpSource = `\
50::df-c             |- CC = ( R. X. R. )
51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )
52::          |- ( <. A , B >. e. ( R. X. &WC1 ) <-> ( A e. R. /\\ B e. R. ) )
qed:51,52:bitri    |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: opelcnMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofStep52: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[2];
	const mmStatistics: MmStatistics = new MmStatistics(opelcnMmParser);
	mmStatistics.buildStatistics();
	const searchStatement: string = TestSearchCommandHandler.buildSearchStatement(2, mmpProofStep52, mmStatistics);
	expect(searchStatement).toBe('SearchSymbols: R. X.   SearchComment: \n');
	const positionForInsertionAbove52: Position =
		TestSearchCommandHandler.positionForInsertionOfTheSearchStatement(2, mmpProofStep52);
	const expectedPositionForInsertion: Position = { line: 3, character: 0 };
	expect(positionForInsertionAbove52).toEqual(expectedPositionForInsertion);
});

test("expect proper position for search command below multiline", () => {
	const mmpSource = `\
50::df-c             |- CC = ( R. X. R. )
51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )
52::          |- ( <. A , B >. e. 
                 ( R. X. R. ) <-> ( A e. R. /\\ B e. R. ) )
qed:51,52:bitri    |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: opelcnMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofStep52: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[2];
	const positionForInsertionAbove52: Position =
		TestSearchCommandHandler.positionForInsertionOfTheSearchStatement(2, mmpProofStep52);
	const expectedPositionForInsertion: Position = { line: 4, character: 0 };
	expect(positionForInsertionAbove52).toEqual(expectedPositionForInsertion);
});

test("searchstatement computeRangeForCursor", () => {
	const insertPosition: Position = { line: 2, character: 0 };
	const range: Range = TestSearchCommandHandler.computeRangeForCursor(insertPosition,
		'SearchSymbols: R. X.   SearchComment: \n');
	const expectedPositionForCursorStart: Position = { line: 2, character: 21 };
	expect(range.start).toEqual(expectedPositionForCursorStart);
	const expectedPositionForCursorEnd: Position = { line: 2, character: 22 };
	expect(range.end).toEqual(expectedPositionForCursorEnd);
});