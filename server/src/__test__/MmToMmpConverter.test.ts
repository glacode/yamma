import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { impbiiMmParser, kindToPrefixMap, opelcnMmParser } from './GlobalForTest.test';

//TODO1 18 MAY
test('Expect mmp proof for id theorem, to be inserted', () => {
	// we've decided not to remove the wrong ref
	const mmpSource =
		'\n* comment before\n\n' +
		'$getproof id\n' +
		'qed:5:impbii |- ch';
	const mmpParser: MmpParser = new MmpParser(mmpSource, impbiiMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const newTextExpected =
		'\n* comment before\n\n' +
		'$theorem id\n' +
		'* Principle of\n' +
		'     identity.\n' +
		'1::ax-1             |- ( ph -> ( ph -> ph ) )\n' +
		'2::ax-1             |- ( ph -> ( ( ph -> ph ) -> ph ) )\n' +
		'qed:1,2:mpd        |- ( ph -> ph )\n' +
		'qed:5:impbii       |- ch\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});

test('getproof expect eHyps at the top and the duplicated qed with the same formula to be removed', () => {
	// we've decided not to remove the wrong ref
	const mmpSource =
		'$getproof elabgf\n' +
		'qed: |- ( A e. B -> ( A e. { x | ph } <-> ps ) )';
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, new WorkingVars(kindToPrefixMap));
	mmpParser.parse();
	const mmpUnifier: MmpUnifier = new MmpUnifier(mmpParser, ProofMode.normal, 0);
	mmpUnifier.unify();
	const textEditArray: TextEdit[] = mmpUnifier.textEditArray;
	expect(textEditArray.length).toBe(1);
	const textEdit: TextEdit = textEditArray[0];
	const newTextExpected =
		'\n* MissingComment\n\n' +
		'$theorem elabgf\n' +
		'h1::elabgf.1          |- F/_ x A\n' +
		'h2::elabgf.2         |- F/ x ps\n' +
		'h3::elabgf.3         |- ( x = A -> ( ph <-> ps ) )\n' +
		'4::nfab1              |- F/_ x { x | ph }\n' +
		'5:1,4:nfel           |- F/ x A e. { x | ph }\n' +
		'6:5,2:nfbi          |- F/ x ( A e. { x | ph } <-> ps )\n' +
		'7::eleq1             |- ( x = A -> ( x e. { x | ph } <-> A e. { x | ph } ) )\n' +
		'8:7,3:bibi12d       |- ( x = A -> ( ( x e. { x | ph } <-> ph ) <-> ( A e. { x | ph } <-> ps ) ) )\n' +
		'9::abid             |- ( x e. { x | ph } <-> ph )\n' +
		'qed:1,6,8,9:vtoclgf\n' +
		'                   |- ( A e. B -> ( A e. { x | ph } <-> ps ) )\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});

// h50::elabgf.1       |- F/_ x A
// h51::elabgf.2        |- F/ x ps
// h52::elabgf.3        |- ( x = A -> ( ph <-> ps ) )
// 53::nfab1             |- F/_ x { x | ph }
// 54:50,53:nfel        |- F/ x A e. { x | ph }
// 55:54,51:nfbi       |- F/ x ( A e. { x | ph } <-> ps )
// 56::eleq1            |- ( x = A -> ( x e. { x | ph } <-> A e. { x | ph } ) )
// 57:56,52:bibi12d    |- ( x = A -> ( ( x e. { x | ph } <-> ph ) <-> ( A e. { x | ph } <-> ps ) ) )
// 58::abid            |- ( x e. { x | ph } <-> ph )
// qed:50,55,57,58:vtoclgf 
//                    |- ( A e. B -> ( A e. { x | ph } <-> ps ) )
