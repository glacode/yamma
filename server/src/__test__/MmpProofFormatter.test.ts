
import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { MmpUnifier } from '../mmp/MmpUnifier';
import { MmpProofFormatter } from '../mmp/MmpProofFormatter';
import { IMmpStatement } from '../mmp/MmpStatement';
import { WorkingVars } from '../mmp/WorkingVars';
import { kindToPrefixMap, mp2MmParser } from './GlobalForTest.test';

class TestMmpProofFormatter extends MmpProofFormatter {
	public computeIndentationLevels() {
		return super.computeIndentationLevels();
	}
}

test("Test MmpProofFormatter.computeIndentationLevels()", () => {
	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";

	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofFormatter: TestMmpProofFormatter = new TestMmpProofFormatter(mmpParser.uProof!);
	mmpProofFormatter.computeIndentationLevels();
	expect(mmpParser.uProof?.uStatements.length).toBeGreaterThanOrEqual(5);
	mmpParser.uProof?.uStatements.forEach((uStatement: IMmpStatement) => {
		if (uStatement instanceof MmpProofStep) {
			if (uStatement.stepRef == 'qed')
				expect(uStatement.indentationLevel).toBe(0);
			if (uStatement.stepRef == '53')
				expect(uStatement.indentationLevel).toBe(1);
			if (uStatement.stepRef == '52')
				expect(uStatement.indentationLevel).toBe(2);
			if (uStatement.stepRef == '51')
				expect(uStatement.indentationLevel).toBe(1);
			if (uStatement.stepRef == '50')
				expect(uStatement.indentationLevel).toBe(2);
		}
	});
});

test("Test simple indentation", () => {
	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";
	// const parser: MmParser = mp2MmParser;
	// parser.ParseText(mp2Theory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"h50::mp2.1           |- ph\n" +
		"h51::mp2.2          |- ps\n" +
		"h52::mp2.3           |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp      |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp    |- ch\n" +
		"\n" +
		"$=    wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.\n\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});