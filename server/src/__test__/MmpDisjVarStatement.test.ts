import { MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { elexdMmParser, kindToPrefixMap } from './GlobalForTest.test';
import { MmpDisjVarStatement } from '../mmp/MmpDisjVarStatement';
import { MmToken } from '../grammar/MmLexer';


test('Disj Vars edge clique cover 1', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'qed:: |- ch\n' +
		'$d y z\n' +
		'$d x y\n' +
		'$d x z\n' +
		'$d y z\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpDisjVarStatements: MmpDisjVarStatement[] =
		MmpDisjVarStatement.buildEdgeCliqueCover(mmpParser.mmpProof!.disjVarMmpStatements);
	expect(mmpDisjVarStatements.length).toBe(1);
	const disjointVars: MmToken[] = mmpDisjVarStatements[0].disjointVars;
	expect(disjointVars.length).toBe(3);
	expect(disjointVars[0].value).toBe('x');
	expect(disjointVars[1].value).toBe('y');
	expect(disjointVars[2].value).toBe('z');
});

test('Disj Vars edge clique cover 2', () => {
	const mmpSource =
		'\n* test comment\n\n' +
		'qed:: |- ch\n' +
		'$d x y\n' +
		'$d y z\n' +
		'$d x z\n' +
		'$d z v\n' +
		'$d y z\n';
	const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpDisjVarStatements: MmpDisjVarStatement[] =
		MmpDisjVarStatement.buildEdgeCliqueCover(mmpParser.mmpProof!.disjVarMmpStatements);
	expect(mmpDisjVarStatements.length).toBe(2);
	const disjointVars0: MmToken[] = mmpDisjVarStatements[0].disjointVars;
	expect(disjointVars0.length).toBe(3);
	expect(disjointVars0[0].value).toBe('x');
	expect(disjointVars0[1].value).toBe('y');
	expect(disjointVars0[2].value).toBe('z');
	const disjointVars1: MmToken[] = mmpDisjVarStatements[1].disjointVars;
	expect(disjointVars1.length).toBe(2);
	expect(disjointVars1[0].value).toBe('v');
	expect(disjointVars1[1].value).toBe('z');
});