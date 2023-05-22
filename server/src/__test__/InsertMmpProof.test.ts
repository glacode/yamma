import { TextEdit } from 'vscode-languageserver';
import { ProofMode } from '../mm/ConfigurationManager';
import { MmpParser } from '../mmp/MmpParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { WorkingVars } from '../mmp/WorkingVars';
import { impbiiMmParser, kindToPrefixMap } from './GlobalForTest.test';

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
		'\n* Principle of\n' +
		'     identity.\n\n' +
		'1::ax-1             |- ( ph -> ( ph -> ph ) )\n' +
		'2::ax-1             |- ( ph -> ( ( ph -> ph ) -> ph ) )\n' +
		'qed:1,2:mpd        |- ( ph -> ph )\n' +
		'qed:5:impbii       |- ch\n';
	expect(textEdit.newText).toEqual(newTextExpected);
});