import { CompletionItem } from 'vscode-languageserver';
import { CursorContext } from "../mmp/CursorContext";
import { MmStatistics } from '../mm/MmStatistics';
import { MmpParser } from '../mmp/MmpParser';
import { MmpStatistics } from '../mmp/MmpStatistics';
import { WorkingVars } from '../mmp/WorkingVars';
import { SyntaxCompletion } from '../syntaxCompletion/SyntaxCompletion';
import { impbiiMmParser, kindToPrefixMap } from './GlobalForTest.test';

class TestSyntaxCompletion extends SyntaxCompletion {
	public static getSymbolsFromErrorMessage(errorMessage: string) {
		return SyntaxCompletion.getSymbolsFromErrorMessage(errorMessage);
	}
}

test("creation of a list of symbols from a nearly.js error message",
	() => {
		const errorMessage = 'Unexpected "UnxpexcteEndOfFormula". Instead, I was expecting to see one of the following:\n' +
			'A "ph" based on:\n    wff →  ● "ph"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "ps" based on:\n   wff →  ● "ps"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "ch" based on:\n    wff →  ● "ch"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "th" based on:\n    wff →  ● "th"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "ta" based on:\n    wff →  ● "ta"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "et" based on:\n    wff →  ● "et"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "ze" based on:\n    wff →  ● "ze"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "si" based on:\n    wff →  ● "si"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "rh" based on:\n    wff →  ● "rh"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "mu" based on:\n    wff →  ● "mu"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "la" based on:\n    wff →  ● "la"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "ka" based on:\n    wff →  ● "ka"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "-." based on:\n    wff →  ● "-." wff    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "(" based on:\n    wff →  ● "(" wff "->" wff ")"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A "(" based on:\n    wff →  ● "(" wff "<->" wff ")"\n    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff\n' +
			'A workvar_wff token based on:\n    wff →  ● %workvar_wff    wff → "(" ● wff "<->" wff ")"\n    provable → "|-" ● wff';
		const simbols: string[] = TestSyntaxCompletion.getSymbolsFromErrorMessage(errorMessage);
		expect(simbols.includes("ph")).toBeTruthy();
		expect(simbols.includes("ps")).toBeTruthy();
		expect(simbols.includes("ch")).toBeTruthy();
	}
);

//TODO1
test('expect syntax completion ordered by popularity', () => {
	const mmpSource =
		'$theorem impbii\n' +
		'h50::impbii.1       |- ( ph -> ps )\n' +
		'52::impbi           |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) )\n' +
		'qed:50,51,52:mp2   |- ( ph <->   )';
	//           cursor context is here ^
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser.labelToStatementMap,
		impbiiMmParser.outermostBlock, impbiiMmParser.grammar, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmStatistics: MmStatistics = new MmStatistics(impbiiMmParser);
	mmStatistics.buildStatistics();
	const mmpStatistics: MmpStatistics = new MmpStatistics(mmpParser);
	mmpStatistics.buildStatistics();
	const cursorContext: CursorContext = new CursorContext(3, 31, mmpParser);
	const syntaxCompletion: SyntaxCompletion = new SyntaxCompletion(cursorContext, impbiiMmParser,
		mmpParser, mmStatistics,mmpStatistics);
	const completionItems: CompletionItem[] = syntaxCompletion.completionItems();
	expect(completionItems.length).toBeGreaterThan(3);
	completionItems.forEach((completionItem: CompletionItem) => {
		if (completionItem.label == 'ph')
			expect(completionItem.sortText?.startsWith('0')).toBeTruthy();
		if (completionItem.label == 'th')
			// there are 4 assertions with 'th', and 99999 - 4 = 99995
			expect(completionItem.sortText).toBe('199995');
	});
	// expect(mmpParser.diagnostics.length).toBe(1);

});