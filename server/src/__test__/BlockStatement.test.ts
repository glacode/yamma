//import '@types/jest'
import { BlockStatement } from "../mm/BlockStatement";
import { FHyp } from "../mm/Statements";
import { splitToTokensDefault } from '../mm/Utils';

test("lookup var",
    () => {
        const outerBlock = new BlockStatement();
        let result = outerBlock.lookup_v('ph');
        expect(result).toBe(false);
        outerBlock.add_v('ph');
        result = outerBlock.lookup_v('ph');
        expect(result).toBe(true);
        const block = new BlockStatement(outerBlock);
        result = block.lookup_v('ph');
        expect(result).toBe(true);
    }
);

test("mandatoryFHyps should be ph and ps",
    () => {
        const outerBlock = new BlockStatement();
        // const wph = new FHyp("wph", ["wff", "ph"], outerBlock);
        outerBlock.add_v('ph');
        outerBlock.add_v('ps');
        outerBlock.add_v('ch');
        outerBlock.add_c('wff');
        const wph = new FHyp("wph", splitToTokensDefault( "wff ph" ), outerBlock);
        outerBlock.addFHyp(wph);
        // outerBlock.fHyps.push(wph);
        // const wps = new FHyp("wps", ["wff", "ps"], outerBlock);
        const wps = new FHyp("wps", splitToTokensDefault("wff ps"), outerBlock);
        outerBlock.addFHyp(wps);
        // outerBlock.fHyps.push(wps);
        // const wch = new FHyp("wch", ["wff", "ch"], outerBlock);
        const wch = new FHyp("wch", splitToTokensDefault("wff ch"), outerBlock);
        outerBlock.addFHyp(wch);
        // outerBlock.fHyps.push(wch);
        let result = outerBlock.mandatoryFHyps(["ph", "dd", "ch"]);
        expect(result).toEqual([wph, wch]);
        const block = new BlockStatement(outerBlock);
        result = block.mandatoryFHyps(["ph", "dd", "ch"]);
        expect(result).toEqual([wph, wch]);
    }
);

test("lookup distinct var constraint",
    () => {
        const outerBlock = new BlockStatement();
        // outerBlock.add_d(["ph","x"]); 
        outerBlock.add_d(splitToTokensDefault("ph x")); 
        const block = new BlockStatement(outerBlock);      
        // block.add_d(["ps","w"]);
        // block.add_d(["ch","z"]);
        // block.add_d(["x","X"]);
        block.add_d(splitToTokensDefault("ps w"));
        block.add_d(splitToTokensDefault("ch z"));
        block.add_d(splitToTokensDefault("x X"));
        let result = outerBlock.lookup_d("ph","x");
        expect(result).toBe(true);
        result = outerBlock.lookup_d("x","ph");
        expect(result).toBe(true);
        result = outerBlock.lookup_d("ph","y");
        expect(result).toBe(false);
        result = block.lookup_d("ph","x");
        expect(result).toBe(true);
        result = block.lookup_d("x","ph");
        expect(result).toBe(true);
        result = block.lookup_d("ph","y");
        expect(result).toBe(false);
        result = outerBlock.lookup_d("ps","w");
        expect(result).toBe(false);
        result = block.lookup_d("ps","w");
        expect(result).toBe(true);
        result = block.lookup_d("w","ps");
        expect(result).toBe(true);
        result = block.lookup_d("x","X");
        expect(result).toBe(true);
    }
);
