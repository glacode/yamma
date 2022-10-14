import { Parser } from 'nearley';
import { MmLexer } from '../grammar/MmLexer';
import { ParseNode } from '../grammar/ParseNode';
import { WorkingVars } from '../mmp/WorkingVars';
import { SyntaxTreeClassifierFull } from '../stepSuggestion/SyntaxTreeClassifierFull';
import { kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

function buildRpnSyntaxTree(stringToParse: string) {
	opelcnMmParser.grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	const parser = new Parser(opelcnMmParser.grammar);
	parser.feed(stringToParse);
	const parseNode: ParseNode = parser.results[0];
	const syntaxTreeClassifierFull: SyntaxTreeClassifierFull = new SyntaxTreeClassifierFull();
	const rpnSyntaxTree: string = syntaxTreeClassifierFull.classify(parseNode, opelcnMmParser);
	return rpnSyntaxTree;
}

test("test SyntaxTreeClassifierFull", () => {
	// opthg2 $p | - ((C e.V /\ D e.W ) ->
	// 	(<.A , B >. = <.C , D >. <-> (A = C /\ B = D ) ) ) $ =
	let rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )');
	expect(rpnSyntaxTree).toEqual('wff wff wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( ph -> ps ) -> ch )');
	expect(rpnSyntaxTree).toEqual('wff wff wi wff wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( C e. V /\\ D e. W ) ->\n' +
		'( <. A , B >. = <. C , D >. <-> ( A = C /\\ B = D ) ) )');
	expect(rpnSyntaxTree).toEqual('wcel wcel wa wceq wa wb wi TOP');
});
