import { BlockStatement } from "../mm/BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { ProvableStatement } from "../mm/Statements";
import { splitToTokensDefault } from '../mm/Utils';


test("test ProvableState.Proof ", () => {
    const content: MmToken[] = splitToTokensDefault("|- ch $= ( wi ax-mp ) BCEABCGDFHH");
    const provableStatement: ProvableStatement = new ProvableStatement(
        "mp2", content, new BlockStatement());
    // const provableStatement: ProvableStatement = new ProvableStatement(
    //     "mp2", ["(", "wi", "ax-mp", ")", "BCEABCGDFHH"], new BlockStatement(null));
    const result: string[] = provableStatement.Proof;
    expect(result).toEqual(["(", "wi", "ax-mp", ")", "BCEABCGDFHH"]);
});

test("Proof labels should be 'wi' 'ax-mp' ", () => {
    const content: MmToken[] = splitToTokensDefault("|- ch $= ( wi ax-mp ) BCEABCGDFHH");
    const provableStatement: ProvableStatement = new ProvableStatement(
        "mp2", content, new BlockStatement());
    // const provableStatement: ProvableStatement = new ProvableStatement(
    //     "mp2", ["(", "wi", "ax-mp", ")", "BCEABCGDFHH"], new BlockStatement(null));
    const result: string[] = provableStatement.CompressedProofLabels;
    expect(result).toEqual(["wi", "ax-mp"]);
});

test("Proof labels should be 'wi' 'ax-mp' , even with compressed string multiline ", () => {
    const content: MmToken[] = splitToTokensDefault("|- ch $= ( wi ax-mp ) BCEABCGDFHH AERAXARF");
    const provableStatement: ProvableStatement = new ProvableStatement(
        "mp2", content, new BlockStatement());
    // const provableStatement: ProvableStatement = new ProvableStatement(
    //     "mp2", ["(", "wi", "ax-mp", ")", "BCEABCGDFHH", "AERAXARF"], new BlockStatement(null));
    const result: string[] = provableStatement.CompressedProofLabels;
    expect(result).toEqual(["wi", "ax-mp"]);
});

test("getCompressedString for a1i should be ABADCABEF", () => {
    // const statementContent = ["|-", "(", "ps", "->", "ph", ")", "$=", "(",
    //     "wi", "ax-1", "ax-mp", ")", "ABADCABEF",];
    // const compressedString: string = ProofCompressor.getCompressedString(statementContent);

    const content: MmToken[] = splitToTokensDefault("|- ( ps -> ph ) $= ( wi ax-1 ax-mp ) ABADCABEF");
    const provableStatement: ProvableStatement = new ProvableStatement(
        "xxx", content, new BlockStatement());
    const compressedString: string = provableStatement.compressedProofString;
    expect(compressedString).toBe("ABADCABEF");
});



test("Proof compressed string should be BCEABCGDFHHXDFEUIERA", () => {
    // const provableStatement: ProvableStatement = new ProvableStatement(
    //     "mp2", ["(", "wi", "ax-mp", ")", "BCEABCGDFHH", "XDFE", "UIERA"], new BlockStatement(null));
    // const compressedString = ProofCompressor.getCompressedString(provableStatement.Content);
    const content: MmToken[] = splitToTokensDefault("|- ch $= ( wi ax-mp ) BCEABCGDFHH XDFE UIERA");
    const provableStatement: ProvableStatement = new ProvableStatement(
        "mp2", content, new BlockStatement());
    // const provableStatement: ProvableStatement = new ProvableStatement(
    //     "mp2", ["(", "wi", "ax-mp", ")", "BCEABCGDFHH", "AERAXARF"], new BlockStatement(null));
    const compressedString = provableStatement.compressedProofString;
    expect(compressedString).toBe("BCEABCGDFHHXDFEUIERA");
});