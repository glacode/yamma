import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { kindToPrefixMap, impbiiMmParser } from './GlobalForTest.test';
import { MmpProof } from '../mmp/MmpProof';
import { IMmpStatement } from '../mmp/MmpStatement';
import { MmpGetProofStatement } from '../mmp/MmpGetProofStatement';

test('expect fourth statement to be a MmpGetProof', () => {
const mmpSource = `
* test comment

h50::hyp1 |- ps
h51::hyp2 |- ph
$getproof id
qed:50,51:ax-mp |- ph`;
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProof: MmpProof = mmpParser.mmpProof!;
	const mmpStatement: IMmpStatement = mmpProof.mmpStatements[3];
	expect(mmpStatement instanceof MmpGetProofStatement).toBeTruthy();
});