import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { Frame } from '../mm/Frame';
import { MmParser } from '../mm/MmParser';
import { Statement, ZIStatement, ZRStatement } from '../mm/Statements';
import { ProvableStatement } from "../mm/ProvableStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement } from "../mm/AssertionStatement";
import * as fs from 'fs';
import { Verifier } from '../mm/Verifier';
import { ProofCompressor } from '../mmp/ProofCompressor';
import { GrammarManager } from '../grammar/GrammarManager';
import { CompletionItemKind } from 'vscode-languageserver';
import { IFormulaClassifier } from './IFormulaClassifier';
import { StepSuggestionTripleMap } from './StepSuggestionTripleMap';
import { MmLexerFromStringArray } from '../grammar/MmLexerFromStringArray';
import { Grammar, Parser } from 'nearley';
import { FHyp } from '../mm/FHyp';
import { EHyp } from '../mm/EHyp';

export interface IStepSuggestion {
	completionItemKind: CompletionItemKind,
	label: string,
	multiplicity: number
}

// export interface ICompletionItemGroup {
// 	formulaClassifier: IFormulaClassifier,
// 	completionItemKind: CompletionItemKind
// }

export class ModelBuilder {
	private mmFilePath: string;
	// private completionItemGroups: ICompletionItemGroup[];
	private formulaClassifiers: IFormulaClassifier[];


	//TODO it looks like you are NOT using this._fHypLabels , remove it
	// used just for performance
	private _fHypLabels: Set<string>;

	private _mmParser: MmParser | undefined;

	/** change this one if you want ConsoleLog messages */
	private notifyProgressEnabled;


	//TODO use class StepSuggestionMap
	/** maps a rpn string representation of a parse node to a map that associates
	 * every label (with multiplicity) used to justify such a formula
	 */
	stepGiustificationStatistics: Map<string, Map<string, number>>;

	stepSuggestionTripleMap: StepSuggestionTripleMap;



	constructor(mmFilePath: string, formulaClassifiers: IFormulaClassifier[],
		notifyProgressEnabled: boolean) {
		this.mmFilePath = mmFilePath;
		this.formulaClassifiers = formulaClassifiers;
		this.notifyProgressEnabled = notifyProgressEnabled;

		this.stepGiustificationStatistics = new Map<string, Map<string, number>>();
		this.stepSuggestionTripleMap = new StepSuggestionTripleMap();

		this._fHypLabels = new Set<string>();

		// this.completionItemKind = this.initializeCompletionItemKind(formulaClassifiers);
	}

	// private initializeCompletionItemKind(formulaClassifiers: IFormulaClassifier[]): Map<string, CompletionItemKind> {
	// 	//TODO if formulaClassifier.length > 2 you will get an exception, later on; you
	// 	//may cycle modulo n
	// 	const completionItemKindArray: CompletionItemKind[] = [
	// 		CompletionItemKind.Event,
	// 		CompletionItemKind.Interface
	// 	];
	// 	const completionItemKind: Map<string, CompletionItemKind> = new Map<string, CompletionItemKind>();
	// 	formulaClassifiers.forEach((formulaClassifier: IFormulaClassifier, index: number) => {
	// 		completionItemKind.set(formulaClassifier.id, completionItemKindArray[index]);
	// 	});
	// 	return completionItemKind;
	// }

	//#region buildModel

	//#region buildStepSuggestionTripleMap

	private buildFHyps() {
		this._mmParser!.labelToStatementMap.forEach((labeledStatement: LabeledStatement) => {
			if (labeledStatement instanceof FHyp)
				this._fHypLabels.add(labeledStatement.Label);
		});
	}


	//#region addSingleProofToModel

	//#region addDecompressedProofToModel

	//#region addSingleStepToTheModel

	//#region addAssertionStatementWithSubstitution

	//#region buildRpnSyntaxTree

	/** builds a rpn string representing the syntax tree of the given formula */
	private syntaxTree(parseNode: ParseNode, currentLevel: number, maxLevel: number): string {
		let treeString = '';
		// we don't want to consider FHyps labels
		// if (currentLevel <= maxLevel && parseNode instanceof InternalNode && !this._fHypLabels.has(parseNode.label)) {
		if (currentLevel <= maxLevel && parseNode instanceof InternalNode &&
			!GrammarManager.isInternalParseNodeForFHyp(parseNode, this._mmParser!.outermostBlock.v)
			&& !GrammarManager.isInternalParseNodeForWorkingVar(parseNode)) {
			parseNode.parseNodes.forEach((childNode: ParseNode) => {
				const subTree: string = this.syntaxTree(childNode, currentLevel + 1, maxLevel);
				if (subTree != '') {
					if (treeString != '')
						treeString += ' ';
					treeString += subTree;
				}
			});
			if (treeString != '')
				treeString += ' ';
			treeString += parseNode.label;
		}
		return treeString;
	}
	// private buildRpnSyntaxTree(assertionStatementWithSubstitution: string[], grammar: Grammar): string {
	// 	// const parseNode: ParseNode = assertionStatementProofStep.parseNode;
	// 	// const grammar: Grammar = assertionStatementProofStep.outermostBlock!.grammar!;
	// 	grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
	// 	const parser = new Parser(grammar);
	// 	parser.feed('');
	// 	const parseNode: ParseNode = parser.results[0];
	// 	const rpnSyntaxTree: string = this.syntaxTree(parseNode, 0, 3);
	// 	return rpnSyntaxTree;
	// }
	//#endregion buildRpnSyntaxTree


	private parseNode(assertionStatementWithSubstitution: string[]): ParseNode {
		// this.mmParser.grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		const grammar: Grammar = this._mmParser!.grammar;
		grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		// const parser = new Parser(this.mmParser.grammar);
		const parser = new Parser(grammar);
		parser.feed('');
		const parseNode: ParseNode = parser.results[0];
		return parseNode;
	}

	addStepGiustificationStatistics(formulaClassifierId: string, formulaClusterId: string, currentStepLabel: string) {
		this.stepSuggestionTripleMap.add(formulaClassifierId, formulaClusterId, currentStepLabel);
	}
	//#endregion addStepGiustificationStatistics

	addAssertionStatementWithSubstitution(assertionStatementProofStep: AssertionStatement,
		assertionStatementWithSubstitution: string[]) {
		// const rpnSyntaxTree: string = this.buildRpnSyntaxTree(assertionStatementWithSubstitution,
		// 	assertionStatementProofStep.outermostBlock!.grammar!);
		const parseNode: ParseNode = this.parseNode(assertionStatementWithSubstitution);
		this.formulaClassifiers.forEach((formulaClassifier: IFormulaClassifier) => {
			// const rpnSyntaxTree: string = this.completionItemGroups.classify(parseNode, this._mmParser!);
			const rpnSyntaxTree: string | undefined = formulaClassifier.classify(parseNode, this._mmParser!);
			if (rpnSyntaxTree != undefined) {
				const currentStepLabel: string = assertionStatementProofStep.Label;
				// this.addStepGiustificationStatistics(rpnSyntaxTree, currentStepLabel);
				this.stepSuggestionTripleMap.add(formulaClassifier.id, rpnSyntaxTree, currentStepLabel);
			}
		});
	}
	//#endregion addAssertionStatementWithSubstitution

	private addSingleStepToTheModel(assertionStatementProofStep: AssertionStatement, stack: string[][],
		verifier: Verifier) {
		const frameProofStep: Frame = <Frame>assertionStatementProofStep.frame;
		const popCount: number = frameProofStep.fHyps.length + frameProofStep.eHyps.length;
		const fHypsStack: string[][] = verifier.fHypsStack(frameProofStep, stack);
		const substitution: Map<string, string[]> =
			verifier.buildSubstitution(frameProofStep.fHyps, fHypsStack);
		for (let i = 0; i < popCount; i++)
			stack.pop();
		const assertionStatementWithSubstitution: string[] =
			verifier.applySubstitution(assertionStatementProofStep.formula, substitution);
		if (assertionStatementWithSubstitution[0] == '|-')
			this.addAssertionStatementWithSubstitution(assertionStatementProofStep,
				assertionStatementWithSubstitution);
		stack.push(assertionStatementWithSubstitution);
	}
	//#endregion addSingleStepToTheModel

	private addDecompressedProofToModel(proof: Statement[]) {
		const stack: string[][] = [];
		const stored: string[][] = [];
		const verifier: Verifier = new Verifier([]);

		proof.forEach((statement: Statement, _i: number) => {
			if (statement instanceof FHyp) {
				stack.push(statement.formula);
			} else if (statement instanceof EHyp) {
				//TODO see if you can use a single if for FHyp and EHyp
				stack.push(statement.formula);
			} else if (statement instanceof ZIStatement) {
				stored.push(stack[stack.length - 1]);
			} else if (statement instanceof ZRStatement) {
				stack.push(stored[(<ZRStatement>statement).referencedZ]);
			} else if (statement instanceof AssertionStatement)
				this.addSingleStepToTheModel(<AssertionStatement>statement, stack, verifier);
		});
	}
	//#endregion addDecompressedProofToModel


	private addSingleProofToModel(provableStatement: ProvableStatement) {
		const proofCompressor: ProofCompressor = new ProofCompressor();
		const proof: Statement[] = proofCompressor.DecompressProof(provableStatement, this._mmParser!.labelToStatementMap);
		this.addDecompressedProofToModel(proof);
	}
	//#endregion addSingleProofToModel

	private notifyProgress(current: number, total: number) {
		const previousPercentageOfWorkDone: number = Math.trunc(((current - 1) * 100) / total);
		const percentageOfWorkDone: number = Math.trunc((current * 100) / total);
		if (previousPercentageOfWorkDone < percentageOfWorkDone) {
			const used: number = process.memoryUsage().heapUsed / 1024 / 1024;
			const total: number = process.memoryUsage().heapTotal / 1024 / 1024;
			const memory = `Memory heap used/total ${Math.round(used * 100) / 100} MB / ${Math.round(total * 100) / 100}`;
			console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
			console.log(percentageOfWorkDone + '% - ' + memory + new Date());
		}
	}

	protected buildStepSuggestionTripleMap() {
		// const mmFilePath = __dirname.concat('/../../src/mmTestFiles/impbii.mm');
		// const mmFilePath = '/home/mionome/Desktop/provashare/mmp/set.mm';
		const theory: string = fs.readFileSync(this.mmFilePath, 'utf-8');
		// const theory: string = readTestFile('impbii.mm');
		this._mmParser = new MmParser();
		this._mmParser.ParseText(theory);
		// this.formulaClassifier.setMmParser(this._mmParser);
		this.buildFHyps();
		this._mmParser.labelToStatementMap.forEach((labeledStatement: LabeledStatement, _label: string) => {
			if (labeledStatement instanceof ProvableStatement)
				this.addSingleProofToModel(labeledStatement);
			if (this.notifyProgressEnabled)
				this.notifyProgress(labeledStatement.statementNumber, this._mmParser!.labelToStatementMap.size);
		});
	}

	//#endregion buildStepSuggestionTripleMap

	//#region sortSuggestionsAndSave
	save(textToWrite: string) {
		const fileToWrite = this.mmFilePath + 's';
		fs.writeFileSync(fileToWrite, textToWrite);
		// fs.writeFileSync(fileToWrite, csvLine,
		// 	{
		// 		encoding: "utf8",
		// 		flag: "a+",
		// 		mode: 0o666
		// 	});
	}
	private sortSuggestionsAndSave() {
		// const textToWrite: string = this.buildTextToWrite();
		const textToWrite: string = this.stepSuggestionTripleMap.buildTextToWrite();
		console.log('writing to disk...');
		this.save(textToWrite);
		console.log('written to disk!');
	}
	//#endregion sortSuggestionsAndSave

	buildModel() {
		this.buildStepSuggestionTripleMap();
		this.sortSuggestionsAndSave();
	}
	//#endregion buildModel

	static buildModelFileFullPath(mmFilePath: string): string {
		//TODO below I'm using a hardwired logic (the model for .mm becomes the same file with .mms); you should
		//add a configuration parameter, instead
		return mmFilePath + 's';
	}


}
