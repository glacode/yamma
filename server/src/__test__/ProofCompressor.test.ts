import { BlockStatement } from "../mm/BlockStatement";
import { Frame } from "../mm/Frame";
import { ProofCompressor } from "../mmp/ProofCompressor";
import { Statement } from "../mm/Statements";
import { AxiomStatement } from "../mm/AxiomStatement";
import { ProvableStatement } from "../mm/ProvableStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement } from "../mm/AssertionStatement";
import { splitToTokensDefault } from '../mm/Utils';
import { FHyp } from '../mm/FHyp';
import { EHyp } from '../mm/EHyp';

//#region tests for getDecompressedIntsFromString
test("C should return [3]", () => {
    expect(
        ProofCompressor.getDecompressedIntsFromString("C")).toEqual([3]);
});
test("UT should return [40]", () => {
    expect(
        ProofCompressor.getDecompressedIntsFromString("UT")).toEqual([40]);
});
test("TTVBZUUA should return [ 20 , 20 , 42 , 0 , 121]", () => {
    expect(
        ProofCompressor.getDecompressedIntsFromString("TTVBZUUA")).toEqual([20, 20, 42, 0, 121]);
});
test("test mp2 decompressed ints", () => {
    expect(
        ProofCompressor.getDecompressedIntsFromString("BCEABCGDFHH")).toEqual(
            [2, 3, 5, 1, 2, 3, 7, 4, 6, 8, 8]);
});
test("decompressed ints for ABCZABDZBADZEDEZLODZOLDE", () => {
    const result = ProofCompressor.getDecompressedIntsFromString("ABCZABDZBADZEDEZLODZOLDE");
    expect(result).toEqual(
        [1, 2, 3, 0, 1, 2, 4, 0, 2, 1, 4, 0, 5, 4, 5, 0, 12, 15, 4, 0, 15, 12, 4, 5]);
});
//#endregion tests for getDecompressedIntsFromString

//#region  tests for getDecompressedProoflength
interface IStatementsForMp2Testing {
    outerBlock: BlockStatement,
    wph: FHyp,
    wps: FHyp,
    wch: FHyp,
    mp2_1: EHyp,
    mp2_2: EHyp,
    mp2_3: EHyp,
    wi: AssertionStatement,
    ax_mp: AssertionStatement,
    mp2: ProvableStatement
}

function mp2Statement(outerBlock: BlockStatement) {
    // const mp2Statement: ProvableStatement = new ProvableStatement("mp2", ["|-", "ch"], outerBlock);
    const mp2Statement: ProvableStatement = new ProvableStatement("mp2",
        splitToTokensDefault("|- ch"), outerBlock);
    return mp2Statement;
}

function mp2StatementMockFrame(stats: IStatementsForMp2Testing) {
    const frame: Frame = new Frame(stats.mp2);
    const fHyps: FHyp[] = [stats.wph, stats.wps, stats.wch];
    const eHyps: EHyp[] = [stats.mp2_1, stats.mp2_2, stats.mp2_3];
    Object.defineProperty(frame, 'fHyps', { value: fHyps });
    Object.defineProperty(frame, 'eHyps', { value: eHyps });
    stats.mp2.frame = frame;
    console.log("Glauco!!" + JSON.stringify(frame.fHyps));
    Object.defineProperty(stats.mp2, 'CompressedProofLabels', { value: ["wi", "ax-mp"] });
}


function testMp2Statements() {
    const outerBlock = new BlockStatement();
    const result: IStatementsForMp2Testing = {
        outerBlock: outerBlock,
        // wph: new FHyp("wph", ["wff", "ph"], outerBlock),
        // wps: new FHyp("wps", ["wff", "ps"], outerBlock),
        // wch: new FHyp("wch", ["wff", "ch"], outerBlock),
        wph: new FHyp("wph", splitToTokensDefault("wff ph"), outerBlock),
        wps: new FHyp("wps", splitToTokensDefault("wff ps"), outerBlock),
        wch: new FHyp("wch", splitToTokensDefault("wff ch"), outerBlock),
        mp2_1: new EHyp("mp2.1", [], outerBlock),
        mp2_2: new EHyp("mp2.2", [], outerBlock),
        mp2_3: new EHyp("mp2.3", [], outerBlock),
        wi: new AxiomStatement("wi", [], outerBlock),
        ax_mp: new AxiomStatement("ax-mp", [], outerBlock),
        mp2: mp2Statement(outerBlock)
    };
    mp2StatementMockFrame(result);
    return result;
}

// function testMp2BuildProvableStatement(): ProvableStatement {
//     const parentBlock: BlockStatement = new BlockStatement(null)
//     const provableStatement: ProvableStatement =
//         new ProvableStatement("mp2", ["|-", "ch"], parentBlock)
//     return provableStatement
// }
function testMp2LabelToStatementMap(testStatements: IStatementsForMp2Testing): Map<string, LabeledStatement> {
    const result = new Map<string, LabeledStatement>();
    // const outerBlock = new BlockStatement(null);
    result.set("wi",testStatements.wi);
    result.set("ax-mp",testStatements.ax_mp);
    // result.set("wi", new AxiomStatement("wi", [], outerBlock));
    // result.set("ax-mp", new AxiomStatement("ax-mp", [], outerBlock));
    return result;
}
function testMp2ExpectedDecompressedProof(testStatements: IStatementsForMp2Testing):
    Statement[] {
    const result: Statement[] = [];
    result.push(testStatements.wps);
    result.push(testStatements.wch);
    result.push(testStatements.mp2_2);
    result.push(testStatements.wph);
    result.push(testStatements.wps);
    result.push(testStatements.wch);
    result.push(testStatements.wi);
    result.push(testStatements.mp2_1);
    result.push(testStatements.mp2_3);
    result.push(testStatements.ax_mp);
    result.push(testStatements.ax_mp);

    return result;
}
/*
MM> show statement mp2 /full
Statement 56 is located on line 12740 of the file "set.mm".  Its statement
number for HTML pages is 9.
"A double modus ponens inference.  (Contributed by NM, 5-Apr-1994.)"
56 mp2 $p |- ch $= ... $.
Its mandatory hypotheses in RPN order are:
  wph $f wff ph $.
  wps $f wff ps $.
  wch $f wff ch $.
  mp2.1 $e |- ph     const testStatements = testMp2Statements()$.
  mp2.2 $e |- ps $.
  mp2.3 $e |- ( ph -> ( ps -> ch ) ) $.
Its optional hypotheses are:  wth wta wet wze wsi wrh wmu wla wka
The statement and its hypotheses require the variables:  ch ph ps
These additional variables are allowed in its proof:  th ta et ze si rh mu la
      ka
The variables it contains are:  ch ph ps
*/
test("mocking to test mp2 in set.mm", () => {
    const testStatements = testMp2Statements();
    const provableStatement: ProvableStatement = testStatements.mp2;
    const labelToStatementMap = testMp2LabelToStatementMap(testStatements);
    const expectedDecompressedProof = testMp2ExpectedDecompressedProof(testStatements);
    const proofCompressor: ProofCompressor = new ProofCompressor();
    const decompressedProof: Statement[] =
    proofCompressor.getDecompressedProof(provableStatement,
            [2, 3, 5, 1, 2, 3, 7, 4, 6, 8, 8], labelToStatementMap);
    expect(
        decompressedProof).toEqual(expectedDecompressedProof);
});

//#endregion test for getDecompressedProof
