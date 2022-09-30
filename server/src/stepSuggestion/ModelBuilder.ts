import { Grammar, Parser } from 'nearley';
import { MmLexerFromStringArray } from '../grammar/MmLexerFromStringArray';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { Frame } from '../mm/Frame';
import { MmParser } from '../mm/MmParser';
import { AssertionStatement, EHyp, FHyp, LabeledStatement, ProvableStatement, Statement, ZIStatement, ZRStatement } from '../mm/Statements';
import * as fs from 'fs';
import { Verifier } from '../mm/Verifier';
import { ProofCompressor } from '../mmp/ProofCompressor';
import { GrammarManager } from '../grammar/GrammarManager';
import { notifyProgressWithTimestampAndMemory, notifyWarning } from '../mm/Utils';
import { Connection } from 'vscode-languageserver';

export interface IStepSuggestion {
	label: string,
	multiplicity: number
}

export class ModelBuilder {
	private mmFilePath: string;

	// used just for performance
	private _fHypLabels: Set<string>;

	private _mmParser: MmParser | undefined;


	/** maps a rpn string representation of a parse node to a map that associates
	 * every label (with multiplicity) used to justify such a formula
	 */
	stepGiustificationStatistics: Map<string, Map<string, number>>;

	constructor(mmFilePath: string) {
		this.mmFilePath = mmFilePath;

		this.stepGiustificationStatistics = new Map<string, Map<string, number>>();

		this._fHypLabels = new Set<string>();
	}

	//#region buildModel

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
	syntaxTree(parseNode: ParseNode, currentLevel: number, maxLevel: number): string {
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
	buildRpnSyntaxTree(assertionStatementWithSubstitution: string[], grammar: Grammar): string {
		// const parseNode: ParseNode = assertionStatementProofStep.parseNode;
		// const grammar: Grammar = assertionStatementProofStep.outermostBlock!.grammar!;
		grammar.lexer = new MmLexerFromStringArray(assertionStatementWithSubstitution);
		const parser = new Parser(grammar);
		parser.feed('');
		const parseNode: ParseNode = parser.results[0];
		const rpnSyntaxTree: string = this.syntaxTree(parseNode, 0, 3);
		return rpnSyntaxTree;
	}
	//#endregion buildRpnSyntaxTree

	//#region addStepGiustificationStatistics
	addNewMap(rpnSyntaxTree: string, currentStepLabel: string) {
		const newMap: Map<string, number> = new Map<string, number>();
		newMap.set(currentStepLabel, 1);
		this.stepGiustificationStatistics.set(rpnSyntaxTree, newMap);
	}
	addStepGiustificationStatistics(rpnSyntaxTree: string, currentStepLabel: string) {
		const labelStatistics: Map<string, number> | undefined = this.stepGiustificationStatistics.get(rpnSyntaxTree);
		if (labelStatistics == undefined) {
			// it is the first time a proof step is found with the given rpnSyntaxTree
			this.addNewMap(rpnSyntaxTree, currentStepLabel);
		} else {
			// rpnSyntaxTree was found before as a proof step formula
			const previousMultiplicity: number | undefined = labelStatistics.get(currentStepLabel);
			if (previousMultiplicity == undefined) {
				// it is the first time this formula has been proven using currentStepLabel
				labelStatistics.set(currentStepLabel, 1);
				// this.addNewMap(rpnSyntaxTree, currentStepLabel);
			} else
				// this formula has already been proven using currentStepLabel
				labelStatistics.set(currentStepLabel, previousMultiplicity + 1);
		}
	}
	//#endregion addStepGiustificationStatistics

	addAssertionStatementWithSubstitution(assertionStatementProofStep: AssertionStatement,
		assertionStatementWithSubstitution: string[]) {
		const rpnSyntaxTree: string = this.buildRpnSyntaxTree(assertionStatementWithSubstitution,
			assertionStatementProofStep.outermostBlock!.grammar!);
		const currentStepLabel: string = assertionStatementProofStep.Label;
		this.addStepGiustificationStatistics(rpnSyntaxTree, currentStepLabel);
	}
	//#endregion addAssertionStatementWithSubstitution

	addSingleStepToTheModel(assertionStatementProofStep: AssertionStatement, stack: string[][],
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

	addDecompressedProofToModel(proof: Statement[]) {
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


	addSingleProofToModel(provableStatement: ProvableStatement) {
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

	//#region sortSuggestionsAndSave
	buildTextToWrite(): string {
		let textToWrite = '';
		let currentRpnSyntaxTreeIndex = 0;
		this.stepGiustificationStatistics.forEach((labelToMultiplicityMap: Map<string, number>,
			rpnSyntaxTree: string) => {
			// const arrayForSingleTree = new Array(labelToMultiplicityMap.entries);
			const arrayForSingleTree: Array<{ label: string, multiplicity: number }> =
				Array.from(labelToMultiplicityMap, ([label, multiplicity]) => ({
					label: label,
					multiplicity: multiplicity
				}));
			// sort giustifications in descending order of
			arrayForSingleTree.sort((a: { label: string, multiplicity: number },
				b: { label: string, multiplicity: number }) => b.multiplicity - a.multiplicity);
			arrayForSingleTree.forEach((giustification: { label: string; multiplicity: number; }) => {
				const csvLine = `${rpnSyntaxTree},${giustification.label},${giustification.multiplicity}\n`;
				textToWrite += csvLine;
			});
			currentRpnSyntaxTreeIndex++;
			notifyProgressWithTimestampAndMemory('Creating string...', currentRpnSyntaxTreeIndex, this.stepGiustificationStatistics.size);
		});
		return textToWrite;
	}
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
		const textToWrite: string = this.buildTextToWrite();
		console.log('writing to disk...');
		this.save(textToWrite);
		console.log('written to disk!');
	}
	// save(rpnSyntaxTree: string, arrayForSingleTree: { label: string; multiplicity: number; }[], fileToWrite: string) {
	// 	arrayForSingleTree.forEach((giustification: { label: string; multiplicity: number; }) => {
	// 		const csvLine = `${rpnSyntaxTree},${giustification.label},${giustification.multiplicity}\n`;
	// 		fs.writeFileSync(fileToWrite, csvLine,
	// 			{
	// 				encoding: "utf8",
	// 				flag: "a+",
	// 				mode: 0o666
	// 			});
	// 	});
	// }
	// private sortSuggestionsAndSave() {
	// 	const fileToWrite = this.mmFilePath + 's';
	// 	fs.writeFileSync(fileToWrite, '');
	// 	this.stepGiustificationStatistics.forEach((labelToMultiplicityMap: Map<string, number>,
	// 		rpnSyntaxTree: string) => {
	// 		// const arrayForSingleTree = new Array(labelToMultiplicityMap.entries);
	// 		const arrayForSingleTree: Array<{ label: string, multiplicity: number }> =
	// 			Array.from(labelToMultiplicityMap, ([label, multiplicity]) => ({
	// 				label: label,
	// 				multiplicity: multiplicity
	// 			}));
	// 		// sort giustifications in descending order of
	// 		arrayForSingleTree.sort((a: { label: string, multiplicity: number },
	// 			b: { label: string, multiplicity: number }) => b.multiplicity - a.multiplicity);
	// 		this.save(rpnSyntaxTree, arrayForSingleTree, fileToWrite);
	// 	});
	// }
	//#endregion sortSuggestionsAndSave


	buildModel() {
		// const mmFilePath = __dirname.concat('/../../src/mmTestFiles/impbii.mm');
		// const mmFilePath = '/home/mionome/Desktop/provashare/mmp/set.mm';
		const theory: string = fs.readFileSync(this.mmFilePath, 'utf-8');
		// const theory: string = readTestFile('impbii.mm');
		this._mmParser = new MmParser();
		this._mmParser.ParseText(theory);
		this.buildFHyps();
		this._mmParser.labelToStatementMap.forEach((labeledStatement: LabeledStatement, _label: string) => {
			if (labeledStatement instanceof ProvableStatement)
				this.addSingleProofToModel(labeledStatement);
			this.notifyProgress(labeledStatement.statementNumber, this._mmParser!.labelToStatementMap.size);
		});
		this.sortSuggestionsAndSave();
	}
	//#endregion buildModel

	static buildModelFileFullPath(mmFilePath: string): any {
		return mmFilePath + 's';
	}

	//#region loadSuggestionsMap
	static loadSuggestionsMapForExistingModel(modelFullPath: string): Map<string, IStepSuggestion[]> {
		const suggestionsMap: Map<string, IStepSuggestion[]> = new Map<string, IStepSuggestion[]>();
		const model: string = fs.readFileSync(modelFullPath, 'utf-8');
		const modelRows: string[] = model.split('\n');
		// let previousRpnSyntaxTree: string | undefined;
		let singleRpnSyntaxTreeSuggestions: IStepSuggestion[] = [];
		let modelRowString: string = modelRows[0];
		let modelRowArray: string[] = modelRowString.split(',');
		let rpnSyntaxTree: string = modelRowArray[0];
		let i = 0;
		while (i < modelRows.length) {
			modelRowString = modelRows[i];
			modelRowArray = modelRowString.split(',');
			const newRpnSyntaxTree: string = modelRowArray[0];
			if (newRpnSyntaxTree != rpnSyntaxTree) {
				suggestionsMap.set(rpnSyntaxTree, singleRpnSyntaxTreeSuggestions);
				rpnSyntaxTree = newRpnSyntaxTree;
				singleRpnSyntaxTreeSuggestions = [];
			}
			const giustificationLabel: string = modelRowArray[1];
			const multiplicity: number = parseInt(modelRowArray[2]);
			const stepSuggestion: IStepSuggestion = {
				label: giustificationLabel,
				multiplicity: multiplicity
			};
			singleRpnSyntaxTreeSuggestions.push(stepSuggestion);
			i++;
		}
		return suggestionsMap;
	}
	//QUI!!! add test
	static async loadSuggestionsMap(modelFullPath: string, connection: Connection): Promise<Map<string, IStepSuggestion[]>> {
		let suggestionsMap: Map<string, IStepSuggestion[]> = new Map<string, IStepSuggestion[]>();
		if (fs.existsSync(modelFullPath))
			suggestionsMap = this.loadSuggestionsMapForExistingModel(modelFullPath);
		else {
			// the file for the model does not exist
			const message = `The model file ${modelFullPath} has not been found. The extension ` +
				`will work anyway, but step suggestions will not be as accurate and useful as they ` +
				`would be using a trained model.`;
			// notifyError(errorMessage,connection);
			notifyWarning(message,connection);
		}
		return suggestionsMap;
	}
	//#endregion loadSuggestionsMap
}
