import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap, impbiiMmParser } from './GlobalForTest.test';

test('Complete eHyps labels 1', () => {
	const mmpSource =
		'$theorem example\n' +
		'\n* test comment\n\n' +
		'hd2::  |- ph\n' +
		'h3::   |- ( ps -> ph )\n' +
		'hd1:   |- ch\n' +
		'qed::  |- ps\n';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{ mmpParser: mmpParser, proofMode: ProofMode.normal, maxNumberOfHypothesisDispositionsForStepDerivation: 0 });
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'$theorem example\n' +
		'\n* test comment\n\n' +
		'hd2::example.1     |- ph\n' +
		'h3::example.2      |- ( ps -> ph )\n' +
		'hd1::example.3     |- ch\n' +
		'qed::              |- ps\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Complete eHyps labels 2', () => {
	const mmpSource =
		'$theorem example\n' +
		'\n* test comment\n\n' +
		'hd2::a  |- ph\n' +
		'h3::example.aa   |- ( ps -> ph )\n' +
		'hd1:   |- ch\n' +
		'qed::  |- ps\n';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{ mmpParser: mmpParser, proofMode: ProofMode.normal, maxNumberOfHypothesisDispositionsForStepDerivation: 0 });
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'$theorem example\n' +
		'\n* test comment\n\n' +
		'hd2::a             |- ph\n' +
		'h3::example.aa     |- ( ps -> ph )\n' +
		'hd1::example.1     |- ch\n' +
		'qed::              |- ps\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('Complete eHyps labels 3', () => {
	const mmpSource =
		'$theorem example\n' +
		'\n* test comment\n\n' +
		'hd2::  |- ph\n' +
		'h3::example.1   |- ( ps -> ph )\n' +
		'hd1:   |- ch\n' +
		'qed::  |- ps\n';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{ mmpParser: mmpParser, proofMode: ProofMode.normal, maxNumberOfHypothesisDispositionsForStepDerivation: 0 }
	);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'$theorem example\n' +
		'\n* test comment\n\n' +
		'hd2::example.1     |- ph\n' +
		'h3::example.2      |- ( ps -> ph )\n' +
		'hd1::example.3     |- ch\n' +
		'qed::              |- ps\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('expect no renumbering for existing theorem', () => {
	// notice that in impbii.mm we have on purpose changed
	// the hyp from mp2.1 to mp2.0 (in order to perform this unit test)
	const mmpSource =
		'$theorem mp2\n' +
		'\n* test comment\n\n' +
		'h1::mp2.0            |- ph\n' +
		'h2::mp2.2           |- ps\n' +
		'h3::mp2.3            |- ( ph -> ( ps -> ch ) )\n' +
		'4:1,3:ax-mp\n' +
		'qed:2,4:ax-mp      |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(
		{ mmpParser: mmpParser, proofMode: ProofMode.normal, maxNumberOfHypothesisDispositionsForStepDerivation: 0 }
	);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const newTextExpected =
		'$theorem mp2\n' +
		'\n* test comment\n\n' +
		'h1::mp2.0            |- ph\n' +
		'h2::mp2.2           |- ps\n' +
		'h3::mp2.3            |- ( ph -> ( ps -> ch ) )\n' +
		'4:1,3:ax-mp         |- ( ps -> ch )\n' +
		'qed:2,4:ax-mp      |- ch\n';
	const textEdit: TextEdit = textEditArray[0];
	expect(textEdit.newText).toEqual(newTextExpected);
});