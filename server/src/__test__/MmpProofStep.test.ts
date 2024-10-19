import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from '../mmp/MmpProofStep';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap, eqeq1iMmParser } from './GlobalForTest.test';

test('Expect hasWorkingVar', () => {
	const mmpSource = `\
1:: |- &W2
2:: |- ( ph -> ( ps -> &W2 ) )
qed:1,2:ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofStep: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[1];
	expect(mmpProofStep.stepRef).toBe("2");
	expect(mmpProofStep.hasWorkingVars).toBeTruthy();
});

test('Expect !hasWorkingVar', () => {
	const mmpSource = `\
1:: |- &W2
2:: |- ( ph -> ( ps -> ps ) )
qed:1,2:ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofStep: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[1];
	expect(mmpProofStep.stepRef).toBe("2");
	expect(mmpProofStep.hasWorkingVars).toBeFalsy();
});

test('Expect hasWorkingVar 2', () => {
	const mmpSource = `\
1:: |- &W2
2:: |- ( ( ph /\\ ps ) -> &C2 = A )
qed:1,2:ax-mp |- ph`;
	const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const mmpProofStep: MmpProofStep = <MmpProofStep>mmpParser.mmpProof?.mmpStatements[1];
	expect(mmpProofStep.stepRef).toBe("2");
	expect(mmpProofStep.hasWorkingVars).toBeTruthy();
});


