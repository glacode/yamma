import { Parser } from 'nearley';
import { MmLexer } from '../grammar/MmLexer';
import { ParseNode } from '../grammar/ParseNode';
import { WorkingVars } from '../mmp/WorkingVars';
import { SyntaxTreeClassifierImp } from '../stepSuggestion/SyntaxTreeClassifierImp';
import { kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

function buildRpnSyntaxTree(stringToParse: string) : string | undefined {
	opelcnMmParser.grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	const parser = new Parser(opelcnMmParser.grammar);
	parser.feed(stringToParse);
	const parseNode: ParseNode = parser.results[0];
	const syntaxTreeClassifierFull: SyntaxTreeClassifierImp = new SyntaxTreeClassifierImp(2);
	const rpnSyntaxTree: string | undefined = syntaxTreeClassifierFull.classify(parseNode, opelcnMmParser);
	return rpnSyntaxTree;
}

test("test SyntaxTreeClassifierImp", () => {
	// opthg2 $p | - ((C e.V /\ D e.W ) ->
	// 	(<.A , B >. = <.C , D >. <-> (A = C /\ B = D ) ) ) $ =
	let rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )');
	expect(rpnSyntaxTree).toEqual('wff');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( ph -> ps ) -> ch )');
	expect(rpnSyntaxTree).toEqual('wff');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( C e. V /\\ D e. W ) ->\n' +
		'( <. A , B >. = <. C , D >. <-> ( A = C /\\ B = D ) ) )');
	expect(rpnSyntaxTree).toEqual('cop cop wceq wceq wceq wa wb');
});
