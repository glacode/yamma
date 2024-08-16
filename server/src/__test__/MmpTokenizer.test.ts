import { MmpTokenizer } from '../mmp/MmpTokenizer';

const mmptext = `\
* A double modus ponens inference.

h50::mp2.1           |- ph
h51::mp2.2          |- ps
h52::mp2.3           |-
 ( ph -> ( ps -> ch ) )
53:50,52:ax-mp      |- ( ps -> ch )
qed:51,53:ax-mp    |- ch
`;


test("tokenizer constructor", () => {
	const mmpTokenizer: MmpTokenizer = new MmpTokenizer(mmptext);
	expect(mmpTokenizer.tokens[6]).toEqual("h50::mp2.1");
	expect(mmpTokenizer.tokenRow[6]).toBe(1);
	expect(mmpTokenizer.tokenColumn[6]).toBe(0);
});