import { Range, SemanticTokenModifiers, SemanticTokens, SemanticTokensParams, SemanticTokenTypes, uinteger } from 'vscode-languageserver';
import { MmToken } from '../grammar/MmLexer';
import { IConfigurationManager, IVariableKindConfiguration } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { DisjVarUStatement } from '../mm/Statements';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { IUStatement, UComment } from '../mmp/UStatement';
import { WorkingVars } from '../mmp/WorkingVars';


export const semanticTokenTypes: SemanticTokenTypes[] = [
	SemanticTokenTypes.comment,  // comment
	SemanticTokenTypes.variable,  // wff
	SemanticTokenTypes.string,  // set
	SemanticTokenTypes.keyword,  // class
	SemanticTokenTypes.parameter,
	SemanticTokenTypes.property,
	SemanticTokenTypes.namespace,
	SemanticTokenTypes.class,
	SemanticTokenTypes.macro,
	SemanticTokenTypes.operator
];

export class OnSemanticTokensHandler {

	private semanticTokenParams: SemanticTokensParams;
	private configurationManager: IConfigurationManager;
	private mmParser: MmParser;
	private mmpParser: MmpParser;
	private workingVars: WorkingVars;


	semanticTokensData: uinteger[];

	/** this is used to compute relative lines */
	private previousTokenStartLine: number;
	/** this is used to compute relative character */
	private previousTokenStartCharacter: number;

	// private semanticTokenTypesMap: Map<SemanticTokenTypes, number>;
	private semanticTokenTypesMap: Map<string, number>;
	// private variableKindsConfiguration: Map<string, IVariableKindConfiguration>;


	constructor(semanticTokenParams: SemanticTokensParams, semanticTokenTypes: SemanticTokenTypes[],
		configurationManager: IConfigurationManager, mmParser: MmParser, mmpParser: MmpParser) {
		this.semanticTokenParams = semanticTokenParams;
		this.configurationManager = configurationManager;
		this.mmParser = mmParser;
		this.mmpParser = mmpParser;
		this.workingVars = mmpParser.workingVars;

		// this.variableKindsConfiguration = new Map<string, IVariableKindConfiguration>();

		this.semanticTokensData = [];

		this.previousTokenStartLine = 0;
		this.previousTokenStartCharacter = 0;

		this.semanticTokenTypesMap = new Map<SemanticTokenTypes, number>();
		// TODO use a single array that you assign in server.ts for tokenTypes: and that
		// you use here, in a cycle, to build the map programmatically
		for (let i = 0; i < semanticTokenTypes.length; i++) {
			this.semanticTokenTypesMap.set(semanticTokenTypes[i], i);
		}
		// this.semanticTokenTypesMap.set(SemanticTokenTypes.comment, 0);
		// this.semanticTokenTypesMap.set(SemanticTokenTypes.variable, 1);

	}
	//#region semanticTokens

	async setVariableKindsConfiguration(): Promise<Map<string, IVariableKindConfiguration>> {
		// this.variableKindsConfiguration =
		return await this.configurationManager.variableKindsConfiguration(this.semanticTokenParams.textDocument.uri);
	}

	//#region buildSemanticTokens
	// addSemanticToken(startLine: number, startCharacter: number, length: number,
	// addSemanticToken(tokenRange: Range,
	// 	semanticTokenType: SemanticTokenTypes, _semanticTokenModifier?: SemanticTokenModifiers) {
	addSemanticToken(tokenRange: Range,
		semanticTokenType: string, _semanticTokenModifier?: SemanticTokenModifiers) {
		const numSemanticTokenType: number | undefined = this.semanticTokenTypesMap.get(semanticTokenType);
		if (numSemanticTokenType != undefined) {
			const relativeStartLine: number = tokenRange.start.line - this.previousTokenStartLine;
			let relativeStartCharacter: number = tokenRange.start.character - this.previousTokenStartCharacter;
			if (relativeStartLine > 0)
				// we are on a new line, with respect to the last token handled by this semantic token handler
				relativeStartCharacter = tokenRange.start.character;
			// we are not using SemanticTokenModifiers for now
			const numSemanticTokenModifier = 0;
			const semanticToken: uinteger[] = [
				relativeStartLine,
				relativeStartCharacter,
				tokenRange.end.character - tokenRange.start.character,
				numSemanticTokenType,
				numSemanticTokenModifier
			];
			this.semanticTokensData = this.semanticTokensData.concat(semanticToken);
			this.previousTokenStartLine = tokenRange.start.line;
			this.previousTokenStartCharacter = tokenRange.start.character;
		}
	}
	addSemanticTokensForComment(uComment: UComment) {
		uComment.contentTokens.forEach((token: MmToken) => {
			// this.addSemanticToken(token.range.start.line, token.range.start.character,
			// 	token.range.end.character - token.range.start.character, SemanticTokenTypes.comment,
			// 	SemanticTokenModifiers.abstract);
			this.addSemanticToken(token.range, SemanticTokenTypes.comment,
				SemanticTokenModifiers.abstract);
		});
		// this.tokens = this.tokens.concat([
		// 	range.start.line,
		// 	range.start.character,
		// 	range.end.character - range.start.character,
		// 	TokensLegend.getTokenType(tokenType),
		// 	TokensLegend.getTokenModifiers(tokenModifiers)
		// ]);

	}

	//#region addSemanticTokensForArrayOfSymbols
	async addSemanticTokenForKind(range: Range, kind: string, variableKindsConfiguration: Map<string, IVariableKindConfiguration>) {
		if (variableKindsConfiguration != undefined) {
			const semanticTokenType: IVariableKindConfiguration | undefined = variableKindsConfiguration.get(kind);
			if (semanticTokenType != undefined)
				// the configuration contains the given variable kind
				this.addSemanticToken(range, semanticTokenType.lspSemantictokenType);
		}

		// if (kind == 'wff')
		// 	this.addSemanticToken(token.range, SemanticTokenTypes.variable);
		// else if (kind == 'setvar')
		// 	this.addSemanticToken(token.range, SemanticTokenTypes.string);
		// else if (kind == 'class')
		// 	this.addSemanticToken(token.range, SemanticTokenTypes.keyword);
	}

	getKindForVariable(symbol: string, mmParser: MmParser): string | undefined {
		let kind: string | undefined = mmParser.outermostBlock.kindOf(symbol);
		if (kind == undefined)
			// the given symbol is not a variable in the theory
			kind = this.workingVars.kindOf(symbol);
		return kind;
	}

	addSemanticTokensForArrayOfSymbols(symbols: MmToken[] | undefined, mmParser: MmParser,
		variableKindsConfiguration: Map<string, IVariableKindConfiguration>) {
		// const symbols: MmToken[] | undefined = symbols.formula;
		if (symbols != undefined)
			symbols.forEach((token: MmToken) => {
				const kind: string | undefined = this.getKindForVariable(token.value, mmParser);
				// const kind: string | undefined = mmParser.outermostBlock.kindOf(token.value);
				if (kind != undefined)
					// current token is for a variable in the theory
					this.addSemanticTokenForKind(token.range, kind, variableKindsConfiguration);
			});
	}
	//#endregion addSemanticTokensForArrayOfSymbols

	protected buildSemanticTokens(mmParser: MmParser, mmpParser: MmpParser,
		variableKindsConfiguration: Map<string, IVariableKindConfiguration>): SemanticTokens {
		// const mmTokens: MmToken = mmpParser.mmTokens;
		mmpParser.uProof?.uStatements.forEach((uStatement: IUStatement) => {
			if (uStatement instanceof UComment)
				this.addSemanticTokensForComment(uStatement);
			// else if (uStatement instanceof UProofStep)
			else if (uStatement instanceof MmpProofStep)
				this.addSemanticTokensForArrayOfSymbols(uStatement.formula, mmParser, variableKindsConfiguration);
			else if (uStatement instanceof DisjVarUStatement)
				this.addSemanticTokensForArrayOfSymbols(uStatement.disjointVars, mmParser, variableKindsConfiguration);
		});
		// this.semanticTokensData = [ 1 , 0 , 1 , 0 , 0 , 0 , 2 , 2 , 0 , 0];
		const semanticTokens: SemanticTokens = {
			data: this.semanticTokensData
		};
		return semanticTokens;
	}
	//#endregion buildSemanticTokens

	async semanticTokens(): Promise<SemanticTokens> {
		const variableKindsConfiguration: Map<string, IVariableKindConfiguration> = await this.setVariableKindsConfiguration();
		this.semanticTokensData = [];
		if (this.mmParser != undefined && this.mmpParser != undefined) {
			// this.buildSemanticTokens(mmParser, mmpParser, variableKindsConfiguration);
			this.buildSemanticTokens(this.mmParser, this.mmpParser, variableKindsConfiguration);
		}
		const result: SemanticTokens = {
			data: this.semanticTokensData
		};
		return result;

		// throw new Error('Method not implemented.');
	}
	//#endregion semanticTokens
}