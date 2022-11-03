import { MmpParser } from '../mmp/MmpParser';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';
import { IUStatement } from '../mmp/UStatement';
import { WorkingVars } from '../mmp/WorkingVars';
import { kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

test("MmpSearchStatement", () => {
	const mmpSource =
		'50::df-c             |- CC = ( R. X. R. )\n' +
		'51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )\n' +
		'SearchSymbols: R. \n' +
		'  X.   SearchComment: \n' +
		'52::          |- ( <. A , B >. e. ( R. X. R. ) <-> ( A e. R. /\\ B e. R. ) )\n' +
		'qed:51,52:bitri    |- ( <. A , B >. e. CC <-> ( A e. R. /\\ B e. R. ) )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser.labelToStatementMap,
		opelcnMmParser.outermostBlock, opelcnMmParser.grammar, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const searchStatement: IUStatement | undefined = mmpParser.uProof?.uStatements[2];
	expect(searchStatement instanceof MmpSearchStatement).toBeTruthy();
	const symbolsToSearch: string[] = (<MmpSearchStatement>searchStatement).symbolsToSearch;
	expect(symbolsToSearch.length).toBe(2);
	expect(symbolsToSearch[0]).toBe('R.');
	expect(symbolsToSearch[1]).toBe('X.');
});