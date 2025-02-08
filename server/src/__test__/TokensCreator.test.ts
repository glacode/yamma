import { MmToken } from '../grammar/MmLexer';
import { TokensCreator } from '../mm/TokensCreator';
import { fullPathForTestFile } from './GlobalForTest.test';

test('Test file inclusion', () => {
	const tokensCreator: TokensCreator = new TokensCreator();
	const testFile: string = fullPathForTestFile('include.mm');
	const tokens: MmToken[] = tokensCreator.createTokensFromFile(testFile);
	// the expected number of tokens is the sum of the tokens in the included files
	// plus the tokens in the including file
	// the included files are 'include1.mm', 'include2.mm', 'include3.mm'
	// I've not counted the tokens myself, but I keep this to check if the number
	// of tokens changes
	expect(tokens.length).toBe(276);
	// the first three tokens are the in the included 'include1.mm' file
	expect(tokens[0].value).toBe('$c');
	expect(tokens[0].range.start.line).toBe(0);
	expect(tokens[0].range.start.character).toBe(2);
	expect(tokens[0].range.end.character).toBe(4);
	expect(tokens[1].value).toBe('(');
	expect(tokens[1].filePath).toContain('server/src/__test__/../mmTestFiles/included1.mm');
	expect(tokens[2].value).toBe('$.');
	// the following three tokens are the in the including 'include.mm' file
	expect(tokens[6].value).toBe('$c');
	expect(tokens[6].range.start.line).toBe(1);
	expect(tokens[6].filePath).toContain('server/src/__test__/../mmTestFiles/include.mm');
	expect(tokens[7].value).toBe('->');
	expect(tokens[7].range.start.line).toBe(1);
	expect(tokens[7].range.end.line).toBe(1);
	expect(tokens[8].value).toBe('$.');
	let containsMpd2 = false;
	tokens.forEach((mmToken: MmToken) => {
		if (mmToken.value === 'mpd.2') {
			// this is a token in second level included file 'include3.mm':
			// 'include.mm' includes 'include2.mm' which includes 'include3.mm'
			containsMpd2 = true;
			expect(mmToken.filePath).toContain('server/src/__test__/../mmTestFiles/included3.mm');
			expect(mmToken.range.start.line).toBe(3);
			expect(mmToken.range.start.character).toBe(4);
		}
	});
	expect(containsMpd2).toBe(true);
});