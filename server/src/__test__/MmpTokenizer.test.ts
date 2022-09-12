import { MmpTokenizer } from '../mmp/MmpTokenizer';

const mmptext = "* A double modus ponens inference.\n" +
	"h50::mp2.1           |- ph\n" +
	"h51::mp2.2          |- ps\n" +
	"h52::mp2.3           |-\n" +
	" ( ph -> ( ps -> ch ) )\n" +
	"53:50,52:ax-mp      |- ( ps -> ch )\n" +
	"qed:51,53:ax-mp    |- ch\n";

test("tokenizer constructor", () => {
	const mmpTokenizer : MmpTokenizer = new MmpTokenizer(mmptext);	
	expect(mmpTokenizer.tokens[6]).toEqual("h50::mp2.1");
	expect(mmpTokenizer.tokenRow[6]).toBe(1);
	expect(mmpTokenizer.tokenColumn[6]).toBe(0);
});