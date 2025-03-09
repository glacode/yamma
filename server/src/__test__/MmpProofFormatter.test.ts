
import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
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
	const mmpSource = `
h50::mp2.1 |- ph
h51::mp2.2 |- ps
h52::mp2.3 |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp |- ( ps -> ch )
qed:51,53:ax-mp |- ch`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpProofFormatter: TestMmpProofFormatter = new TestMmpProofFormatter(mmpParser.mmpProof!);
	mmpProofFormatter.computeIndentationLevels();
	expect(mmpParser.mmpProof?.mmpStatements.length).toBeGreaterThanOrEqual(5);
	mmpParser.mmpProof?.mmpStatements.forEach((uStatement: IMmpStatement) => {
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
	const mmpSource = `
* test comment

h50::mp2.1 |- ph
h51::mp2.2 |- ps
h52::mp2.3 |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp |- ( ps -> ch )
qed:51,53:ax-mp |- ch`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 0,
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

h50::mp2.1           |- ph
h51::mp2.2          |- ps
h52::mp2.3           |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp      |- ( ps -> ch )
qed:51,53:ax-mp    |- ch

$=    wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.

`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});