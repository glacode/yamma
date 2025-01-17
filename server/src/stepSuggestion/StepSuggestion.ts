import { Command, CompletionItem, CompletionItemKind, InsertReplaceEdit, Range } from 'vscode-languageserver';
import { Parameters } from '../general/Parameters';
import { InternalNode } from '../grammar/ParseNode';
import { CursorContext } from "../mmp/CursorContext";
import { MmParser } from '../mm/MmParser';
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement } from "../mm/AssertionStatement";
import { range } from '../mm/Utils';
import { MmpProofStep } from "../mmp/MmpProofStep";
import { SubstitutionResult, MmpSubstitutionBuilder } from '../mmp/MmpSubstitutionBuilder';
import { GrammarManager } from '../grammar/GrammarManager';
import { IFormulaClassifier } from './IFormulaClassifier';
import { StepSuggestionMap } from './StepSuggestionMap';
import { WilsonScoreArgs, calculateWilsonScore } from './WilsonScore';
import { IStepSuggestion } from './ModelLoader';


export class StepSuggestion {
	cursorContext: CursorContext;
	// stepSuggestionMap: Map<string, IStepSuggestion[]>;
	stepSuggestionMap: StepSuggestionMap;
	formulaClassifiers: IFormulaClassifier[];
	mmpProofStep: MmpProofStep;
	mmParser: MmParser;
	private command: Command = Command.create('Completion item selected', 'yamma.completionitemselected');

	private completionItemKindOrder: Map<CompletionItemKind, string>;
	//TODO this is a parameter: you mught want to move it to the Paramter class
	private completionItemKindForPartialLabel: CompletionItemKind;
	constructor(cursorContext: CursorContext, stepSuggestionMap: StepSuggestionMap,
		formulaClassifiers: IFormulaClassifier[], mmpProofStep: MmpProofStep, mmParser: MmParser) {
		this.cursorContext = cursorContext;
		this.stepSuggestionMap = stepSuggestionMap;
		this.formulaClassifiers = formulaClassifiers;
		this.mmpProofStep = mmpProofStep;
		this.mmParser = mmParser;

		this.completionItemKindOrder = new Map<CompletionItemKind, string>();
		this.completionItemKindForPartialLabel = CompletionItemKind.Text;
		this.initializeCompletionItemKindOrder();
	}

	private initializeCompletionItemKindOrder(): void {
		this.completionItemKindOrder.set(CompletionItemKind.Event, '0');
		this.completionItemKindOrder.set(CompletionItemKind.Interface, '1');
		// completion items from partial label should be displayed after
		// completion items from models
		this.completionItemKindOrder.set(this.completionItemKindForPartialLabel, '9');

	}

	//#region completionItems

	classifyProofStepFormula(formulaClassifier: IFormulaClassifier): string | undefined {
		let rpnSyntaxTree: string | undefined;
		const mmpProofStep: MmpProofStep = <MmpProofStep>this.cursorContext.mmpStatement!;
		const parseNode: InternalNode | undefined = mmpProofStep.parseNode;
		if (parseNode != undefined) {
			// const rpnSyntaxTreeBuilder: RpnSyntaxTreeBuilder = new RpnSyntaxTreeBuilder();
			// rpnSyntaxTreeBuilder.setMmParser(this.mmParser);
			// rpnSyntaxTree = syntaxTreeClassifierFull.buildRpnSyntaxTreeFromParseNode(parseNode, this.mmParser, 0, 3);
			rpnSyntaxTree = formulaClassifier.classify(parseNode, this.mmParser);
		}
		return rpnSyntaxTree;
	}

	//#region isUnifiable

	isUnifiable(stepSuggestionLabel: string) {
		let hasBeenFoundSubstitution = false;
		// const assertionStatement: LabeledStatement | undefined = this.mmParser.labelToStatementMap.get(stepSuggestion.label);
		const assertionStatement: LabeledStatement | undefined = this.mmParser.labelToStatementMap.get(stepSuggestionLabel);
		if (assertionStatement instanceof AssertionStatement && !GrammarManager.isSyntaxAxiom2(assertionStatement)) {
			const uSubstitutionBuilder: MmpSubstitutionBuilder = new MmpSubstitutionBuilder(
				this.mmpProofStep, assertionStatement, this.mmParser.outermostBlock,
				this.mmParser.workingVars, this.mmParser.grammar, []);
			const substitutionResult: SubstitutionResult =
				uSubstitutionBuilder.buildSubstitutionForExistingParseNodes();
			hasBeenFoundSubstitution = substitutionResult.hasBeenFound;
		} else
			// console.log(`label ${stepSuggestionLabel.label} is not a label for an assertion, this is not expected. ` +
			// 	`May be that assertion was removed from the theory, after the model was built.`);
			console.log(`label ${stepSuggestionLabel} is not a label for an assertion, this is not expected. ` +
				`May be that assertion was removed from the theory, after the model was built.`);
		return hasBeenFoundSubstitution;
	}
	//#region isUnifiable


	//#region getCompletionItemsFromModels

	//#region completionItemsFromClassifier

	//#region getCompletionItemsFromStepSuggestions

	//#region getUnifiableStepSuggestions


	private getUnifiableStepSuggestions(stepSuggestions: IStepSuggestion[]): IStepSuggestion[] {
		const unifiableStepSuggestions: IStepSuggestion[] = [];
		stepSuggestions.forEach((stepSuggestion: IStepSuggestion) => {
			// if (this.isUnifiable(stepSuggestion.label))
			if (this.isUnifiable(stepSuggestion.label) && this.doesLabelMatchTheProofStepLabel(stepSuggestion.label))
				unifiableStepSuggestions.push(stepSuggestion);
		});
		return unifiableStepSuggestions;
	}
	doesLabelMatchTheProofStepLabel(label: string) {
		let result = this.mmpProofStep.label == undefined;
		if (!result) {
			const regExp: RegExp = StepSuggestion.buildRegExp(this.mmpProofStep.label!.value);
			result = regExp.test(label);
		}
		return result;
	}
	//#endregion getUnifiableStepSuggestions

	//#region addCompletionItem
	private insertReplaceEdit(stepSuggestionLabel: string): InsertReplaceEdit | undefined {
		let insertReplaceEdit: InsertReplaceEdit | undefined;
		if (this.mmpProofStep != undefined && this.mmpProofStep.label != undefined) {
			const insertRange: Range = this.mmpProofStep!.label!.range;
			const replaceRange: Range = range(stepSuggestionLabel, insertRange.start.line, insertRange.start.character);
			insertReplaceEdit = {
				insert: insertRange,
				replace: replaceRange,
				newText: stepSuggestionLabel
			};
		}
		return insertReplaceEdit;
	}
	sortText(completionItemKind: CompletionItemKind, index: number): string {
		//TODO1 feb 5 sort using the Wilson Score Confidence Interval
		const completionItemKindOrder: string = this.completionItemKindOrder.get(completionItemKind)!;
		const result: string = completionItemKindOrder + String(index).padStart(3, '0');
		return result;
	}

	private getWilsonScore(stepSuggestionMultiplicity: number, totalMultiplicity: number): number {
		const wilsonScoreArgs: WilsonScoreArgs = {
			totalVotes: totalMultiplicity,
			upVotes: stepSuggestionMultiplicity
		};
		const wilsonInterval = calculateWilsonScore(wilsonScoreArgs);
		return wilsonInterval.leftSide;
	}
	private addCompletionItemFromModel(stepSuggestion: IStepSuggestion, _index: number, totalMultiplicity: number,
		completionItems: CompletionItem[]) {
		// const relativeMultiplicity: number = stepSuggestion.multiplicity / totalMultiplicity;
		const wilsonScore: number = this.getWilsonScore(stepSuggestion.multiplicity, totalMultiplicity);
		const strWilsonScore: string = wilsonScore.toFixed(2);
		// const detail = `${relativeMultiplicity.toFixed(2)} relative weight   -    ${stepSuggestion.multiplicity}  total`;
		// TODO1 feb 6 add modelId in the detail below
		const detail = `wscore: ${strWilsonScore}  -  ${stepSuggestion.multiplicity}/${totalMultiplicity}  ` +
			`-  model: ${stepSuggestion.stepSuggestionsForFormulaCluster.formulaClassifierId}`;
		const insertReplaceEdit: InsertReplaceEdit | undefined = this.insertReplaceEdit(stepSuggestion.label);
		const completionItem: CompletionItem = {
			label: stepSuggestion.label,
			filterText: this.mmpProofStep.label?.value,
			command: this.command,
			detail: detail,
			//TODO see if LSP supports a way to disable client side sorting
			// sortText: String(index).padStart(3, '0'),
			// sortText: this.sortText(stepSuggestion.completionItemKind, index),
			sortText: (1 - wilsonScore).toFixed(4),
			textEdit: insertReplaceEdit,
			kind: stepSuggestion.completionItemKind
			// data: symbol
		};
		completionItems.push(completionItem);
	}
	//#endregion addCompletionItem
	private getCompletionItemsFromStepSuggestions(stepSuggestions: IStepSuggestion[]): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		const unifiableStepSuggestions: IStepSuggestion[] = this.getUnifiableStepSuggestions(stepSuggestions);
		// const totalMultiplicity: number =
		// 	unifiableStepSuggestions.reduce((sum: number, current: IStepSuggestion) => sum + current.multiplicity, 0);
		unifiableStepSuggestions.forEach((stepSuggestion: IStepSuggestion, i: number) => {
			this.addCompletionItemFromModel(stepSuggestion, i,
				stepSuggestion.stepSuggestionsForFormulaCluster.totalMultiplicityForThisCluster,
				completionItems);
		});
		return completionItems;
	}
	//#endregion getCompletionItemsFromStepSuggestions

	//#endregion completionItemsFromClassifier

	//#region getStepSuggestionsFromAllModels
	addSetSuggestionsForClassifier(formulaClassifier: IFormulaClassifier, stepSuggestions: IStepSuggestion[]) {
		const formulaClusterId: string | undefined = this.classifyProofStepFormula(formulaClassifier);
		if (formulaClusterId != undefined) {
			// the cursor is on a proof step that has a valid parse node
			const stepSuggestionsFromThisClassifier: IStepSuggestion[] | undefined =
				this.stepSuggestionMap.getStepSuggestions(formulaClassifier.id, formulaClusterId);
			if (stepSuggestionsFromThisClassifier != undefined)
				// the model does have step suggestions, for this classifier and this parse node
				stepSuggestions.push(...stepSuggestionsFromThisClassifier);
		}
	}
	getStepSuggestionsFromAllModels(): IStepSuggestion[] {
		const stepSuggestions: IStepSuggestion[] = [];
		this.formulaClassifiers.forEach((formulaClassifier: IFormulaClassifier) => {
			this.addSetSuggestionsForClassifier(formulaClassifier, stepSuggestions);
		});
		return stepSuggestions;
	}
	//#endregion getStepSuggestionsFromAllModels

	//#region orderStepSuggestionsByWilsonScore
	private wilsonScore(stepSuggestion: IStepSuggestion): number {
		// const totalMultiplicityOfTheClassifier: number =
		// 	this.getTotalMultiplicity(stepSuggestion.classifierId);
		const output: number = this.getWilsonScore(stepSuggestion.multiplicity,
			stepSuggestion.stepSuggestionsForFormulaCluster.totalMultiplicityForThisCluster!);
		return output;
	}
	orderStepSuggestionsByWilsonScore(stepSuggestions: IStepSuggestion[]) {
		stepSuggestions.sort((a, b) => this.wilsonScore(b) - this.wilsonScore(a));
	}
	//#endregion orderStepSuggestionsByWilsonScore

	getStepSuggestionsFromModelsWithoutDuplication(stepSuggestions: IStepSuggestion[]): {
		stepSuggestionsWithoutDuplication: IStepSuggestion[], alreadyAddedLabels: Set<string>
	} {
		const stepSuggestionsWithoutDuplication: IStepSuggestion[] = [];
		const alreadyAddedLabels: Set<string> = new Set<string>();
		stepSuggestions.forEach((stepSuggestion: IStepSuggestion) => {
			if (!alreadyAddedLabels.has(stepSuggestion.label)) {
				stepSuggestionsWithoutDuplication.push(stepSuggestion);
				alreadyAddedLabels.add(stepSuggestion.label);
			}
		});
		return { stepSuggestionsWithoutDuplication, alreadyAddedLabels };
	}

	private getCompletionItemsFromModels(): {
		completionItems: CompletionItem[], labelsAddedFromModels: Set<string>
	} {
		//TODO this is an example to add a snippet, you will use it later
		// const testSnippet: CompletionItem = {
		// 	label: "func",
		// 	kind: CompletionItemKind.Snippet,
		// 	insertText: [
		// 		"function ${1:Name}(${2}) ${3:abort}",
		// 		"\t${0}",
		// 		"endfunction",
		// 	].join("\n"),
		// 	insertTextFormat: InsertTextFormat.Snippet,
		// };
		// const completionItemsFromModels: CompletionItem[] = [testSnippet];


		const stepSuggestions: IStepSuggestion[] = this.getStepSuggestionsFromAllModels();
		this.orderStepSuggestionsByWilsonScore(stepSuggestions);
		const { stepSuggestionsWithoutDuplication, alreadyAddedLabels } =
			this.getStepSuggestionsFromModelsWithoutDuplication(stepSuggestions);
		const completionItemsFromModels = this.getCompletionItemsFromStepSuggestions(
			stepSuggestionsWithoutDuplication);

		// const completionItemsFromModels: CompletionItem[] = [];
		// this.formulaClassifiers.forEach((formulaClassifier: IFormulaClassifier) => {
		// 	const completionItemsFromClassifier: CompletionItem[] =
		// 		this.completionItemsFromClassifier(formulaClassifier);
		// 	completionItemsFromModels.push(...completionItemsFromClassifier);

		// });

		return { completionItems: completionItemsFromModels, labelsAddedFromModels: alreadyAddedLabels };
	}
	//#endregion getCompletionItemsFromModels

	//#region addCompletionItemsFromPartialLabel
	public static buildRegExp(partialLabel: string): RegExp {
		const c0: string = partialLabel[0];
		let strReg = `.*${c0}.*`;
		for (let i = 1; i < partialLabel.length; i++) {
			const ci: string = partialLabel[i];
			strReg += `${ci}.*`;
		}

		const regExp = new RegExp(strReg);

		return regExp;
	}
	createAndAddItemFromPartialLabel(partialLabel: string, label: string, i: number, completionItems: CompletionItem[]) {
		const insertReplaceEdit: InsertReplaceEdit | undefined = this.insertReplaceEdit(label);
		const completionItem: CompletionItem = {
			label: label,
			filterText: partialLabel,
			command: this.command,
			sortText: this.sortText(this.completionItemKindForPartialLabel, i),
			textEdit: insertReplaceEdit,
			kind: this.completionItemKindForPartialLabel
		};
		completionItems.push(completionItem);
	}
	private addCompletionItemsFromPartialLabelActually(
		partialLabel: string, completionItems: CompletionItem[], labelsAddedFromModels: Set<string>) {
		const regExp: RegExp = StepSuggestion.buildRegExp(partialLabel);
		let i = 0;
		this.mmParser.labelToNonSyntaxAssertionMap.forEach((_assertion: AssertionStatement, label: string) => {
			if (!labelsAddedFromModels.has(label) && regExp.test(label) &&
				(this.mmpProofStep.formula == undefined || this.isUnifiable(label))) {
				// the current assertion's label contains the partial label input by the user
				// and either the proof step has no formula, or the current assertion is unifiable with
				// the current mmp statement
				this.createAndAddItemFromPartialLabel(partialLabel, label, i++, completionItems);
			}
		});
	}
	/** when the user inputs some characters, then this method adds more CompletionItem(s), using
	 * a general algorithm that does not depend on a trained model: all 'matching' assertions
	 * are returned
	 */
	private addCompletionItemsFromPartialLabel(completionItems: CompletionItem[], labelsAddedFromModels: Set<string>) {
		if (this.mmpProofStep != undefined && this.mmpProofStep.label != undefined &&
			this.mmpProofStep.label.value.length >= Parameters.numberOfCharsTriggeringCompletionItemsFromPartialLabel)
			this.addCompletionItemsFromPartialLabelActually(this.mmpProofStep.label.value, completionItems,
				labelsAddedFromModels);
	}
	//#endregion addCompletionItemsFromPartialLabel

	completionItems(): CompletionItem[] {
		const { completionItems, labelsAddedFromModels } = this.getCompletionItemsFromModels();
		this.addCompletionItemsFromPartialLabel(completionItems, labelsAddedFromModels);

		return completionItems;
	}
	//#endregion completionItems

}