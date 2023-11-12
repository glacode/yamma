import { BlockStatement } from "../mm/BlockStatement";
import { Frame } from "../mm/Frame";
import { AxiomStatement } from "../mm/AxiomStatement";
import { ProvableStatement } from "../mm/ProvableStatement";
import { AreArrayTheSame, dummyRange, dummyToken, splitToTokensDefault } from "../mm/Utils";
import { Verifier } from "../mm/Verifier";
import { FHyp } from '../mm/FHyp';
import { Range } from 'vscode-languageserver';

test("stack manipulation in the verification process. Step 5 at page 137 of the Metamath book",
    () => {
        const outerBlock = new BlockStatement();
        outerBlock.add_v("p");
        outerBlock.add_v("q");
        outerBlock.add_v("r");
        outerBlock.add_v("s");
        outerBlock.add_c('wff');
        const wp = new FHyp(dummyToken("wp"), splitToTokensDefault("wff p"), outerBlock);
        outerBlock.addFHyp(wp);
        // outerBlock.fHyps.push(wp);
        const wq = new FHyp(dummyToken("wq"), splitToTokensDefault("wff q"), outerBlock);
        outerBlock.addFHyp(wq);
        // outerBlock.fHyps.push(wq);
        const wr = new FHyp(dummyToken("wpr"), splitToTokensDefault("wff r"), outerBlock);
        outerBlock.addFHyp(wr);
        // outerBlock.fHyps.push(wr);
        const ws = new FHyp(dummyToken("wcs"), splitToTokensDefault("wff s"), outerBlock);
        outerBlock.addFHyp(ws);
        // outerBlock.fHyps.push(ws);
        const provableStatement: ProvableStatement = new ProvableStatement(dummyToken("label1"), [], outerBlock);
        const stat = new AxiomStatement(dummyToken("w2"), splitToTokensDefault("wff ( p -> q )"), outerBlock);
        Frame.createFrame(stat);
        const stack: string[][] = [["wff", "s"], ["wff", "(", "r", "->", "p", ")"]];
        const verifier: Verifier = new Verifier([]);
        verifier.verifyAssertionStatement(provableStatement, stat, stack);
        expect(stack.length).toBe(1);
        const areEqual = AreArrayTheSame(stack[0], ["wff", "(", "s", "->", "(", "r", "->", "p", ")", ")"]);
        expect(areEqual).toBe(true);
    }
);

test("checkSubstitutionForStakEHyps1 for ax-mp",
    () => {
        // const outerBlock = new BlockStatement();
        const eHypInTheStack: string[] = ["|-", "(", "ph", "->", "(", "ps", "->", "ch", ")", ")"];
        const frameEHyp: string[] = ["|-", "(", "ph", "->", "ps", ")"];

        const substitution: Map<string, string[]> = new Map<string, string[]>();
        substitution.set("ph", ["ph"]);
        substitution.set("ps", ["(", "ps", "->", "ch", ")"]);

        const verifier: Verifier = new Verifier([]);
        const range: Range = dummyRange;
        const areTheSame = verifier.checkSubstitutionForStakEHyps1(
            eHypInTheStack, frameEHyp, substitution, range);
        expect(areTheSame).toBe(true);
    }
);