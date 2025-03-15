import { Diagnostic } from 'vscode-languageserver';
import { DataFieldForMissingDjVarConstraintsDiagnostic } from '../mm/DisjointVarsManager';
// import { DiagnosticForMissingDjVarConstraint } from '../mmparser/DisjointVarsManager';
import { MmParser } from '../mm/MmParser';
import { IMmpParserParams, MmpParser, MmpParserErrorCode, MmpParserWarningCode } from '../mmp/MmpParser';
import { doesDiagnosticsContain } from '../mm/Utils';
import { WorkingVars } from '../mmp/WorkingVars';
import { GlobalState } from '../general/GlobalState';
import { eqeq1iMmParser, kindToPrefixMap } from './GlobalForTest.test';
import { DisjVarAutomaticGeneration } from '../mm/ConfigurationManager';

export const theoryToTestDjVarViolation = ' $c ( $. $c ) $. $c -> $. $c wff $. $c |- $. $v ph $. $v ps $. ' +
	'wph $f wff ph $. wps $f wff ps $. wi $a wff ( ph -> ps ) $. $c A. $. $c setvar $. $c class $. ' +
	'${ $v x $. vx.cv $f setvar x $. ' +
	'cv $a class x $. $} $v x $. $v y $. vx $f setvar x $. vy $f setvar y $. ' +
	'wal $a wff A. x ph $. ${ $d x ph $. ' +
	'ax-5 $a |- ( ph -> A. x ph ) $. $}	$c e. $. ${ $v A $. $v B $. wcel.cA $f class A $. wcel.cB $f class B $. ' +
	'wcel $a wff A e. B $. $} $v A $. cA $f class A $. $v B $. cB $f class B $. ';

test("Expect Disjoint Constraint violation", () => {
	// mmj2 error
	// E-PR-0009 Theorem temp.Step qed: Step qed: Label ax-5: VerifyProof: DjVars restriction violated!
	// The step lists <ph x> as a DjVars restriction, but the substitutions share variable x. 
	const mmpSource =
		"qed:ax-5 |- ( x e. A -> A. x x e. A )";
	const parser: MmParser = new MmParser();
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: parser,
		workingVars: new WorkingVars(new Map<string, string>())
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(new Map<string, string>()));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.djVarsRestrictionViolated)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(4);
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.djVarsRestrictionViolated) {
			const errMsg = "Step qed: Label ax-5: DjVars restriction violated: \n" +
				"the step lists <ph x> as a DjVars restriction, but the substitution for ph is 'x e. A' and " +
				"the substitution for x is 'x': thus, the two substitutions share the variable x";
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line).toBe(0);
			// expect(diagnostic.range.start.character==4 || diagnostic.range.start.character==14 ||
			// 	diagnostic.range.start.character==29).toBeTruthy();
		}
	});
	expect(mmpParser.diagnostics[0].range.start.character).toBe(4);
	expect(mmpParser.diagnostics[1].range.start.character).toBe(14);
	expect(mmpParser.diagnostics[2].range.start.character).toBe(27);
});

//TODO this method returns a single pair of Diagnostic for every DjVars constraint violation.
// The reason is that we have a single substitution for every logical var: it is consistent,
// thus, in principle, we could have multiple substitutions and then a Diagnostic for violating
// var. Here's an explanatory example (see the corresponding test in DisjointVarsManager.test.ts):
// qed:ax-5 |- ( y e. A -> A. y y e. A )
// will return three constraint errors: one underlying ax-5, one underlying the first occurrence of
// y (from the substitution of ph) and one underlying the second occurrence of y (from the substitution
// of x). In principle, the third occurrence of y could also be underlined, because the second y e. A
// is yet another substitution of ph.
// You may consider adding all these diagnostics, in the future.
test("Expect y Disjoint Constraint violation", () => {
	// mmj2 error
	// E-PR-0009 Theorem temp.Step qed: Step qed: Label ax-5: VerifyProof: DjVars restriction violated!
	// The step lists <ph x> as a DjVars restriction, but the substitutions share variable x. 
	const mmpSource =
		"qed:ax-5 |- ( y e. A -> A. y y e. A )";
	const parser: MmParser = new MmParser();
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: parser,
		workingVars: new WorkingVars(new Map<string, string>())
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(new Map<string, string>()));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.djVarsRestrictionViolated)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(4);
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.djVarsRestrictionViolated) {
			const errMsg = "Step qed: Label ax-5: DjVars restriction violated: \n" +
				"the step lists <ph x> as a DjVars restriction, but the substitution for ph is 'y e. A' and " +
				"the substitution for x is 'y': thus, the two substitutions share the variable y";
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line).toBe(0);
			// expect(diagnostic.range.start.character==4 || diagnostic.range.start.character==14 ||
			// 	diagnostic.range.start.character==29).toBeTruthy();
		}
	});
	expect(mmpParser.diagnostics[0].range.start.character).toBe(4);
	expect(mmpParser.diagnostics[1].range.start.character).toBe(14);
	expect(mmpParser.diagnostics[2].range.start.character).toBe(27);
});

test("Parse Disjoint Vars", () => {
	//Step 59: Substitution (to) vars subject to DjVars restriction by proof step but
	//not listed as DjVars in theorem to be proved: [<j,ph>, <M,j>, <Z,j>]
	const mmpSource = `
qed:ax-5 |- ( y e. A -> A. x y e. A )
$d A x
$d x y`;
	const parser: MmParser = new MmParser();
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: parser,
		workingVars: new WorkingVars(new Map<string, string>())
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(new Map<string, string>()));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(mmpParser.mmpProof!.containsDjVarStatement("A", "x")).toBeTruthy();
	expect(mmpParser.mmpProof!.containsDjVarStatement("x", "y")).toBeTruthy();
	expect(mmpParser.mmpProof!.containsDjVarStatement("y", "x")).toBeTruthy();
});

test("Expect Disjoint Var automatic completion ", () => {
	//Step 59: Substitution (to) vars subject to DjVars restriction by proof step but
	//not listed as DjVars in theorem to be proved: [<j,ph>, <M,j>, <Z,j>]
	const mmpSource =
		"qed:ax-5 |- ( y e. A -> A. x y e. A )";
	const parser: MmParser = new MmParser(new GlobalState());
	parser.ParseText(theoryToTestDjVarViolation);
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: parser,
		workingVars: new WorkingVars(new Map<string, string>())
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(new Map<string, string>()));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	// expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.missingDjVarsStatement)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(2);
	const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	expect(diagnostic.code).toBe(MmpParserWarningCode.missingMandatoryDisjVarsStatement);
	expect((<DataFieldForMissingDjVarConstraintsDiagnostic>diagnostic.data).missingDisjVar1).toEqual('x');
	expect((<DataFieldForMissingDjVarConstraintsDiagnostic>diagnostic.data).missingDisjVar2).toEqual('y');
	const errMsg = "Substitution (to) vars subject to Mandatory DjVars restriction by proof step but " +
		"not listed as DjVars in theorem to be proved: <x,y>";
	expect(diagnostic.message).toEqual(errMsg);
	const diagnostic1: Diagnostic = mmpParser.diagnostics[1];
	expect(diagnostic1.code).toBe(MmpParserWarningCode.missingMandatoryDisjVarsStatement);
	const errMsg1 = "Substitution (to) vars subject to Mandatory DjVars restriction by proof step but " +
		"not listed as DjVars in theorem to be proved: <A,x>";
	expect(diagnostic1.message).toEqual(errMsg1);

	// mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
	// 	if (diagnostic.code == MmpParserWarningCode.missingDjVarsStatement) {
	// 		const errMsg = "Substitution (to) vars subject to DjVars restriction by proof step but " +
	// 		"not listed as DjVars in theorem to be proved: <x,y>";
	// 		expect(diagnostic.message).toEqual(errMsg);
	// 		expect(diagnostic.range.start.line == 0 || diagnostic.range.start.line == 1).toBeTruthy();
	// 		expect(diagnostic.range.start.character).toBe(8);
	// 		expect(diagnostic.range.end.character).toBe(11);
	// 	}
	// });
});

test("Expect Dummy Disj Var Constraint for albidv ", () => {
	const mmpSource = `\
1::elequ2            |- ( w = x -> ( z e. w <-> z e. x ) )
2:1:bibi1d          |- ( w = x -> ( ( z e. w <-> z e. y ) <-> ( z e. x <-> z e. y ) ) )
3:2:albidv         |- ( w = x -> ( A. z ( z e. w <-> z e. y ) <-> A. z ( z e. x <-> z e. y ) ) )
qed::              |- ( A. z ( z e. x <-> z e. y ) -> x = y )
`;
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.missingDjVarsStatement)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(3);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserWarningCode.missingMandatoryDisjVarsStatement)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserWarningCode.missingDummyDisjVarsStatement)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserWarningCode.missingMandatoryDisjVarsStatement) {
			const errMsg = "Substitution (to) vars subject to Mandatory DjVars restriction by proof step but " +
				"not listed as DjVars in theorem to be proved: <x,z>";
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line).toBe(2);
			expect(diagnostic.range.start.character).toBe(4);
			expect(diagnostic.range.end.line).toBe(2);
			expect(diagnostic.range.end.character).toBe(10);
		}
		if (diagnostic.code == MmpParserWarningCode.missingDummyDisjVarsStatement) {
			const errMsg = "Substitution (to) vars subject to Dummy DjVars restriction by proof step but " +
				"not listed as DjVars in theorem to be proved: <w,z>";
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line).toBe(2);
			expect(diagnostic.range.start.character).toBe(4);
			expect(diagnostic.range.end.line).toBe(2);
			expect(diagnostic.range.end.character).toBe(10);
		}
	});
});

test("Expect Mandatory Disj Var missing warning only because of DisjVarAutomaticGeneration.GenerateDummy", () => {
	const mmpSource = `\
1::elequ2            |- ( w = x -> ( z e. w <-> z e. x ) )
2:1:bibi1d          |- ( w = x -> ( ( z e. w <-> z e. y ) <-> ( z e. x <-> z e. y ) ) )
3:2:albidv         |- ( w = x -> ( A. z ( z e. w <-> z e. y ) <-> A. z ( z e. x <-> z e. y ) ) )
qed::              |- ( A. z ( z e. x <-> z e. y ) -> x = y )
`;
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap),
		disjVarAutomaticGeneration: DisjVarAutomaticGeneration.GenerateDummy
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.missingDjVarsStatement)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(2);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserWarningCode.missingMandatoryDisjVarsStatement)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserWarningCode.missingDummyDisjVarsStatement)).toBeFalsy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserWarningCode.missingMandatoryDisjVarsStatement) {
			const errMsg = "Substitution (to) vars subject to Mandatory DjVars restriction by proof step but " +
				"not listed as DjVars in theorem to be proved: <x,z>";
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line).toBe(2);
			expect(diagnostic.range.start.character).toBe(4);
			expect(diagnostic.range.end.line).toBe(2);
			expect(diagnostic.range.end.character).toBe(10);
		}
	});
});

test("Expect NO Disj Var missing warning only because of DisjVarAutomaticGeneration.GenerateAll", () => {
	const mmpSource = `\
1::elequ2            |- ( w = x -> ( z e. w <-> z e. x ) )
2:1:bibi1d          |- ( w = x -> ( ( z e. w <-> z e. y ) <-> ( z e. x <-> z e. y ) ) )
3:2:albidv         |- ( w = x -> ( A. z ( z e. w <-> z e. y ) <-> A. z ( z e. x <-> z e. y ) ) )
qed::              |- ( A. z ( z e. x <-> z e. y ) -> x = y )
`;
	const mmpParserParams : IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap),
		disjVarAutomaticGeneration: DisjVarAutomaticGeneration.GenerateAll
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.missingDjVarsStatement)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(1);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserWarningCode.missingMandatoryDisjVarsStatement)).toBeFalsy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserWarningCode.missingDummyDisjVarsStatement)).toBeFalsy();
});

