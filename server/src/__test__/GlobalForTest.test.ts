import { MmParser } from '../mm/MmParser';
import { readTestFile } from '../mm/Utils';

export function createMmParser(fileName: string): MmParser {
	const theoryText: string = readTestFile(fileName);
	const mmParser: MmParser = new MmParser();
	mmParser.ParseText(theoryText);
	return mmParser;
}

export const impbiiMmParser: MmParser = createMmParser('impbii.mm');

// const eqeq1iTheory: string = readTestFile('eqeq1i.mm');
// const eqeq1iMmParser: MmParser = new MmParser();
// eqeq1iMmParser.ParseText(eqeq1iTheory);

export const eqeq1iMmParser: MmParser = createMmParser('eqeq1i.mm');

export const opelcnMmParser: MmParser = createMmParser('opelcn.mm');

export const mp2Theory = '$c ( $. $c ) $. $c -> $. $c wff $. $c |- $. $v ph $. ' +
	'$v ps $. $v ch $. wph $f wff ph $. wps $f wff ps $. wch $f wff ch $.\n' +
	'wi $a wff ( ph -> ps ) $.\n' +
	'${ min $e |- ph $.  maj $e |- ( ph -> ps ) $. ax-mp $a |- ps $.  $}';
export const mp2MmParser: MmParser = new MmParser();
mp2MmParser.ParseText(mp2Theory);

test('dummy test to avoid "Your test suite must contain at least one test" error message' , () => {
	expect(mp2MmParser.isParsingComplete).toBeTruthy();
	expect(mp2MmParser.parseFailed).toBeFalsy();
});

//QUI!!!
test('impbii ok' , () => {
	const impbiiMmParser2: MmParser = createMmParser('impbii.mm');
	expect(impbiiMmParser2.isParsingComplete).toBeTruthy();
	expect(impbiiMmParser2.parseFailed).toBeFalsy();
});