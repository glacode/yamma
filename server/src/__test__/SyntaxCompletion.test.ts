import { SyntaxCompletion } from '../syntaxCompletion/SyntaxCompletion';

class TestSyntaxCompletion extends SyntaxCompletion {
	public static getSymbolsFromErrorMessage(errorMessage: string) {
		return SyntaxCompletion.getSymbolsFromErrorMessage(errorMessage);
	}
}

test("creation of a list of symbols from a nearly.js error message",
    () => {
        const errorMessage = 'Unexpected "UnxpexcteEndOfFormula". Instead, I was expecting to see one of the following:\n'+
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