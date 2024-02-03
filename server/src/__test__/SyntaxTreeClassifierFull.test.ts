import { Parser } from 'nearley';
import { MmLexer } from '../grammar/MmLexer';
import { ParseNode } from '../grammar/ParseNode';
import { WorkingVars } from '../mmp/WorkingVars';
import { SyntaxTreeClassifierFull } from '../stepSuggestion/SyntaxTreeClassifierFull';
import { kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

function buildRpnSyntaxTree(stringToParse: string, maxLevel: number): string {
	opelcnMmParser.grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	const parser = new Parser(opelcnMmParser.grammar);
	parser.feed(stringToParse);
	const parseNode: ParseNode = parser.results[0];
	const syntaxTreeClassifierFull: SyntaxTreeClassifierFull = new SyntaxTreeClassifierFull(maxLevel);
	const rpnSyntaxTree: string = syntaxTreeClassifierFull.classify(parseNode, opelcnMmParser);
	return rpnSyntaxTree;
}

test("test SyntaxTreeClassifierFull", () => {
	// opthg2 $p | - ((C e.V /\ D e.W ) ->
	// 	(<.A , B >. = <.C , D >. <-> (A = C /\ B = D ) ) ) $ =
	let rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', 2);
	expect(rpnSyntaxTree).toEqual('wff wff wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', 3);
	expect(rpnSyntaxTree).toEqual('wff wff wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', 1);
	expect(rpnSyntaxTree).toEqual('wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( ph -> ps ) -> ch )', 3);
	expect(rpnSyntaxTree).toEqual('wff wff wi wff wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( C e. V /\\ D e. W ) ->\n' +
		'( <. A , B >. = <. C , D >. <-> ( A = C /\\ B = D ) ) )', 3);
	expect(rpnSyntaxTree).toEqual('wcel wcel wa wceq wa wb wi TOP');
});
