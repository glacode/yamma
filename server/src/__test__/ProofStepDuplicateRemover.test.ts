import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap, impbiiMmParser } from './GlobalForTest.test';

test('Remove 3rd and 4th proof steps', () => {
	const mmpSource = `
* test comment

h1::a |- ps
h2::b |- ( ps -> ph )
3:: |- ( ps -> ph )
4:: |- ( ps -> ph )
5:1,3:ax-mp |- ph
qed::d |- ps
`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
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

h1::a               |- ps
h2::b               |- ( ps -> ph )
5:1,2:ax-mp        |- ph
qed::d             |- ps
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Remove 3 after working var unification', () => {
	const mmpSource = `
* test comment

h1::a |- ps
h2::b               |- ( ps -> ph )
3:: |- &W1
5:1,3:ax-mp |- ph
qed::d |- ps
`;
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

h1::a               |- ps
h2::b               |- ( ps -> ph )
5:1,2:ax-mp        |- ph
qed::d             |- ps
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('The 4th proof step is not removed because it is proven and the 2nd proof step is not proven', () => {
	const mmpSource = `
* test comment

h1::b |- ( ps -> ph )
2:: |- ( ps -> ps )
3:: |- ( ps -> ps )
4::id |- ( ps -> ps )
qed::d |- ps
`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
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
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

h1::b              |- ( ps -> ph )
2::                |- ( ps -> ps )
4::id              |- ( ps -> ps )
qed::d             |- ps
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('The 4th proof step is removed even though it is proven, because the 2nd proof step is proven, also', () => {
	const mmpSource = `
* test comment

h1::b |- ( ps -> ph )
2::id     |- ( ps -> ps )
3:: |- ( ps -> ps )
4::id    |- ( ps -> ps )
qed::d |- ps
`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
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
			renumber: false,
			removeUnusedStatements: false
		});
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected = `
* test comment

h1::b              |- ( ps -> ph )
2::id              |- ( ps -> ps )
qed::d             |- ps
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});