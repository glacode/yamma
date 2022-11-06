
import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { MmpUnifier } from '../mmp/MmpUnifier';
import { UProofFormatter } from '../mmp/UProofFormatter';
import { IUStatement } from '../mmp/UStatement';
import { WorkingVars } from '../mmp/WorkingVars';
import { kindToPrefixMap, mp2MmParser } from './GlobalForTest.test';

class TestUProofFormatter extends UProofFormatter {
	public computeIndentationLevels() {
		return super.computeIndentationLevels();
	}
}

test("Test UProofFormatter.computeIndentationLevels()", () => {
	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";

	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser.labelToStatementMap,
		mp2MmParser.outermostBlock, mp2MmParser.grammar, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const uProofFormatter: TestUProofFormatter = new TestUProofFormatter(mmpParser.uProof!);
	uProofFormatter.computeIndentationLevels();
	expect(mmpParser.uProof?.uStatements.length).toBeGreaterThanOrEqual(5);
	mmpParser.uProof?.uStatements.forEach((uStatement: IUStatement) => {
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(mp2MmParser.labelToStatementMap, mp2MmParser.outermostBlock,
		mp2MmParser.grammar, new WorkingVars(kindToPrefixMap), ProofMode.normal);
	mmpUnifier.unify(mmpSource);
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		"h50::mp2.1           |- ph\n" +
		"h51::mp2.2          |- ps\n" +
		"h52::mp2.3           |- ( ph -> ( ps -> ch ) )\n" +
		"53:50,52:ax-mp      |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp    |- ch\n" +
		"\n" +
		"$=    wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.\n";
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});