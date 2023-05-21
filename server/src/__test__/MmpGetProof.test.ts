import { MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { kindToPrefixMap, impbiiMmParser } from './GlobalForTest.test';
import { MmpProof } from '../mmp/MmpProof';
import { IMmpStatement } from '../mmp/MmpStatement';
import { MmpGetProofStatement } from '../mmp/MmpGetProofStatement';

test('expect fourth statement to be a MmpGetProof', () => {
	const mmpSource: string =
		'\n* test comment\n\n' +
		'h50::hyp1 |- ps\n' +
		'h51::hyp2 |- ph\n' +
		'$getproof id\n' +
		'qed:50,51:ax-mp |- ph';
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProof: MmpProof = mmpParser.mmpProof!;
	const mmpStatement: IMmpStatement = mmpProof.mmpStatements[3];
	expect(mmpStatement instanceof MmpGetProofStatement).toBeTruthy();
});