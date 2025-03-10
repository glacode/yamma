import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';
import { IMmpStatement } from '../mmp/MmpStatement';
import { WorkingVars } from '../mmp/WorkingVars';
import { kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

test("MmpSearchStatement 1", () => {
	const mmpSource = `\
50::df-c             |- CC = ( R. X. R. )
51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )
SearchSymbols: R. 
  X.   SearchComment: 
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
	const searchStatement: IMmpStatement | undefined = mmpParser.mmpProof?.mmpStatements[2];
	expect(searchStatement instanceof MmpSearchStatement).toBeTruthy();
	const symbolsToSearch: string[] = (<MmpSearchStatement>searchStatement).symbolsToSearch;
	expect(symbolsToSearch.length).toBe(2);
	expect(symbolsToSearch[0]).toBe('R.');
	expect(symbolsToSearch[1]).toBe('X.');
});

test("MmpSearchStatement with exact match 1", () => {
	const mmpSource = `\
50::df-c             |- CC = ( R. X. R. )
51:50:eleq2i        |- ( <. A , B >. e. CC <-> <. A , B >. e. ( R. X. R. ) )
SearchSymbols: R. 
  X.   ' <. A   , B  '   SearchComment: 
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
	const searchStatement: IMmpStatement | undefined = mmpParser.mmpProof?.mmpStatements[2];
	expect(searchStatement instanceof MmpSearchStatement).toBeTruthy();
	const symbolsToSearch: string[] = (<MmpSearchStatement>searchStatement).symbolsToSearch;
	expect(symbolsToSearch.length).toBe(6);
	expect(symbolsToSearch[0]).toBe('R.');
	expect(symbolsToSearch[1]).toBe('X.');
	const normalizedSubstringsToSearch: string[] = (<MmpSearchStatement>searchStatement).normalizedSubstringsToSearch;
	expect(normalizedSubstringsToSearch.length).toBe(1);
	expect(normalizedSubstringsToSearch[0]).toBe(' <. A , B ');
});

test("MmpSearchStatement with exact match 2 using eHyps also", () => {
	const mmpSource = `\
50::       |- ps
51:        |- ch
SearchSymbols: 
  '  { x | ph } '   ' A e. V -> '   SearchComment: 
qed::      |- ph
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: opelcnMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const searchStatement: IMmpStatement | undefined = mmpParser.mmpProof?.mmpStatements[2];
	expect(searchStatement instanceof MmpSearchStatement).toBeTruthy();
	const symbolsToSearch: string[] = (<MmpSearchStatement>searchStatement).symbolsToSearch;
	expect(symbolsToSearch.length).toBe(9);
	const normalizedSubstringsToSearch: string[] = (<MmpSearchStatement>searchStatement).normalizedSubstringsToSearch;
	expect(normalizedSubstringsToSearch.length).toBe(2);
	expect(normalizedSubstringsToSearch[0]).toBe(' { x | ph } ');
	expect(normalizedSubstringsToSearch[1]).toBe(' A e. V -> ');
});