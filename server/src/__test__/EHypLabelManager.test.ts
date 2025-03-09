import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { IMmpParserParams, MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap, impbiiMmParser } from './GlobalForTest.test';

test('Complete eHyps labels 1', () => {
	const mmpSource = `\
$theorem example

* test comment

hd2::  |- ph
h3::   |- ( ps -> ph )
hd1:   |- ch
qed::  |- ps
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
	const newTextExpected = `\
$theorem example

* test comment

hd2::example.1     |- ph
h3::example.2      |- ( ps -> ph )
hd1::example.3     |- ch
qed::              |- ps
`;

	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Complete eHyps labels 2', () => {
	const mmpSource = `\
$theorem example

* test comment

hd2::a  |- ph
h3::example.aa   |- ( ps -> ph )
hd1:   |- ch
qed::  |- ps
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
	const newTextExpected = `\
$theorem example

* test comment

hd2::a             |- ph
h3::example.aa     |- ( ps -> ph )
hd1::example.1     |- ch
qed::              |- ps
`;

	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Complete eHyps labels 3', () => {
	const mmpSource = `\
$theorem example

* test comment

hd2::  |- ph
h3::example.1   |- ( ps -> ph )
hd1:   |- ch
qed::  |- ps
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
	const newTextExpected = `\
$theorem example

* test comment

hd2::example.1     |- ph
h3::example.2      |- ( ps -> ph )
hd1::example.3     |- ch
qed::              |- ps
`;
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('expect no renumbering for existing theorem', () => {
	// notice that in impbii.mm we have on purpose changed
	// the hyp from mp2.1 to mp2.0 (in order to perform this unit test)
	const mmpSource = `\
$theorem mp2

* test comment

h1::mp2.0            |- ph
h2::mp2.2            |- ps
h3::mp2.3            |- ( ph -> ( ps -> ch ) )
4:1,3:ax-mp
qed:2,4:ax-mp       |- ch
`;
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
	const newTextExpected = `\
$theorem mp2

* test comment

h1::mp2.0            |- ph
h2::mp2.2           |- ps
h3::mp2.3            |- ( ph -> ( ps -> ch ) )
4:1,3:ax-mp         |- ( ps -> ch )
qed:2,4:ax-mp      |- ch
`;

	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});