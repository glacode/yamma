import DiagnosticMessageForSyntaxError, { IExtensionSettings, IVariableKindConfiguration, LabelsOrderInCompressedProof, ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import * as fs from 'fs';
import { MmStatistics } from '../mm/MmStatistics';
import { GlobalState } from '../general/GlobalState';
import { IFormulaClassifier } from '../stepSuggestion/IFormulaClassifier';
import { SyntaxTreeClassifierFull } from '../stepSuggestion/SyntaxTreeClassifierFull';
import { SyntaxTreeClassifierImp } from '../stepSuggestion/SyntaxTreeClassifierImp';


const variableKindsConfiguration: Map<string, IVariableKindConfiguration> = new Map<string, IVariableKindConfiguration>();
variableKindsConfiguration.set('wff', { workingVarPrefix: 'W', lspSemantictokenType: 'variable' });
variableKindsConfiguration.set('setvar', { workingVarPrefix: 'S', lspSemantictokenType: 'string' });
variableKindsConfiguration.set('class', { workingVarPrefix: 'C', lspSemantictokenType: 'keyword' });
export const lastFetchedSettings: IExtensionSettings = {
	maxNumberOfProblems: 100, mmFileFullPath: '',
	proofMode: ProofMode.normal,
	labelsOrderInCompressedProof: LabelsOrderInCompressedProof.mostReferencedFirstAndNiceFormatting,
	diagnosticMessageForSyntaxError: DiagnosticMessageForSyntaxError.short,
	variableKindsConfiguration: variableKindsConfiguration
};

export const globalState: GlobalState = new GlobalState();
globalState.lastFetchedSettings = lastFetchedSettings;

export function fullPathForTestFile(fileName: string): string {
	const mmFilePath = __dirname.concat("/../mmTestFiles/" + fileName);
	return mmFilePath;
}

export function readTestFile(fileName: string): string {
	const mmFilePath = fullPathForTestFile(fileName);
	const theory: string = fs.readFileSync(mmFilePath, 'utf-8');
	return theory;
}

export function createMmParser(fileName: string): MmParser {
	const theoryText: string = readTestFile(fileName);
	const mmParser: MmParser = new MmParser(globalState);
	mmParser.ParseText(theoryText);
	return mmParser;
}

/**the minimium theory needed to proof mp2 */
export const mp2Theory = '$c ( $. $c ) $. $c -> $. $c wff $. $c |- $. $v ph $. ' +
	'$v ps $. $v ch $. wph $f wff ph $. wps $f wff ps $. wch $f wff ch $.\n' +
	'wi $a wff ( ph -> ps ) $.\n' +
	'${ min $e |- ph $.  maj $e |- ( ph -> ps ) $. ax-mp $a |- ps $.  $}';
export const mp2MmParser: MmParser = new MmParser(globalState);
mp2MmParser.ParseText(mp2Theory);
mp2MmParser.createParseNodesForAssertionsSync();

// export const mp2Parser: MmParser = new MmParser();
// mp2Parser.ParseText(mp2Theory);

export const mp2Statistics: MmStatistics = new MmStatistics(mp2MmParser);
mp2Statistics.buildStatistics();

export const impbiiMmParser: MmParser = createMmParser('impbii.mm');

// const eqeq1iTheory: string = readTestFile('eqeq1i.mm');
// const eqeq1iMmParser: MmParser = new MmParser();
// eqeq1iMmParser.ParseText(eqeq1iTheory);

export const eqeq1iMmParser: MmParser = createMmParser('eqeq1i.mm');
eqeq1iMmParser.createParseNodesForAssertionsSync();

export const opelcnMmParser: MmParser = createMmParser('opelcn.mm');
opelcnMmParser.createParseNodesForAssertionsSync();

export const opelcnStatistics: MmStatistics = new MmStatistics(opelcnMmParser);
opelcnStatistics.buildStatistics();

export const elexdMmParser: MmParser = createMmParser('elexd.mm');
elexdMmParser.createParseNodesForAssertionsSync();

// const vexTheory: string = readTestFile('vex.mm');
// export const vexTheoryMmParser: MmParser = new MmParser();
// vexTheoryMmParser.ParseText(vexTheory);
export const vexTheoryMmParser: MmParser = createMmParser('vex.mm');

export const vexStatistics: MmStatistics = new MmStatistics(vexTheoryMmParser);
vexStatistics.buildStatistics();


export const kindToPrefixMap: Map<string, string> = new Map<string, string>();
kindToPrefixMap.set('wff', 'W');
kindToPrefixMap.set('class', 'C');
kindToPrefixMap.set('setvar', 'S');

test('dummy test to avoid "Your test suite must contain at least one test" error message', () => {
	expect(mp2MmParser.isParsingComplete).toBeTruthy();
	expect(mp2MmParser.parseFailed).toBeFalsy();
});

test('impbii ok', () => {
	const impbiiMmParser2: MmParser = createMmParser('impbii.mm');
	expect(impbiiMmParser2.isParsingComplete).toBeTruthy();
	expect(impbiiMmParser2.parseFailed).toBeFalsy();
});

export function formulaClassifiersForTest() : IFormulaClassifier[] {
	const syntaxTreeClassifierFull: SyntaxTreeClassifierFull = new SyntaxTreeClassifierFull(3);
	const syntaxTreeClassifierImp: SyntaxTreeClassifierImp = new SyntaxTreeClassifierImp(2);
	const classifiers: IFormulaClassifier[] = [syntaxTreeClassifierFull,syntaxTreeClassifierImp];
	return classifiers;
}