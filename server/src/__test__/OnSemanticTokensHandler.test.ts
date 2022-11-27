import { SemanticTokens, SemanticTokensParams } from 'vscode-languageserver';
import { OnSemanticTokensHandler, semanticTokenTypes } from '../languageServerHandlers/OnSemanticTokensHandler';
import { IConfigurationManager, IVariableKindConfiguration } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpParser } from '../mmp/MmpParser';
import { opelcnMmParser } from './GlobalForTest.test';


class TestOnSemanticTokensHandler extends OnSemanticTokensHandler {
	public buildSemanticTokens(mmParser: MmParser, mmpParser: MmpParser,
		variableKindsConfiguration: Map<string, IVariableKindConfiguration>) {
		return super.buildSemanticTokens(mmParser, mmpParser, variableKindsConfiguration);
	}
}

test('semantic tokens', () => {
	const mmpSource =
		'ax-mp |- ph\n' +
		'* comment\n' +
		'd1: |- ( A. x e. A -> x e. B )\n' +
		'qed:: |- ps\n' +
		'd x y';
	const expectedData: number[] = [
		0, 9, 2, 1, 0,  // ph : 1 stands for 'variable' i.e. 'wff'
		1, 0, 1, 0, 0,  // * 0 stands for 'comment'
		0, 2, 7, 0, 0,  // comment
		1, 12, 1, 2, 0, // first x : 2 stands for 'string' i.e. 'setvar'
		0, 5, 1, 3, 0,  // A : 3 stands for 'keyword' i.e. 'class'
		0, 5, 1, 2, 0,  // second x : 2 stands for 'string' i.e. 'setvar'
		0, 5, 1, 3, 0,  // B : 3 stands for 'keyword' i.e. 'class'
		1, 9, 2, 1, 0,  // ps : 1 stands for 'variable' i.e. 'wff'
		1, 2, 1, 2, 0,  // third x : 2 stands for 'string' i.e. 'setvar'
		0, 2, 1, 2, 0  // y : 2 stands for 'string' i.e. 'setvar'
	];
	const mmpParser: MmpParser = new MmpParser(mmpSource, opelcnMmParser, opelcnMmParser.workingVars);
	// const outermostBlock: BlockStatement = new BlockStatement(null);
	mmpParser.parse();
	const semanticTokenParams: SemanticTokensParams = { textDocument: { uri: '' } };
	// const co2: Connection
	// const co: ConfigurationManager = new ConfigurationManager(true,true,)
	const dummyConfigurationManager: IConfigurationManager = {
		variableKindsConfiguration: function (_uri: string): Map<string, IVariableKindConfiguration> {
			return new Map<string, IVariableKindConfiguration>();
		}
	};
	const varKindsConfiguration: Map<string, IVariableKindConfiguration> = new Map<string, IVariableKindConfiguration>();
	varKindsConfiguration.set('wff', { workingVarPrefix: 'W', lspSemantictokenType: 'variable' });
	varKindsConfiguration.set('setvar', { workingVarPrefix: 'S', lspSemantictokenType: 'string' });
	varKindsConfiguration.set('class', { workingVarPrefix: 'C', lspSemantictokenType: 'keyword' });
	const testOnSemanticTokensHandler: TestOnSemanticTokensHandler = new TestOnSemanticTokensHandler(
		semanticTokenParams, semanticTokenTypes, dummyConfigurationManager, opelcnMmParser, mmpParser);
	const semanticTokens: SemanticTokens = testOnSemanticTokensHandler.buildSemanticTokens(opelcnMmParser,
		mmpParser, varKindsConfiguration);
	expect(semanticTokens.data.length).toBe(5 * 10);
	expect(semanticTokens.data).toEqual(expectedData);
	// 	Tokens are sent to the client as a long list of numbers, each group of 5 numbers describe a single token.
	// The first 3 numbers describe the token's line number, character index and length, relative to the previous token
	// The final 2 numbers specify the type of token, the client uses them to index into the arrays given in the

});