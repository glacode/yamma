import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2MmParser, kindToPrefixMap } from './GlobalForTest.test';

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
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
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
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
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