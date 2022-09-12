import { concatTokenValuesWithSpaces } from '../mm/Utils';
import { MmtParser } from '../mmt/MmtParser';

test('exlimddv should be successfully parsed', () => {
	const mmtContent =
		'${\n' +
		'$d x ch $.  $d x ph $.\n' +
		'exlimddv.1 $e |- ( ph -> E. x \n' +
		'ps ) $.\n' +
		'exlimddv.2 $e |- ( ( ph /\\ ps ) -> ch ) $.\n' +
		'$( Some comment spanning two\n' +
		'rows $)\n' +
		'exlimddv $p |- ( ph -> ch ) $=\n' +
		'( wex ex exlimdv mpd ) ABDGCEABCDABCFHIJ $.\n' +
		'$}';
	const mmtParser: MmtParser = new MmtParser(mmtContent);
	mmtParser.parse();
	expect(mmtParser.parseFailed).toBeFalsy();
	expect(mmtParser.theorem).toBeDefined();
	expect(mmtParser.theorem?.disjVars.map.size).toBe(2);
	expect(mmtParser.theorem?.disjVars.map.get('ch')?.size).toBe(1);
	expect(mmtParser.theorem?.disjVars.containsDjContraint('x', 'ch')).toBeTruthy();
	expect(mmtParser.theorem?.disjVars.map.get('ph')?.size).toBe(1);
	expect(mmtParser.theorem?.disjVars.containsDjContraint('x', 'ph')).toBeTruthy();
	expect(mmtParser.theorem?.eHyps.length).toBe(2);
	expect(mmtParser.theorem?.eHyps[0].label?.value).toEqual('exlimddv.1');
	let formula: string = concatTokenValuesWithSpaces(mmtParser.theorem!.eHyps[0].formula!);
	expect(formula).toEqual('|- ( ph -> E. x ps )');
	expect(mmtParser.theorem?.eHyps[1].label?.value).toEqual('exlimddv.2');
	formula = concatTokenValuesWithSpaces(mmtParser.theorem!.eHyps[1].formula!);
	expect(formula).toEqual('|- ( ( ph /\\ ps ) -> ch )');
	expect(mmtParser.theorem?.pStatement!.label?.value).toEqual('exlimddv');
	formula = concatTokenValuesWithSpaces(mmtParser.theorem!.pStatement!.formula!);
	expect(formula).toEqual('|- ( ph -> ch )');
});


test('multiple disj vars constraints should be successfully parsed', () => {
	const mmtContent =
		'${\n' +
		'$d x ph ch $.  $d ph w z $.\n' +
		'$}';
	const mmtParser: MmtParser = new MmtParser(mmtContent);
	mmtParser.parse();
	expect(mmtParser.parseFailed).toBeFalsy();
	expect(mmtParser.theorem).toBeDefined();
	expect(mmtParser.theorem?.disjVars.containsDjContraint('x', 'ch')).toBeTruthy();
	expect(mmtParser.theorem?.disjVars.containsDjContraint('x', 'ph')).toBeTruthy();
	expect(mmtParser.theorem?.disjVars.containsDjContraint('ch', 'ph')).toBeTruthy();
	expect(mmtParser.theorem?.disjVars.containsDjContraint('w', 'ph')).toBeTruthy();
	expect(mmtParser.theorem?.disjVars.containsDjContraint('z', 'ph')).toBeTruthy();
	expect(mmtParser.theorem?.disjVars.containsDjContraint('w', 'z')).toBeTruthy();
	expect(mmtParser.theorem?.disjVars.containsDjContraint('x', 'w')).toBeFalsy();
});