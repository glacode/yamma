import { Parser } from 'nearley';
import { MmLexer } from '../grammar/MmLexer';
import { InternalNode } from '../grammar/ParseNode';
import { WorkingVars } from '../mmp/WorkingVars';
import { kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';
import { SyntaxTreeClassifierSpecificPath } from '../stepSuggestion/SyntaxTreeClassifierSpecificPath';

function buildRpnSyntaxTree(stringToParse: string, treePath: number[]): string {
	opelcnMmParser.grammar.lexer = new MmLexer(new WorkingVars(kindToPrefixMap));
	const parser = new Parser(opelcnMmParser.grammar);
	parser.feed(stringToParse);
	const parseNode: InternalNode = parser.results[0];
	// const treePath: PathMove[] = [ PathMove.right, PathMove.right. PathMove.left];
	const syntaxTreeClassifierFull: SyntaxTreeClassifierSpecificPath = new SyntaxTreeClassifierSpecificPath(treePath);
	const rpnSyntaxTree: string = syntaxTreeClassifierFull.classify(parseNode, opelcnMmParser);
	return rpnSyntaxTree;
}

test("test SyntaxTreeClassifierSpecificPath", () => {
	// opthg2 $p | - ((C e.V /\ D e.W ) ->
	// 	(<.A , B >. = <.C , D >. <-> (A = C /\ B = D ) ) ) $ =
	let rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', []);
	expect(rpnSyntaxTree).toEqual('TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', [1]);
	expect(rpnSyntaxTree).toEqual('wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', [1,3]);
	expect(rpnSyntaxTree).toEqual('wff wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> &W1 )', [1,3]);
	expect(rpnSyntaxTree).toEqual('wff wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', [0]);
	expect(rpnSyntaxTree).toEqual('');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', [1,3,1]);
	expect(rpnSyntaxTree).toEqual('');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> &W2 )', [1,3,1]);
	expect(rpnSyntaxTree).toEqual('');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ph -> ps )', [1,1, 1, 0]);
	expect(rpnSyntaxTree).toEqual('');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( ph -> ps ) -> ch )', [1,1, 1]);
	expect(rpnSyntaxTree).toEqual('wff wi wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( C e. V /\\ D e. W ) ->\n' +
		'( <. A , B >. = <. C , D >. <-> ( A = C /\\ B = D ) ) )', [1,3, 1]);
	expect(rpnSyntaxTree).toEqual('wceq wb wi TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( C e. V /\\ D e. W ) ->\n' +
		'( <. A , B >. = <. C , D >. <-> ( A = C /\\ B = D ) ) )', [1,3, 1, 2]);
	expect(rpnSyntaxTree).toEqual('cop wceq wb wi TOP');  // cop stands for <. C , D >.
	rpnSyntaxTree = buildRpnSyntaxTree('|- ( ( C e. V /\\ D e. W ) ->\n' +
		'( <. A , B >. = <. C , D >. <-> ( A = C /\\ B = D ) ) )', [1,3, 1, 2, 1]);
	expect(rpnSyntaxTree).toEqual('class cop wceq wb wi TOP');  // cop stands for C
	rpnSyntaxTree = buildRpnSyntaxTree('|- E. x e. A B = B', []);
	expect(rpnSyntaxTree).toEqual('TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- E. x e. A B = B', [1]);
	expect(rpnSyntaxTree).toEqual('wrex TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- E. x e. A ph', [1,4]);
	expect(rpnSyntaxTree).toEqual('wff wrex TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- E. x e. A ph', [1,3]);
	expect(rpnSyntaxTree).toEqual('class wrex TOP');
	rpnSyntaxTree = buildRpnSyntaxTree('|- E. x e. A B = B', [1,4]);
	expect(rpnSyntaxTree).toEqual('wceq wrex TOP');
});
