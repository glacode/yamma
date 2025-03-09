import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { impbiiMmParser, kindToPrefixMap } from './GlobalForTest.test';

test('expect proper renumbering', () => {
	const mmpSource = `
* test comment

h50: |- ps
a::a1i |- &W1
qed:: |- ch`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{
			mmpParser: mmpParser, proofMode: ProofMode.normal,
			maxNumberOfHypothesisDispositionsForStepDerivation: 0,
			renumber: true,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

h1::               |- ps
2::                 |- &W2
3:2:a1i            |- ( &W3 -> &W2 )
qed::              |- ch
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});