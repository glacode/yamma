import { Grammar, Parser, Rule } from 'nearley';
import { BlockStatement } from '../mm/BlockStatement';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmLexer } from '../grammar/MmLexer';
import { MmParser } from '../mm/MmParser';
import { ParseNode } from '../grammar/ParseNode';
import { AxiomStatement } from "../mm/AxiomStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { dummyToken, splitToTokensDefault } from '../mm/Utils';
import { WorkingVars } from '../mmp/WorkingVars';
import { globalState, kindToPrefixMap, lastFetchedSettings, mp2Theory, opelcnMmParser } from './GlobalForTest.test';
import { MmLexerFromStringArray } from '../grammar/MmLexerFromStringArray';
import { FHyp } from '../mm/FHyp';


/**
 * returns a minimal grammar, up to the 'wi' statement
 */
export function wiGrammar(): Grammar {
	const rules: Rule[] = [
		GrammarManager.CreateRule("TOP", "provable", [{ literal: "|-" }, "wff"]),
		GrammarManager.CreateRule("wph", "wff", [{ literal: "ph" }]),
		GrammarManager.CreateRule("wps", "wff", [{ literal: "ps" }]),
		GrammarManager.CreateRule("wch", "wff", [{ literal: "ch" }]),
		GrammarManager.CreateRule("wi", "wff", [{ literal: "(" }, "wff", { literal: "->" }, "wff", { literal: ")" }])
	];
	const grammar: Grammar = new Grammar(rules);
	// grammar.lexer = new MmLexer();
	grammar.start = "provable";
	return grammar;
}

// export const workingVarsForTest: WorkingVars = new WorkingVars(kindToPrefixMap);

test("buildStringArray and buildStringFormula", () => {

	const grammar: Grammar = wiGrammar();
	const workingVars: WorkingVars = new WorkingVars(new Map<string, string>());

	grammar.lexer = new MmLexer(workingVars);
	const parser: Parser = new Parser(grammar);
	const stringToParse = "|- ( ph -> ( ps -> ch ) )";
	try {
		parser.feed(stringToParse);
	} catch (error: any) {
		console.log(error);
	}
	const result: ParseNode[] = parser.results;

	expect(result.length).toBe(1);

	const stringArray = GrammarManager.buildStringArray(result[0]);
	expect(stringArray).toEqual(["|-", "(", "ph", "->", "(", "ps", "->", "ch", ")", ")"]);

	const stringFormula = GrammarManager.buildStringFormula(result[0]);
	expect(stringFormula).toEqual(stringToParse);
});

test("GrammarManager.CreateGrammar", () => {
	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	const outerBlock = new BlockStatement();
	const wph = new FHyp(dummyToken("wph"), splitToTokensDefault("wff ph"), outerBlock);
	labelToStatementMap.set("wph", wph);
	outerBlock.varToKindMap.set("ph", "wff");
	// outerBlock.fHyps.push(wph);
	const wps = new FHyp(dummyToken("wps"), splitToTokensDefault("wff ps"), outerBlock);
	labelToStatementMap.set("wps", wps);
	outerBlock.varToKindMap.set("ps", "wff");

	const wi = new AxiomStatement(dummyToken("wi"), splitToTokensDefault(" wff ( ph -> ps )"), outerBlock);
	labelToStatementMap.set("wi", wi);

	// outerBlock.fHyps.push(wps);
	// const grammar: Grammar = GrammarManager.CreateGrammar(labelToStatementMap, new WorkingVars(new Map<string, string>()));
	const kindToPrefixMap: Map<string, string> = WorkingVars.getKindToWorkingVarPrefixMap(
		lastFetchedSettings.variableKindsConfiguration);
	const grammar: Grammar = GrammarManager.CreateGrammar(labelToStatementMap, new WorkingVars(kindToPrefixMap));
	const rules = grammar.rules;
	expect(rules.length).toBe(7);

	const firstRule: Rule = rules[0];
	const rule: Rule = GrammarManager.CreateRule("TOP", "provable", [{ literal: "|-" }, "wff"]);
	expect(firstRule.name).toEqual(rule.name);
	expect(firstRule.symbols).toEqual(rule.symbols);

	const secondRule: Rule = rules[1];
	const rule2: Rule = GrammarManager.CreateRule("wph", "wff", [{ literal: "ph" }]);
	expect(secondRule.name).toEqual(rule2.name);
	expect(secondRule.symbols).toEqual(rule2.symbols);

	const fourthRule: Rule = rules[3];
	const rule3 = GrammarManager.CreateRule("wi", "wff", [{ literal: "(" }, "wff", { literal: "->" }, "wff", { literal: ")" }]);
	expect(fourthRule.name).toEqual(rule3.name);
	expect(fourthRule.symbols).toEqual(rule3.symbols);
});


test("GrammarManager.CreateGrammar for '|- x = A'", () => {

	// GrammarManager.CreateRule("TOP", "provable", [{ literal: "|-" }, "wff"]),
	// 	GrammarManager.CreateRule("vx", "setvar", [{ literal: "x" }]),
	// 	GrammarManager.CreateRule("cv", "class", ["setvar"]),
	// 	GrammarManager.CreateRule("ca", "class", [{ literal: "A" }]),
	// 	GrammarManager.CreateRule("wceq", "wff", ["class",{ literal: "=" },"class"]),


	const labelToStatementMap: Map<string, LabeledStatement> = new Map<string, LabeledStatement>();
	const outerBlock = new BlockStatement();
	const vx = new FHyp(dummyToken("vx"), splitToTokensDefault("setvar x"), outerBlock);
	labelToStatementMap.set("vx", vx);
	outerBlock.varToKindMap.set("x", "setvar");
	// outerBlock.fHyps.push(wph);

	const ca = new FHyp(dummyToken("ca"), splitToTokensDefault("class A"), outerBlock);
	labelToStatementMap.set("ca", ca);
	outerBlock.varToKindMap.set("A", "class");

	const cb = new FHyp(dummyToken("cb"), splitToTokensDefault("class B"), outerBlock);
	labelToStatementMap.set("cb", cb);
	outerBlock.varToKindMap.set("B", "class");

	const cv = new AxiomStatement(dummyToken("cv"), splitToTokensDefault("class x"), outerBlock);
	labelToStatementMap.set("cv", cv);
	// outerBlock.varToKindMap.set("ps","wff");

	const wph = new FHyp(dummyToken("wph"), splitToTokensDefault("wff ph"), outerBlock);
	labelToStatementMap.set("wph", wph);
	outerBlock.varToKindMap.set("ph", "wff");

	const wceq = new AxiomStatement(dummyToken("wceq"), splitToTokensDefault("wff A = B"), outerBlock);
	labelToStatementMap.set("wceq", wceq);

	// outerBlock.fHyps.push(wps);
	const grammar: Grammar = GrammarManager.CreateGrammar(labelToStatementMap, new WorkingVars(kindToPrefixMap));
	const rules = grammar.rules;
	expect(rules.length).toBe(10);   // 3 are added by the "standard" working vars

	const secondRule: Rule = rules[1];
	const rule2: Rule = GrammarManager.CreateRule("vx", "setvar", [{ literal: "x" }]);
	expect(secondRule.name).toEqual(rule2.name);
	expect(secondRule.symbols).toEqual(rule2.symbols);

	const fifthRule: Rule = rules[4];
	const rule5: Rule = GrammarManager.CreateRule("cv", "class", ["setvar"]);
	expect(fifthRule.name).toEqual(rule5.name);
	expect(fifthRule.symbols).toEqual(rule5.symbols);

	const seventhRule: Rule = rules[6];
	const rule7: Rule = GrammarManager.CreateRule("wceq", "wff", ["class", { literal: "=" }, "class"]);
	expect(seventhRule.name).toEqual(rule7.name);
	expect(seventhRule.symbols).toEqual(rule7.symbols);

	// const fourthRule: Rule = rules[3];
	// const rule4 = GrammarManager.CreateRule("wi", "wff", [{ literal: "(" }, "wff", { literal: "->" }, "wff", { literal: ")" }]);
	// expect(fourthRule.name).toEqual(rule4.name);
	// expect(fourthRule.symbols).toEqual(rule4.symbols);
});

test("Nearly.js for working vars", () => {
	const rules: Rule[] = [];
	// const rule : Rule = GrammarManager.CreateRule("yyywwar" , "wff", [[0-9]])
	const rule1: Rule = { id: 1, "name": "wff", "symbols": [{ type: "workvar_wff" }] };
	const rule2: Rule = { id: 2, "name": "wff", "symbols": [{ type: "workvar_class" }] };
	rules.push(rule1);
	rules.push(rule2);
	const grammar: Grammar = new Grammar(rules);
	grammar.start = "wff";
	grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	let parser: Parser = new Parser(grammar);
	parser.feed('&W22');
	expect(parser.results.length).toBe(1);
	grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	parser = new Parser(grammar);
	let path = 0;
	try {
		parser.feed('&AW22');
	} catch {
		path = 1;
		expect(parser.results).toBeUndefined;
	}

	expect(path).toBe(1);
	grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	parser = new Parser(grammar);
	// grammar.lexer.reset("&C2");
	// parser.lexer.reset("&C2");
	parser.feed('&C2');
	expect(parser.results.length).toBe(1);
});


test("expect statement with working var to be parsed", () => {
	// const mmpSource =
	// 	"h50::mp2.1   |- \n" +
	// 	"h51::mp2.2  |- ps\n" +
	// 	"h52::mp2.3   |- ( ph -> ( ps -> ch ) )\n" +
	// 	"53:50,52:ax-mp |- ( ps -> ch )\n" +
	// 	"qed:51,53:ax-mp |- ch";
	const mmParser: MmParser = new MmParser(globalState);
	mmParser.ParseText(mp2Theory);
	mmParser.grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	const parser = new Parser(mmParser.grammar);
	parser.feed('|- &W1');
	expect(parser.results.length).toBe(1);
});


test("expect no ambiguity", () => {
	// const mmpSource =
	// 	"h50::mp2.1   |- \n" +
	// 	"h51::mp2.2  |- ps\n" +
	// 	"h52::mp2.3   |- ( ph -> ( ps -> ch ) )\n" +
	// 	"53:50,52:ax-mp |- ( ps -> ch )\n" +
	// 	"qed:51,53:ax-mp |- ch";

	opelcnMmParser.grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	const parser = new Parser(opelcnMmParser.grammar);
	parser.feed('|- A e. CC');
	expect(parser.results.length).toBe(1);
});

test("MmLexerFromStringArray ok", () => {
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(mp2Theory);
	const stringArray = ['|-', '(', 'ph', '->', 'ps', ')'];
	mmParser.grammar.lexer = new MmLexerFromStringArray(stringArray);
	const parser = new Parser(mmParser.grammar);
	parser.feed('');
	expect(parser.results.length).toBe(1);
});