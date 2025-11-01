import { Grammar, Rule } from 'nearley';
import { Diagnostic, DiagnosticSeverity, PublishDiagnosticsParams, Range } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmToken } from '../grammar/MmLexer';
import { IMmpParserParams, MmpParser, MmpParserErrorCode, MmpParserWarningCode } from '../mmp/MmpParser';
import { ProofStepFirstTokenInfo } from '../mmp/MmpStatements';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { AxiomStatement } from "../mm/AxiomStatement";
import { LabeledStatement, LabeledStatementEvents } from "../mm/LabeledStatement";
import { WorkingVars } from '../mmp/WorkingVars';
import { doesDiagnosticsContain, dummyToken } from '../mm/Utils';
import { createMmParser, elexdMmParser, eqeq1iMmParser, impbiiMmParser, kindToPrefixMap, mp2MmParser, vexTheoryMmParser } from './GlobalForTest.test';
import { IMmpStatement } from '../mmp/MmpStatement';
import { VerboseDiagnosticMessageForSyntaxError } from '../mmp/DiagnosticMessageForSyntaxError';
import { MmDiagnostic, MmParser, MmParserErrorCode } from '../mm/MmParser';
import { DiagnosticEventHandler, IDiagnosticSink } from '../mm/DiagnosticEventHandler';
import * as path from 'path';

const emptyLabelStatement = new AxiomStatement(dummyToken('x'), [], new BlockStatement());


/**
 * This class is used to test protected methods
 */
class TestMmpParser extends MmpParser {
	public createMmpStatements() {
		return super.createMmpStatements();
	}
}

function testParser(): MmpParser {
	// const mmpParser: MmpParser = new MmpParser('', new Map<string, LabeledStatement>(), new BlockStatement(), wiGrammar(),
	// 	new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: '',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser('', mp2MmParser, new WorkingVars(kindToPrefixMap));
	return mmpParser;
}

test('proofStepFirstTokenInfo',
	() => {
		// const firstToken: MmToken = new MmToken('h50::mp2.1', 5, 0);
		// const diagnostics: Diagnostic[] = [];
		const mmpParser: MmpParser = testParser();
		let firstTokenInfo: ProofStepFirstTokenInfo =
			mmpParser.proofStepFirstTokenInfo(new MmToken('h50::mp2.1', 5, 0));
		expect(firstTokenInfo.stepRef?.value).toEqual('50');
		expect(firstTokenInfo.stepRef?.line).toBe(5);
		expect(firstTokenInfo.stepRef?.column).toBe(0);
		expect(firstTokenInfo.eHypRefs).toBeUndefined;
		expect(firstTokenInfo.stepLabel?.value).toEqual('mp2.1');
		expect(firstTokenInfo.stepLabel?.line).toBe(5);
		expect(firstTokenInfo.stepLabel?.column).toBe(5);

		firstTokenInfo = mmpParser.proofStepFirstTokenInfo(new MmToken('h50::', 5, 0));
		expect(firstTokenInfo.stepLabel).toBeUndefined();
		expect(firstTokenInfo.stepRef?.value).toEqual('50');

		firstTokenInfo = mmpParser.proofStepFirstTokenInfo(new MmToken(':51,52:', 5, 0));
		expect(firstTokenInfo.stepLabel).toBeUndefined();
		expect(firstTokenInfo.stepRef).toBeDefined();
		expect(firstTokenInfo.eHypRefs?.length).toBe(2);
		expect((<MmToken[]>firstTokenInfo.eHypRefs)[0].value).toEqual('51');
		expect((<MmToken[]>firstTokenInfo.eHypRefs)[1].value).toEqual('52');

		firstTokenInfo = mmpParser.proofStepFirstTokenInfo(new MmToken('60:53,54:', 5, 0));
		expect(firstTokenInfo.stepRef?.value).toEqual('60');
		expect((<MmToken[]>firstTokenInfo.eHypRefs)[0].value).toEqual('53');
		expect((<MmToken[]>firstTokenInfo.eHypRefs)[1].value).toEqual('54');
		expect(firstTokenInfo.stepLabel).toBeUndefined;

		firstTokenInfo = mmpParser.proofStepFirstTokenInfo(new MmToken(':,:', 5, 0));
		expect(firstTokenInfo.stepRef).toBeDefined();
		expect(firstTokenInfo.stepRef.value).toBe('');
		expect(firstTokenInfo.eHypRefs?.length).toBe(2);
		expect(firstTokenInfo.stepLabel).toBeUndefined();

		firstTokenInfo = mmpParser.proofStepFirstTokenInfo(new MmToken(':,52:', 5, 0));
		expect(firstTokenInfo.stepRef).toBeUndefined;
		expect(firstTokenInfo.eHypRefs?.length).toBe(2);
		expect(firstTokenInfo.eHypRefs![0].value).toEqual('');
		expect(firstTokenInfo.eHypRefs![1].value).toEqual('52');

		firstTokenInfo = mmpParser.proofStepFirstTokenInfo(new MmToken(':51,:', 5, 0));
		expect(firstTokenInfo.stepRef).toBeUndefined;
		expect(firstTokenInfo.eHypRefs?.length).toBe(2);
		expect(firstTokenInfo.eHypRefs![0].value).toEqual('51');
		expect(firstTokenInfo.eHypRefs![1].value).toEqual('');
	}
);

test('proofStepFirstTokenInfo with hyp refs',
	() => {
		const firstToken: MmToken = new MmToken('60:53,55:mp2.1', 5, 0);
		// const diagnostics: Diagnostic[] = [];
		const mmpParser: MmpParser = testParser();
		const firstTokenInfo: ProofStepFirstTokenInfo =
			mmpParser.proofStepFirstTokenInfo(firstToken);
		expect(firstTokenInfo.stepRef?.value).toEqual('60');
		expect(firstTokenInfo.stepRef?.line).toBe(5);
		expect(firstTokenInfo.stepRef?.column).toBe(0);
		expect(firstTokenInfo.eHypRefs?.length).toBe(2);
		const secondHypref: MmToken = (<MmToken>((<MmToken[]>firstTokenInfo.eHypRefs)[1]));
		expect(secondHypref.value).toEqual('55');
		expect(secondHypref.line).toBe(5);
		expect(secondHypref.column).toBe(6);
		expect(firstTokenInfo.stepLabel?.value).toEqual('mp2.1');
		expect(firstTokenInfo.stepLabel?.line).toBe(5);
		expect(firstTokenInfo.stepLabel?.column).toBe(9);
	}
);


test('createMmpStatements', () => {
	const mmpSource = `\
* A double modus ponens inference.
h50::mp2.1           |- ph
h51::mp2.2          |- ps
h52::mp2.3           |- 
 ( ph -> ( ps -> ch ) )
53:50,52:ax-mp      |- ( ps -> ch )
qed:51,53:ax-mp    |- ch
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpStatements: IMmpStatement[] = <IMmpStatement[]>mmpParser.mmpProof?.mmpStatements;
	expect(mmpStatements.length).toBe(6);
	expect((mmpStatements[0])).toEqual(expect.objectContaining({ comment: expect.any(String) }));
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[1]).stepFormula)[0].value).toEqual('|-');
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[1]).stepFormula)[0].line).toBe(1);
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[2]).stepFormula)[1].value).toEqual('ps');
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[2]).stepFormula)[1].column).toBe(23);
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[3]).stepFormula)[6].value).toEqual('->');
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[3]).stepFormula)[0].line).toBe(3);
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[3]).stepFormula)[6].line).toBe(4);
	expect((<MmToken[]>(<MmpProofStep>mmpStatements[3]).stepFormula)[1].column).toBe(1);
});

test('diagnostic gt2colon', () => {
	// const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	// const outermostBlock: BlockStatement = new BlockStatement();
	// const mmpParser: MmpParser = new MmpParser('55:50,51:ax-mp:a |- ph', labelToStatementMap,
	// 	outermostBlock, wiGrammar(), new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: 'qed:50,51:ax-mp:a |- ph',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser('qed:50,51:ax-mp:a |- ph', mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// mmpParser.createMmpStatements(mmptext);
	expect(mmpParser.diagnostics.length).toBe(1);
	const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	expect(diagnostic.code).toEqual(MmpParserErrorCode.firstTokenWithMoreThanTwoColumns);
	const message = "The first token can contain, at most, 2 colons";
	expect(diagnostic.message).toBe(message);
	expect(diagnostic.range.start.line).toBe(0);
	expect(diagnostic.range.start.character).toBe(0);
	expect(diagnostic.range.end.character).toBe(17);
});

test('diagnostic comma	', () => {
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	// const mmpParser: TestMmpParser = new TestMmpParser('55,52:50,51:ax-mp |- ph', labelToStatementMap,
	// 	new BlockStatement(), wiGrammar(), new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55,52:50,51:ax-mp |- ph',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55,52:50,51:ax-mp |- ph', mp2MmParser, new WorkingVars(kindToPrefixMap));
	labelToStatementMap.set('ax-mp', emptyLabelStatement);
	mmpParser.createMmpStatements();
	// mmpParser.createMmpStatements(mmptext);
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(3);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.stepRefCannotContainAComma)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
	const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	expect(diagnostic.code).toEqual(MmpParserErrorCode.stepRefCannotContainAComma);
	expect(diagnostic.range.start.line).toBe(0);
	expect(diagnostic.range.start.character).toBe(0);
	expect(diagnostic.range.end.character).toBe(5);
});

test('diagnostic missing label', () => {
	// const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	// const outermostBlock: BlockStatement = new BlockStatement();
	// const mmpParser: MmpParser = new MmpParser('55::  |- ph', labelToStatementMap, outermostBlock, wiGrammar(), new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: 'qed::  |- ph',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser('qed::  |- ph', mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// mmpParser.createMmpStatements(mmptext);
	expect(mmpParser.diagnostics.length).toBe(1);
	const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	expect(diagnostic.code).toEqual(MmpParserWarningCode.missingLabel);
	expect(diagnostic.range.start.line).toBe(0);
	expect(diagnostic.range.start.character).toBe(5);
	expect(diagnostic.range.end.character).toBe(6);
});

test('diagnostic unknownLabel', () => {
	// const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	// const mmpParser: TestMmpParser = new TestMmpParser('55::idontexist  |- ph', labelToStatementMap,
	// 	new BlockStatement(), wiGrammar(), new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55::idontexist  |- ph',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55::idontexist  |- ph', mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.createMmpStatements();
	// mmpParser.createMmpStatements(mmptext);
	expect(mmpParser.diagnostics.length).toBe(1);
	const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	expect(diagnostic.code).toEqual(MmpParserErrorCode.unknownLabel);
	expect(diagnostic.range.start.line).toBe(0);
	expect(diagnostic.range.start.character).toBe(4);
	expect(diagnostic.range.end.character).toBe(14);
});

test('formula error', () => {
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	labelToStatementMap.set('ax-mp', emptyLabelStatement);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:ax-mp |- ( ph -> A )', labelToStatementMap,
	// 	new BlockStatement(), wiGrammar(), new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55:50,51:axxmp |- ( ph -> A )',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:axxmp |- ( ph -> A )', mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.createMmpStatements();
	// axxmp does not exist
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(4);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.formulaSyntaxError)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.formulaSyntaxError) {
			expect(diagnostic.code).toEqual(MmpParserErrorCode.formulaSyntaxError);
			expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(26);
			expect(diagnostic.range.end.character).toBe(27);
			expect(diagnostic.message).toBe(
				'Unexpected "A". Instead, I was expecting to see one of the following: ph ps ch (');
		}
	});
});

test('verbose formula error', () => {
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	labelToStatementMap.set('ax-mp', emptyLabelStatement);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:ax-mp |- ( ph -> A )', labelToStatementMap,
	// 	new BlockStatement(), wiGrammar(), new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55:50,51:axxmp |- ( ph -> A )',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap),
		diagnosticMessageForSyntaxError: new VerboseDiagnosticMessageForSyntaxError()
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:axxmp |- ( ph -> A )', mp2MmParser,
	// 	new WorkingVars(kindToPrefixMap), undefined, new VerboseDiagnosticMessageForSyntaxError());
	mmpParser.createMmpStatements();
	// axxmp does not exist
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(4);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.formulaSyntaxError)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.formulaSyntaxError) {
			expect(diagnostic.code).toEqual(MmpParserErrorCode.formulaSyntaxError);
			expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(26);
			expect(diagnostic.range.end.character).toBe(27);
			expect(diagnostic.message.startsWith(
				'\nUnexpected "A". Instead, I was expecting to see one of the following:\n' +
				'\n' +
				'A "ph" based on:')).toBeTruthy();
		}
	});
});

test('formula 2 error', () => {
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	labelToStatementMap.set('ax-mp', emptyLabelStatement);
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55:50,51:axxmp |- ( ph -> ( ( ps -> ch ) -> ( ch -> ) ) )',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:axxmp |- ( ph -> ( ( ps -> ch ) -> ( ch -> ) ) )',
	// 	mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.createMmpStatements();
	// axxmp does not exist
	expect(mmpParser.diagnostics.length).toBeGreaterThan(3);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.formulaSyntaxError)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.formulaSyntaxError) {
			// expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(52);
			expect(diagnostic.range.end.character).toBe(53);
		}
	});
});

test('Unexpected end of formula', () => {
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	labelToStatementMap.set('ax-mp', emptyLabelStatement);
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55:50,51:axxmp |- ( ph -> ( ( ps -> ch ) -> ( ch -> ph ) )',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:axxmp |- ( ph -> ( ( ps -> ch ) -> ( ch -> ph ) )',
	// 	mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.createMmpStatements();
	// axxmp does not exist
	expect(mmpParser.diagnostics.length).toBeGreaterThan(3);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unexpectedEndOfFormula)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.unexpectedEndOfFormula) {
			// expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(58);
			expect(diagnostic.range.end.character).toBe(59);
		}
	});
	// const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	// expect(diagnostic.code).toEqual(MmpParserErrorCode.unexpectedEndOfFormula);
	// expect(diagnostic.range.start.line).toBe(0);
	// expect(diagnostic.range.start.character).toBe(58);
	// expect(diagnostic.range.end.character).toBe(59);
});

test('Expect |- |- ph to raise an error', () => {
	// const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	// labelToStatementMap.set('ax-mp', emptyLabelStatement);
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55:50,51:axxmp |- |- ph',
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:axxmp |- |- ph', mp2MmParser,
	// 	new WorkingVars(kindToPrefixMap));
	mmpParser.createMmpStatements();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.formulaSyntaxError)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
	// axxmp does not exist
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownLabel)).toBeTruthy();
	expect(mmpParser.diagnostics.length).toBe(4);
});

test('Syntax ok', () => {
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	labelToStatementMap.set('ax-mp', emptyLabelStatement);
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55:50,51:ax-mp |- ( ph -> ( ( ps -> ch ) -> ( ch -> ph ) ) )',
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:ax-mp |- ( ph -> ( ( ps -> ch ) -> ( ch -> ph ) ) )',
	// 	mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.createMmpStatements();
	// mmpParser.createMmpStatements(mmptext);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.formulaSyntaxError)).toBeFalsy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
});

test('should be accepted |- x = A ', () => {
	const rules: Rule[] = [
		GrammarManager.CreateRule('TOP', 'provable', [{ literal: '|-' }, 'wff']),
		GrammarManager.CreateRule('vx', 'setvar', [{ literal: 'x' }]),
		GrammarManager.CreateRule('ca', 'class', [{ literal: 'A' }]),
		GrammarManager.CreateRule('cv', 'class', ['setvar']),
		GrammarManager.CreateRule('wceq', 'wff', ['class', { literal: '=' }, 'class']),
	];
	const grammar: Grammar = new Grammar(rules);
	// grammar.lexer = new MmLexer();
	grammar.start = 'provable';
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	labelToStatementMap.set('ax-mp', emptyLabelStatement);
	const mmpParserParams: IMmpParserParams = {
		textToParse: '55:50,51:axmp |- x = A ',
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: TestMmpParser = new TestMmpParser(mmpParserParams);
	// const mmpParser: TestMmpParser = new TestMmpParser('55:50,51:axmp |- x = A ', eqeq1iMmParser,
	// 	new WorkingVars(kindToPrefixMap));
	mmpParser.createMmpStatements();
	//axmp does not esist; 50 and 51 don't exist
	expect(mmpParser.diagnostics.length).toBe(3);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.formulaSyntaxError)).toBeFalsy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
});

test('expect reference statement unification error', () => {
	const mmpSource = `\
h50::hyp1 |- ps
h51::hyp2 |- ph
qed:50,51:ax-mp |- ph
`;

	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, new WorkingVars(kindToPrefixMap));
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	// mmpParser.createMmpStatements(mmptext);
	expect(mmpParser.diagnostics.length).toBe(1);
	expect(mmpParser.diagnostics[0].code).toBe(MmpParserErrorCode.refStatementUnificationError);
	expect(mmpParser.diagnostics[0].message).toEqual(
		"Unification error: referenced statement is '|- ph' but it was expected to be '|- ( ps -> ph )'");
	expect(mmpParser.diagnostics[0].range.start.line).toBe(2);
	expect(mmpParser.diagnostics[0].range.start.character).toBe(7);
	expect(mmpParser.diagnostics[0].range.end.character).toBe(9);
});

test('expect missing ref error', () => {
	const mmpSource = 'qed:51:ax-mp |- ps';
	// const parser: MmParser = new MmParser();
	// parser.ParseText(axmpTheory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	// mmpParser.createMmpStatements(mmptext);
	expect(mmpParser.diagnostics.length).toBe(2);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.wrongNumberOfEHyps)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.unknownStepRef) {
			expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(4);
			expect(diagnostic.range.end.character).toBe(6);
		}
	});
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.wrongNumberOfEHyps) {
			const errMsg = 'Unification error: the assertion ax-mp expects 2 $e hypothesis, but 1 are given';
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(4);
			expect(diagnostic.range.end.character).toBe(6);
		}
	});
});

test('expect label only to be parsed', () => {
	const mmpSource = `\
ax-mp
qed:: |- ps
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.mmpProof?.mmpStatements.length).toBe(2);
	expect((<MmpProofStep>mmpParser.mmpProof?.mmpStatements[0]).stepFormula).toBeUndefined();
	expect((<MmpProofStep>mmpParser.mmpProof?.mmpStatements[0]).eHypRefs).toBeUndefined();
	expect(mmpParser.diagnostics.length).toBe(2);
	const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	expect(diagnostic.code).toBe(MmpParserWarningCode.missingFormula);
	const expectedRange: Range = Range.create(0, 5, 0, 6);
	expect(diagnostic.range).toEqual(expectedRange);
});

test('expect 2 hyp refs', () => {
	const mmpSource =
		'qed:,50: |- ps';
	// const mp2Parser: MmParser = new MmParser();
	// mp2Parser.ParseText(mp2Theory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(mmpParser.mmpProof?.mmpStatements.length).toBe(1);
	expect((<MmpProofStep>mmpParser.mmpProof?.mmpStatements[0]).eHypRefs?.length).toBe(2);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownStepRef)).toBeTruthy();
});

test('Expect Working Var unification error', () => {
	const mmpSource = `\
d1:: |- &W2
d2:: |- &W2
qed:d1,d2:ax-mp |- ph
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.workingVarUnificationError)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unificationError)).toBeTruthy();
	// 2 missing label, 1 ref error, 1 unification error, 2 working var unification errors
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(6);
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.workingVarUnificationError) {
			const errMsg = 'Working Var unification error: the  working var &W2 should be ' +
				'replaced with the following subformula, containing itself ( &W2 -> ph )';
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line == 0 || diagnostic.range.start.line == 1).toBeTruthy();
			expect(diagnostic.range.start.character).toBe(8);
			expect(diagnostic.range.end.character).toBe(11);
		}
		if (diagnostic.code == MmpParserErrorCode.unificationError) {
			const errMsg = 'Working Var unification error: the  working var &W2 should be ' +
				'replaced with the following subformula, containing itself ( &W2 -> ph )';
			expect(diagnostic.message).toEqual(errMsg);
			expect(diagnostic.range.start.line).toBe(2);
			expect(diagnostic.range.start.character).toBe(10);
			expect(diagnostic.range.end.character).toBe(15);
		}
	});
});

test('Expect v3x to parse', () => {
	const mmpSource = `\
50::equid |- x = x
51::df-v  |- _V = { x | x = x }
52:51:abeq2i |- ( x e. _V <-> x = x )
qed:50,52:mpbir |- x e. _V
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: vexTheoryMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBe(0);
	expect(mmpParser.diagnostics.length).toBe(0);
});

// test('expect mmp2 proof to be raise missing theorem label', () => {
// 	const mmpSource =
// 		'h50::mp2.1   |- ph\n' +
// 		'h51::mp2.2  |- ps\n' +
// 		'h52::mp2.3   |- ( ph -> ( ps -> ch ) )\n' +
// 		'53:50,52:ax-mp |- ( ps -> ch )\n' +
// 		'qed:51,53:ax-mp |- ch';
// 	const parser: MmParser = new MmParser();
// 	parser.ParseText(mp2Theory);
// 	const mmpParser: MmpParser = new MmpParser(mmpSource, parser.labelToStatementMap, parser.outermostBlock, parser.grammar, new WorkingVars(kindToPrefixMap));
// 	// const outermostBlock: BlockStatement = new BlockStatement(null);
// 	mmpParser.parse();
// 	expect(mmpParser.diagnostics.length).toBe(0);
// 	// mmpParser.createMmpStatements(mmptext);
// });

test('expect mmp2 proof to be parsed', () => {
	const mmpSource = `\
$theorem testname
h50::mp2.1   |- ph
h51::mp2.2  |- ps
h52::mp2.3   |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp |- ( ps -> ch )
qed:51,53:ax-mp |- ch
`;

	// const mp2Parser: MmParser = new MmParser();
	// mp2Parser.ParseText(mp2Theory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBe(0);
	// mmpParser.createMmpStatements(mmptext);
});

test('expect proper diagnostic proof to be parsed', () => {
	const mmpSource =
		'qed:impbii    |- ch';
	// const impbiiMmParser: MmParser = new MmParser();
	// impbiiMmParser.ParseText(impbiiTheory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unificationError)).toBeTruthy();
	// expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.wrongNumberOfEHyps)).toBeTruthy();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserWarningCode.missingEHyps)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.unificationError) {
			expect(diagnostic.message).toEqual(
				"Unification error: statement is '|- ch' but it was expected to be '|- ( &W1 <-> &W2 )'");
			// expect(diagnostic.range.start.line).toBe(0);
			// expect(diagnostic.range.start.character).toBe(3);
			// expect(diagnostic.range.end.character).toBe(5);
		}
		if (diagnostic.code == MmpParserErrorCode.wrongNumberOfEHyps) {
			expect(diagnostic.message).toEqual(
				'Unification error: the assertion impbii expects 2 $e hypothesis, but 0 are given');
			expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(3);
			expect(diagnostic.range.end.character).toBe(4);
		}
	});
	// expect(mmpUnifier.thrownError).toBeFalsy();
	// mmpParser.createMmpStatements(mmptext);
});

test('working vars unification should be parsed with minimal warnings', () => {
	const mmpSource = `\
a::a1i |- &W1
qed::  |- ch
`;
	// const impbiiMmParser: MmParser = new MmParser();
	// impbiiMmParser.ParseText(impbiiTheory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	//TODO it will become 3, with additional check
	expect(mmpParser.diagnostics.length).toBe(2);

});

test('impbi partial proof should be parsed with minimal warnings', () => {
	const mmpSource = `\
d2:: |- &W1
d3::simprim |- ( &W1 -> ( -. ( ( ph -> ps ) -> -. ( ps -> ph ) ) -> ( ph <-> ps ) ) )
d1:d2,d3:ax-mp |- ( -. ( ( ph -> ps ) -> -. ( ps -> ph ) ) -> ( ph <-> ps ) )
qed:d1:expi |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )
`;
	// const impbiiMmParser: MmParser = new MmParser();
	// impbiiMmParser.ParseText(impbiiTheory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	//TODO it will become 3, with additional check
	expect(mmpParser.diagnostics.length).toBe(1);

});

test('proof statement parsed without warnings/errors', () => {
	const mmpSource = `\
h50::mp2.1 |- ph
h51::mp2.2 |- ps
h52::mp2.3 |- ( ph -> ( ps -> ch ) )
53:50,52:ax-mp |- ( ps -> ch )
qed:51,53:ax-mp |- ch

$=    wps wch mp2.2 wph wps wch wi mp2.1 mp2.3 ax-mp ax-mp $.
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	//TODO it will become 3, with additional check
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unknownLabel)).toBeFalsy();
	// expect(mmpParser.diagnostics.length).toBe(0);

});

test('expect x to unify with &S1', () => {
	const mmpSource = `\
d2:: |- x = &C2
d1:d2:eqeq1i |- ( &S1 = &C3 <-> &C2 = &C3 )
qed::  |- ch
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: eqeq1iMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, eqeq1iMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unificationError)).toBeFalsy();
	// expect(mmpParser.diagnostics.length).toBe(0);

});

test('expect no unification error for working vars', () => {
	const mmpSource = `\
d1:: |- ( ch -> &W2 )
d2:: |- ( ( &W1 -> ps ) -> ph )
qed:d1,d2:ax-mp |- ph
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unificationError)).toBeFalsy();
	// expect(mmpParser.diagnostics.length).toBe(0);

});

test('expect vex to be parsed without loop', () => {
	const mmpSource = `\
d2::ax6ev |- E. &S1 &W1
qed::  |- ch
`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(mp2Theory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: vexTheoryMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.unificationError)).toBeFalsy();
});

test('expect 2 already existing (identical) theorem can be added', () => {
	const mmpSource = `\
$theorem impbii
h50::impbii.1       |- ( ph -> ps )
h51::impbii.2       |- ( ps -> ph )
52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )
qed:50,51,52:mp2   |- ( ph <-> ps )
`;
	// const parser: MmParser = new MmParser();
	// parser.ParseText(mp2Theory);
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBe(0);
});

test('expect first label wrong impbii w.r.t. already existing theorem', () => {
	const mmpSource = `\
$theorem impbii
h50::impbi.1       |- ( ph -> ps )
h51::impbii.2      |- ( ps -> ph )
52::impbi          |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )
qed:50,51,52:mp2   |- ( ph <-> ps )
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBe(1);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.eHypLabelNotCoherentForAlreadyExistingTheorem)).toBeTruthy();
	const message = `The label does not match the label in the theory. The expected label is impbii.1`;
	expect(mmpParser.diagnostics[0].message).toEqual(message);
	expect(mmpParser.diagnostics[0].range.start.line).toEqual(1);
	expect(mmpParser.diagnostics[0].range.start.character).toEqual(5);
	expect(mmpParser.diagnostics[0].range.end.character).toEqual(12);
});

test('expect second label wrong impbii w.r.t. already existing theorem', () => {
	const mmpSource = `\
$theorem impbii
h50::impbii.1       |- ( ph -> ps )
h51::impbi.2        |- ( ps -> ph )
52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )
qed:50,51,52:mp2    |- ( ph <-> ps )
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// const impbiiStatement = impbiiMmParser.labelToStatementMap.get('impbii');
	// const theoremCoherenceChecker: TheoremCoherenceChecker = new TheoremCoherenceChecker(
	// 	mmpParser.uProof!, <ProvableStatement>impbiiStatement, dummyRange, mmpParser.diagnostics);
	// theoremCoherenceChecker.checkCoherence();
	expect(mmpParser.diagnostics.length).toBe(1);
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.eHypLabelNotCoherentForAlreadyExistingTheorem)).toBeTruthy();
	const message = `The label does not match the label in the theory. The expected label is impbii.2`;
	expect(mmpParser.diagnostics[0].message).toEqual(message);
	expect(mmpParser.diagnostics[0].range.start.line).toEqual(2);
	expect(mmpParser.diagnostics[0].range.start.character).toEqual(5);
	expect(mmpParser.diagnostics[0].range.end.character).toEqual(12);
});

test('expect first hyp wrong formula w.r.t. already existing theorem', () => {
	const mmpSource =
		'$theorem impbii\n' +
		// in order to match the theory, the formula below should be |- ( ph -> ps )
		'h50::impbii.1       |- ( ph -> ph )\n' +
		'h51::impbii.2       |- ( ps -> ph )\n' +
		'52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )\n' +
		'qed:50,51,52:mp2   |- ( ph <-> ps )';
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.doesntMatchTheoryFormula)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.doesntMatchTheoryFormula) {
			const expectedMessage =
				`The formula does not match the formula in the theory. The expected formula is '|- ( ph -> ps )'`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(1);
			expect(diagnostic.range.start.character).toBe(20);
			expect(diagnostic.range.end.character).toBe(35);
		}
	});
});

test('expect second hyp wrong formula w.r.t. already existing theorem', () => {
	const mmpSource =
		'$theorem impbii\n' +
		'h50::impbii.1       |- ( ph -> ps )\n' +
		// in order to match the theory, the formula below should be |- ( ps -> ph )
		'h51::impbii.2       |- ( ps -> ps )\n' +
		'52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )\n' +
		'qed:50,51,52:mp2   |- ( ph <-> ps )';
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.doesntMatchTheoryFormula)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.doesntMatchTheoryFormula) {
			const expectedMessage =
				`The formula does not match the formula in the theory. The expected formula is '|- ( ps -> ph )'`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(2);
			expect(diagnostic.range.start.character).toBe(20);
			expect(diagnostic.range.end.character).toBe(35);
		}
	});
});

test('expect qed formula wrong formula w.r.t. already existing theorem', () => {
	const mmpSource =
		'$theorem impbii\n' +
		'h50::impbii.1       |- ( ph -> ps )\n' +
		'h51::impbii.2       |- ( ps -> ph )\n' +
		'52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )\n' +
		// in order to match the theory, the formula below should be |- ( ph <-> ps )
		'qed:50,51,52:mp2   |- ( ph <-> ph )';
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(mmpParser.diagnostics, MmpParserErrorCode.doesntMatchTheoryFormula)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.doesntMatchTheoryFormula) {
			const expectedMessage =
				`The formula does not match the formula in the theory. The expected formula is '|- ( ph <-> ps )'`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(4);
			expect(diagnostic.range.start.character).toBe(19);
			expect(diagnostic.range.end.character).toBe(35);
		}
	});
});

test('missing qed statement for already existing theorem impbii', () => {
	const mmpSource =
		'$theorem impbii\n' +
		'h50::impbii.1       |- ( ph -> ps )\n' +
		'h51::impbii.2       |- ( ps -> ph )\n' +
		'52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )\n' +
		// diagnostic error, because below it should be qed:
		'qe:50,51,52:mp2   |- ( ph <-> ps )';
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBe(2);
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserErrorCode.missingQedStatementForAlreadyExistingTheorem)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.missingQedStatementForAlreadyExistingTheorem) {
			const message = `This theorem is already in the theory, but the qed statement is missing. The expected ` +
				`qed formula is '|- ( ph <-> ps )'`;
			expect(diagnostic.message).toEqual(message);
			expect(diagnostic.range.start.line).toEqual(0);
			expect(diagnostic.range.start.character).toEqual(9);
			expect(diagnostic.range.end.character).toEqual(15);
		}
	});
});

test('wrong number of eHyps for already existing theorem impbii', () => {
	const mmpSource =
		'$theorem impbii\n' +
		'h50::impbii.1       |- ( ph -> ps )\n' +
		// impbii.2 below is missing
		//'h51::impbii.2       |- ( ps -> ph )\n' +
		'52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )\n' +
		'qed:50,51,52:mp2   |- ( ph <-> ps )';
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	// expect(mmpParser.diagnostics.length).toBe(1);
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserErrorCode.wrongNumberOfEHypsForAlreadyExistingTheorem)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.wrongNumberOfEHypsForAlreadyExistingTheorem) {
			const expectedMessage =
				`This theorem is already in the theory, and it has 2 $e hypothesis, ` +
				`but this new version of the theorem has 1 $e hypothesis. This cannot be accepted, because ` +
				`it invalidates the verification of the theory`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(9);
			expect(diagnostic.range.end.character).toBe(15);
		}
	});
});


test("axext3 good - is already existing, but it should not add diagnostic for disj vars", () => {
	const mmtFileForAxext3 = `\
$theorem axext3
qed::exlimiiv |- ( A. z ( z e. x <-> z e. y ) -> x = y )
$d w x
$d x z
$d y z
$d w z
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmtFileForAxext3,
		mmParser: vexTheoryMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmtFileForAxext3, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserErrorCode.missingQedStatementForAlreadyExistingTheorem)).toBeFalsy();
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserErrorCode.disjVarConstraintNotInTheTheory)).toBeFalsy();
});

test("axext3 bad 1 - it's already existing, but x y is not an existing constraint", () => {
	const mmtFileForAxext3 =
		'$theorem axext3\n' +
		'qed::exlimiiv |- ( A. z ( z e. x <-> z e. y ) -> x = y )\n' +
		'$d w x\n' +
		'$d x z\n' +
		'$d y z\n' +
		'$d w z\n' +
		// the following one should raise a Diagnostic (as a matter of fact, two diagnostics, one for each variable)
		'$d x y\n';
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmtFileForAxext3,
		mmParser: vexTheoryMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmtFileForAxext3, vexTheoryMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserErrorCode.disjVarConstraintNotInTheTheory)).toBeTruthy();
	let numOfDisjVarDiagnostic = 0;
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.disjVarConstraintNotInTheTheory) {
			numOfDisjVarDiagnostic++;
			const expectedMessage =
				`The theorem axext3 is already in the theory, and it does not have ` +
				`a disjoint constraint for <x,y>, but this new version of the theorem has such constraint. It cannot ` +
				`be accepted if this constraint is not removed`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(6);
			expect(diagnostic.range.start.character == 3 || diagnostic.range.start.character == 5).toBeTruthy();
			expect(diagnostic.range.end.character).toBe(diagnostic.range.start.character + 1);
		}
	});
	expect(numOfDisjVarDiagnostic).toBe(2);
});

test('expect MmpStatement.range ', () => {
	const mmpSource = `\
h50::hyp1 |- ps
:
55::
 ax-mp |- ph
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
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	// mmpParser.createMmpStatements(mmptext);
	const mmpStatements: IMmpStatement[] = mmpParser.mmpProof!.mmpStatements;
	const mmpProofStep0: MmpProofStep = <MmpProofStep>mmpStatements[0];
	expect(mmpProofStep0.range.start.line).toBe(0);
	expect(mmpProofStep0.range.start.character).toBe(0);
	expect(mmpProofStep0.range.end.line).toBe(0);
	expect(mmpProofStep0.range.end.character).toBe(15);
	const mmpProofStep1: MmpProofStep = <MmpProofStep>mmpStatements[1];
	expect(mmpProofStep1.range.start.line).toBe(1);
	expect(mmpProofStep1.range.start.character).toBe(0);
	expect(mmpProofStep1.range.end.line).toBe(1);
	expect(mmpProofStep1.range.end.character).toBe(1);
	const mmpProofStep2: MmpProofStep = <MmpProofStep>mmpStatements[2];
	expect(mmpProofStep2.range.start.line).toBe(2);
	expect(mmpProofStep2.range.start.character).toBe(0);
	expect(mmpProofStep2.range.end.line).toBe(3);
	expect(mmpProofStep2.range.end.character).toBe(12);
});

test('expect qed warning for last step', () => {
	const mmpSource = `\
h50::hyp1 |- ps
h51::hyp2 |- ph
555:50,51:ax-mp |- ph`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(1);
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserWarningCode.lastStatementShouldBeQed)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserWarningCode.lastStatementShouldBeQed) {
			const expectedMessage =
				`The last proof step's ref is expected to be 'qed'`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(2);
			expect(diagnostic.range.start.character).toBe(0);
			expect(diagnostic.range.end.line).toBe(2);
			expect(diagnostic.range.end.character).toBe(3);
		}
	});
});

test('expect comment edit warning', () => {
	const mmpSource = `
* MissingComment

h50::hyp1 |- ps
h51::hyp2 |- ph
qed:50,51:ax-mp |- ph
`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(1);
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserWarningCode.missingComment)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserWarningCode.missingComment) {
			const expectedMessage =
				`This comment should contain a description of the theorem`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(1);
			expect(diagnostic.range.start.character).toBe(2);
			expect(diagnostic.range.end.line).toBe(1);
			expect(diagnostic.range.end.character).toBe(16);
		}
	});
});

test('expect comment edit warning', () => {
	const mmpSource = `\
h50::hyp1 |- ps
h51::hyp1 |- ph
qed:50,51:ax-mp |- ph`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mp2MmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, mp2MmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(1);
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserErrorCode.duplicatedEHyp)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserWarningCode.missingComment) {
			const expectedMessage = `This eHyp label is duplicated`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(1);
			expect(diagnostic.range.start.character).toBe(5);
			expect(diagnostic.range.end.line).toBe(1);
			expect(diagnostic.range.end.character).toBe(9);
		}
	});
});

test('expect mmp parsing from mm parser partially succesfull', () => {
	const parser: MmParser = createMmParser('impbii-bad.mm');
	const mmpSource = `\
impi $p |- ( -. ( ph -> -. ps ) -> ch )
qed:pm3.2im |- ( ph -> ( ps -> -. ( ph -> -. ps ) ) )`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: parser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(1);
	expect(doesDiagnosticsContain(mmpParser.diagnostics,
		MmpParserErrorCode.provableStatementWithFailedVerification)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.unknownLabel) {
			expect(diagnostic.range.start.line).toBe(0);
			expect(diagnostic.range.start.character).toBe(0);
			expect(diagnostic.range.end.line).toBe(0);
			expect(diagnostic.range.end.character).toBe(4);
		}
	});
});

test('expect self disjoint var error', () => {
	const mmpSource = `
* A comment

qed:: |- ( x = y -> ( x = z -> y = z ) )
$d x x
$d x y`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: elexdMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, elexdMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBeGreaterThanOrEqual(2);
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserErrorCode.disjVarWithItself)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserErrorCode.disjVarWithItself) {
			const expectedMessage =
				`The two distinct variables are both 'x' : a variable cannot be declared distinct from itself, the two symbols after a $d must be different.`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(4);
			expect(diagnostic.range.start.character).toBe(0);
			expect(diagnostic.range.end.line).toBe(4);
			expect(diagnostic.range.end.character).toBe(2);
		}
	});
});

test('expect discouraged warning', () => {
	const mmpSource = `
$theorem test

* test

h1::test.1          |- -. -. ch
2::notnotr          |- ( -. -. ch -> ch )
qed:1,2:ax-mp      |- ch`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBe(1);
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserWarningCode.isDiscouraged)).toBeTruthy();
	mmpParser.diagnostics.forEach((diagnostic: Diagnostic) => {
		if (diagnostic.code == MmpParserWarningCode.isDiscouraged) {
			const expectedMessage =
				`The new use of 'notnotr' is discouraged.`;
			expect(diagnostic.message).toEqual(expectedMessage);
			expect(diagnostic.range.start.line).toBe(6);
			expect(diagnostic.range.start.character).toBe(3);
			expect(diagnostic.range.end.line).toBe(6);
			expect(diagnostic.range.end.character).toBe(10);
		}
	});
});

test('expect discouraged warning NOT risen because of $allowdiscouraged', () => {
	const mmpSource = `
$theorem test
$allowdiscouraged

* test

h1::test.1          |- -. -. ch
2::notnotr          |- ( -. -. ch -> ch )
qed:1,2:ax-mp      |- ch`;
	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: impbiiMmParser,
		workingVars: new WorkingVars(kindToPrefixMap)
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	// const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	expect(mmpParser.diagnostics.length).toBe(0);
	// if above is zero, then the following is obviously true, but I keep it in case of future changes
	// that could introduce other diagnostics
	expect(doesDiagnosticsContain(
		mmpParser.diagnostics, MmpParserWarningCode.isDiscouraged)).toBeFalsy();
});

/** This tests both .mm and .mmp diagnostic errors for LabelStatement with non-parsable formula.
 * The non parsable formula is in the .mm file, but the .mm parser does not check if the formula
 * is parsable w.r.t. the grammar of the logic, it only checks if the formula is a valid w.r.t.
 * the Metamath syntax. So the .mm parser does not raise any diagnostic error.
 * The .mmp parser, when it tries to unify the proof, discovers that the formula is not parsable,
 * and raises both a .mm diagnostic error (in the .mm file) and a .mmp diagnostic error, in the current .mmp file.
*/
test('expect .mm diagnostic error for LabelStatement with non-parsable formula', () => {
	const mmParser: MmParser = createMmParser('validButBadWff.mm');
	expect(mmParser.isParsingComplete).toBe(true);
	expect(mmParser.parseFailed).toBe(false);
	expect(mmParser.diagnostics.length).toBe(0);
	const badStatement = mmParser.labelToStatementMap.get('bad');
	expect(badStatement).toBeDefined();
	expect(badStatement).not.toBeNull();

	const published: PublishDiagnosticsParams[] = [];
	const sink: IDiagnosticSink = {
		sendDiagnostics: (params: PublishDiagnosticsParams) => {
			published.push(params);
		},
	};

	const diagnosticEventHandler: DiagnosticEventHandler = new DiagnosticEventHandler(sink);
	badStatement?.on(LabeledStatementEvents.formulaNonParsable, diagnosticEventHandler.formulaNonParsableEventHandler);

	const mmpSource = `\
1:bad
qed:      |- ph`;

	const mmpParserParams: IMmpParserParams = {
		textToParse: mmpSource,
		mmParser: mmParser,
		workingVars: new WorkingVars(kindToPrefixMap),
	};
	const mmpParser: MmpParser = new MmpParser(mmpParserParams);
	mmpParser.parse();

	const diagnostic: Diagnostic = mmpParser.diagnostics[0];
	expect(diagnostic.code).toBe(MmpParserErrorCode.mmFormulaNonParsable);
	expect(diagnostic.message).toBe(`\
The formula in the .mm file for 'bad' is not parsable. See the problem tab for the .mm file, for a detailed error message`);
	expect(diagnostic.range.start.line).toBe(0);
	expect(diagnostic.range.start.character).toBe(2);
	expect(diagnostic.range.end.line).toBe(0);
	expect(diagnostic.range.end.character).toBe(5);
	expect(diagnostic.severity).toBe(DiagnosticSeverity.Error);
	expect(diagnostic.source).toBe('yamma');

	expect(published.length).toBe(1);
	const mmDiagnostic: MmDiagnostic = published[0].diagnostics[0];
	expect(mmDiagnostic.code).toBe(MmParserErrorCode.formulaNonParsable);
	expect(mmDiagnostic.message).toBe(`\
Formula in statement "bad" is not parsable 
Unexpected "ps". I did not expect any more input. Here is the state of my parse table:

    wff → "ph" ● 
    provable → "|-" wff ● 
`);
	expect(mmDiagnostic.range.start.line).toBe(10);
	expect(mmDiagnostic.range.start.character).toBe(13);
	expect(mmDiagnostic.range.end.line).toBe(10);
	expect(mmDiagnostic.range.end.character).toBe(15);
	expect(mmDiagnostic.severity).toBe(DiagnosticSeverity.Error);
	expect(mmDiagnostic.source).toBe('yamma');
	expect(mmDiagnostic.mmFilePath?.endsWith(path.normalize('server/src/__test__/../mmTestFiles/validButBadWff.mm'))).toBe(true);

});