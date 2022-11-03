import { MmStatistics } from '../mm/MmStatistics';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from '../mmp/MmpStatements';
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
}

test("SearchCommandHandler", () => {
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
	const searchStatement: string = TestSearchCommandHandler.buildSearchStatement(2,mmpProofStep52, mmStatistics);
	expect(searchStatement).toBe('SearchSymbols: R. X.   SearchComment: \n');
});