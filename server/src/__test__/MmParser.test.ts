import { DisjointVarMap } from '../mm/DisjointVarMap';
import { MmParser, MmParserErrorCode } from "../mm/MmParser";
import { AssertionStatement, LabeledStatement, ProvableStatement } from '../mm/Statements';
import { TokenReader } from "../mm/TokenReader";
import { doesDiagnosticsContain, rebuildOriginalStringFromTokens } from '../mm/Utils';
import { vexTheoryMmParser } from './MmpProofStatement.test';
import { createMmParser, opelcnMmParser } from './GlobalForTest.test';

test("Parsing two $f statements", () => {
    const parser: MmParser = new MmParser();
    const readLines: string[] = [
        "$c wff $.",
        "$v ph $.",
        "$v ps $.",
        "wph $f wff ph $.",
        "wps $f wff ps $."
    ];
    const tokenReader: TokenReader = new TokenReader(readLines);
    parser.Parse(tokenReader);
    expect(parser.outermostBlock.fHyps.length).toBe(2);
    expect(parser.outermostBlock.fHyps[0].Variable).toBe("ph");
    expect(parser.outermostBlock.fHyps[1].Variable).toBe("ps");
});

test("Parsing two $f statements", () => {
    const parser: MmParser = new MmParser();
    const readLines: string[] = [
        "$c wff $.",
        "$v ph $.",
        "$v ps $.",
        "wph $f wff ph $.",
        "wps $f wff ps $."
    ];
    const tokenReader: TokenReader = new TokenReader(readLines);
    parser.Parse(tokenReader);
    expect(parser.outermostBlock.fHyps.length).toBe(2);
    expect(parser.outermostBlock.fHyps[0].Variable).toBe("ph");
    expect(parser.outermostBlock.fHyps[1].Variable).toBe("ps");
});

// a self-contained database containing exactly and only the axioms and theorems for ax-mp
// wi would not be needed for the theory, but we need it for the Proof Assistant (the grammar for wff is the least requirement)
export const axmpTheory = "$c ( $. $c ) $. $c -> $. $c wff $. $c |- $. $v ph $. " +
    "$v ps $. wph $f wff ph $. wps $f wff ps $.\n" +
    "wi $a wff ( ph -> ps ) $.\n" +
    "${ min $e |- ph $.  maj $e |- ( ph -> ps ) $. ax-mp $a |- ps $.  $}";

test("Parsing axmp", () => {
    const parser: MmParser = new MmParser();
    parser.ParseText(axmpTheory);
    expect(parser.diagnostics.length).toBe(0);
    expect(parser.labelToStatementMap.size).toBe(6);
});

test("Test anatomy - expect success", () => {
    const parser: MmParser = createMmParser('anatomy.mm');
    expect(parser.diagnostics.length).toBe(0);
    expect(parser.labelToStatementMap.size).toBe(6);
});

test('Test anatomy-bad1 , expect error', () => {
    // metamath.exe's error follows:
    // ?Error on line 29 of file "anatomy-bad1.mm" at statement 8, label "wnew", type
    // "$p":
    // wnew $p wff ( s -> ( r -> p ) ) $= ws wr wp w2 ws $.
    //                                                ^^
    // After proof step 5 (the last step), the RPN stack contains 3 entries: "ws"
    // (step 1), "w2" (step 4), and  "ws" (step 5).  It should contain exactly one
    // entry.
    const parser: MmParser = createMmParser('anatomy-bad1.mm');
    // expect(parser.diagnostics.length).toBe(0);
    expect(parser.parseFailed).toBeTruthy();
    expect(doesDiagnosticsContain(parser.diagnostics,
        MmParserErrorCode.stackHasMoreThanOneItemAtEndOfProof)).toBeTruthy();
    expect(doesDiagnosticsContain(parser.diagnostics,
        MmParserErrorCode.assertionProvenDoesntMatch)).toBeTruthy();
});

test("Test big-unfier ; expect success", () => {
    const parser: MmParser = createMmParser('big-unifier.mm');
    expect(parser.parseFailed).toBeFalsy();
    expect(parser.diagnostics.length).toBe(0);
    expect(parser.labelToStatementMap.size).toBe(25);
});

test("Test big-unfier-bad1 ; expect error", () => {
    // metamath.exe's error follows: (it also has further details)
    // ?Error on line 68 of file "big-unifier-bad1.mm" at statement 28, label
    // "theorem1", type "$p":
    //    FFZMPAFFZFPFQPFZFLRFFLNKMJAJNQPLAPGPMKBADCEOARLIH $.
    //                                                   ^
    // The hypotheses of statement "ax-mp" at proof step 82 cannot be unified.
    const parser: MmParser = createMmParser('big-unifier-bad1.mm');
    expect(parser.parseFailed).toBeTruthy();
    expect(doesDiagnosticsContain(parser.diagnostics,
        MmParserErrorCode.eHypDoesntMatchTheStackEntry)).toBeTruthy();
});

test("Test disjoint2-good ; expect success", () => {
    const parser: MmParser = createMmParser('disjoint2-good.mm');
    expect(parser.parseFailed).toBeFalsy();
    expect(parser.labelToStatementMap.size).toBe(8);
    const labeledStatement: AssertionStatement = <AssertionStatement>parser.labelToStatementMap.get('good');
    // const disjVars: DisjVars = labeledStatement.frame!.disjVars;
    const disjVars: DisjointVarMap = labeledStatement.frame!.disjVars;
    expect(disjVars.map.size).toBe(3);
    expect(disjVars.containsDjContraint('x', 'y')).toBeTruthy();
    expect(disjVars.containsDjContraint('x', 'z')).toBeTruthy();
    expect(disjVars.containsDjContraint('x', 'w')).toBeTruthy();
    expect(disjVars.containsDjContraint('y', 'z')).toBeTruthy();
    expect(disjVars.containsDjContraint('y', 'w')).toBeTruthy();
    expect(disjVars.containsDjContraint('z', 'w')).toBeTruthy();
    expect(disjVars.containsDjContraint('w', 'x')).toBeTruthy();
    expect(disjVars.containsDjContraint('z', 'z')).toBeFalsy();
    expect(disjVars.containsDjContraint('x', 'a')).toBeFalsy();


});

test("Test disjoint2-almostgood ; expect error", () => {
    // metamath.exe's error follows: (it also has further details)
    // ?Error on line 30 of file "disjoint2.mm" at statement 21, label "almostgood",
    // type "$p":
    // xf yf combo zf wf combo ax-1 $.
    //                         ^^^^
    // There is a disjoint variable ($d) violation at proof step 7.  Assertion "ax-1"
    // requires that variables "x" and "y" be disjoint.  But "x" was substituted with
    // "( x y )" and "y" was substituted with "( z w )".
    // Variables "x" and "z" do not have a disjoint variable requirement in the
    // assertion being proved, "almostgood".
    // Three similar messages are given for missing djsj var requirement for w,x for y,z and for w,y
    const parser: MmParser = createMmParser('disjoint2-almostgood.mm');
    expect(parser.parseFailed).toBeTruthy();
    expect(parser.diagnostics.length).toBe(4);
    expect(doesDiagnosticsContain(parser.diagnostics,
        MmParserErrorCode.missingDjVarsStatement)).toBeTruthy();
});

test("Test vex.mm; expect disj vars for axext3", () => {
    const provableStatement: ProvableStatement = <ProvableStatement>vexTheoryMmParser.labelToStatementMap.get('axext3');
    // const disjVars: DisjVars = provableStatement.frame!.disjVars;
    // $d z x w $.  $d z y w $.
    const disjVars: DisjointVarMap = provableStatement.frame!.disjVars;
    expect(disjVars.map.size).toBe(3);
    expect(disjVars.containsDjContraint('z', 'x')).toBeTruthy();
    expect(disjVars.containsDjContraint('z', 'w')).toBeTruthy();   // w is not a mandatory var
    expect(disjVars.containsDjContraint('w', 'x')).toBeTruthy();
    expect(disjVars.containsDjContraint('z', 'y')).toBeTruthy();
    expect(disjVars.containsDjContraint('y', 'w')).toBeTruthy();
    expect(disjVars.containsDjContraint('x', 'z')).toBeTruthy();
    expect(disjVars.containsDjContraint('x', 'y')).toBeFalsy();

});


test("expect opelcnParser to be successfully parsed", () => {
    // const mmpSource =
    // 	"h50::mp2.1   |- \n" +
    // 	"h51::mp2.2  |- ps\n" +
    // 	"h52::mp2.3   |- ( ph -> ( ps -> ch ) )\n" +
    // 	"53:50,52:ax-mp |- ( ps -> ch )\n" +
    // 	"qed:51,53:ax-mp |- ch";

    expect(opelcnMmParser.isParsingComplete).toBeTruthy();
    expect(opelcnMmParser.parseFailed).toBeFalsy();
});

test("expect comments to be properly assigned", () => {
    const theoryWithComments = '$c ( $. $c ) $. $c -> $. $c wff $. $c |- $. $v ph $. ' +
        '$v ps $. wph $f wff ph $. wps $f wff ps $.\n' +
        '$( If ` ph ` and ` ps ` are wff\'s, so is ` ( ph -> ps ) ` $) ' +
        'wi $a wff ( ph -> ps ) $.\n' +
        '$( Rule of Modus Ponens. Propositional\n' +
        'calculus. $)\n' +
        '${ min $e |- ph $.  maj $e |- ( ph -> ps ) $. ax-mp $a |- ps $.  $}';

    const parser: MmParser = new MmParser();
    parser.ParseText(theoryWithComments);
    expect(parser.diagnostics.length).toBe(0);
    expect(parser.labelToStatementMap.size).toBe(6);
    const wi: LabeledStatement = parser.labelToStatementMap.get('wi')!;
    const wiCommentString = rebuildOriginalStringFromTokens(wi.comment!);
    //TODO try to understand why the following line produces a space before If, while in the last expect statement below,
    // there is no space before Rule
    expect(wiCommentString).toEqual(' If ` ph ` and ` ps ` are wff\'s, so is ` ( ph -> ps ) `');
    const axmp: LabeledStatement = parser.labelToStatementMap.get('ax-mp')!;
    const axmpCommentString = rebuildOriginalStringFromTokens(axmp.comment!);
    expect(axmpCommentString).toEqual('Rule of Modus Ponens. Propositional\ncalculus.');
});
