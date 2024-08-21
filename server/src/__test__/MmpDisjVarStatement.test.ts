import { MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { elexdMmParser, kindToPrefixMap } from './GlobalForTest.test';
import { MmpDisjVarStatement } from '../mmp/MmpDisjVarStatement';
import { MmToken } from '../grammar/MmLexer';


test('Disj Vars edge clique cover 1', () => {
	const mmpSource = `\
* test comment

qed:: |- ch
$d y z
$d x y
$d x z
$d y z
`;

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
	const mmpSource = `\
* test comment

qed:: |- ch
$d x y
$d y z
$d x z
$d z v
$d y z
`;

	const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpDisjVarStatements: MmpDisjVarStatement[] =
		MmpDisjVarStatement.buildEdgeCliqueCover(mmpParser.mmpProof!.disjVarMmpStatements);
	expect(mmpDisjVarStatements.length).toBe(2);
	const disjointVars0: MmToken[] = mmpDisjVarStatements[0].disjointVars;
	expect(disjointVars0.length).toBe(2);
	expect(disjointVars0[0].value).toBe('v');
	expect(disjointVars0[1].value).toBe('z');
	const disjointVars1: MmToken[] = mmpDisjVarStatements[1].disjointVars;
	expect(disjointVars1.length).toBe(3);
	expect(disjointVars1[0].value).toBe('x');
	expect(disjointVars1[1].value).toBe('y');
	expect(disjointVars1[2].value).toBe('z');
});

test('Disj Vars edge clique cover 3', () => {
	// $d ph x $. $d k x $. $d k ph $. $d j x $. $d j k $.
	// $d F x $. $d F k $. $d A x $. $d A k $. $d A j $.

	// whereas mmj2 produces

	// $d A j k x $. $d F k x $. $d k ph x $.
const mmpSource = `
* test comment

qed:: |- ch
$d ph x
$d k x
$d k ph
$d j x
$d j k
$d F x
$d F k
$d A x
$d A k
$d A j
`;

	const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpDisjVarStatements: MmpDisjVarStatement[] =
		MmpDisjVarStatement.buildEdgeCliqueCover(mmpParser.mmpProof!.disjVarMmpStatements);
	expect(mmpDisjVarStatements.length).toBe(3);
	const disjointVars0: MmToken[] = mmpDisjVarStatements[0].disjointVars;
	expect(disjointVars0.length).toBe(4);
	expect(disjointVars0[0].value).toBe('A');
	expect(disjointVars0[1].value).toBe('j');
	expect(disjointVars0[2].value).toBe('k');
	expect(disjointVars0[3].value).toBe('x');
	const disjointVars1: MmToken[] = mmpDisjVarStatements[1].disjointVars;
	expect(disjointVars1.length).toBe(3);
	expect(disjointVars1[0].value).toBe('F');
	expect(disjointVars1[1].value).toBe('k');
	expect(disjointVars1[2].value).toBe('x');
	expect(disjointVars1[2].value).toBe('x');
	const disjointVars2: MmToken[] = mmpDisjVarStatements[2].disjointVars;
	expect(disjointVars2.length).toBe(3);
	expect(disjointVars2[0].value).toBe('k');
	expect(disjointVars2[1].value).toBe('ph');
});

