import { Diagnostic, Range } from 'vscode-languageserver';
import { OnDidChangeContentHandler } from '../languageServerHandlers/OnDidChangeContentHandler';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { WorkingVars } from '../mmp/WorkingVars';
import { mp2Theory, kindToPrefixMap } from './GlobalForTest.test';

class OnDidChangeContentHandlerTest extends OnDidChangeContentHandler {
	/**
	 * computeRangeForCursor
	 * 
	 */
	public static computeRangeForCursor(diagnostics: Diagnostic[], mmpParser?: MmpParser): Range | undefined {
		const range: Range | undefined =
			OnDidChangeContentHandler.computeRangeForCursor(diagnostics, mmpParser);
		return range;
	}
}

test("Cursor should go to step 53", () => {
	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:        |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch";
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const range: Range | undefined = OnDidChangeContentHandlerTest.computeRangeForCursor(mmpParser.diagnostics, mmpParser);
	expect(range).toBeDefined();
	expect(range?.start.line).toBe(3);
	expect(range?.start.character).toBe(3);
	expect(range?.end.line).toBe(3);
	expect(range?.end.character).toBe(3);
});

test("Cursor should go to '$='", () => {
	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:        |- ( ps -> ch )\n" +
		"qed:51,53:ax-mp |- ch\n" +
		"$= ( bla bla bla3 ) $.";
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const range: Range | undefined = OnDidChangeContentHandlerTest.computeRangeForCursor(mmpParser.diagnostics, mmpParser);
	expect(range).toBeDefined();
	expect(range?.start.line).toBe(5);
	expect(range?.start.character).toBe(0);
	expect(range?.end.line).toBe(5);
	expect(range?.end.character).toBe(2);
});

test("Cursor should go to 'ax-mp' in step 53", () => {
	const mmpSource =
		"h50::mp2.1 |- ph\n" +
		"h51::mp2.2 |- ps\n" +
		"h52::mp2.3 |- ( ph -> ( ps -> ch ) )\n" +
		"53:ax-mp        |- ( ps -> ch \n" +       // syntax error, here: missing right parenthesis
		"qed:51,53:ax-mp |- ch";
	const parser: MmParser = new MmParser();
	parser.ParseText(mp2Theory);
	const mmpParser: MmpParser = new MmpParser(mmpSource, parser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const range: Range | undefined = OnDidChangeContentHandlerTest.computeRangeForCursor(mmpParser.diagnostics, mmpParser);
	expect(range).toBeDefined();
	expect(range?.start.line).toBe(3);
	expect(range?.start.character).toBe(3);
	expect(range?.end.line).toBe(3);
	expect(range?.end.character).toBe(8);
});