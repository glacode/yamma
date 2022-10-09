import { CompletionItem, CompletionItemKind, InsertReplaceEdit, Range } from 'vscode-languageserver';
import { Parameters } from '../general/Parameters';
import { InternalNode } from '../grammar/ParseNode';
import { CursorContext } from '../languageServerHandlers/OnCompletionHandler';
import { MmParser } from '../mm/MmParser';
import { AssertionStatement, LabeledStatement } from '../mm/Statements';
import { range } from '../mm/Utils';
import { MmpProofStep } from '../mmp/MmpStatements';
import { SubstitutionResult, USubstitutionBuilder } from '../mmp/USubstitutionBuilder';
import { IStepSuggestion } from './ModelBuilder';
import { GrammarManager } from '../grammar/GrammarManager';
import { SyntaxTreeClassifierFull } from './SyntaxTreeClassifierFull';


export class StepSuggestion {
	cursorContext: CursorContext;
	stepSuggestionMap: Map<string, IStepSuggestion[]>;
	mmpProofStep: MmpProofStep | undefined;
	mmParser: MmParser;

	constructor(cursorContext: CursorContext, stepSuggestionMap: Map<string, IStepSuggestion[]>,
		mmpProofStep: MmpProofStep | undefined, mmParser: MmParser) {
		this.cursorContext = cursorContext;
		this.stepSuggestionMap = stepSuggestionMap;
		this.mmpProofStep = mmpProofStep;
		this.mmParser = mmParser;
	}

	//#region completionItems

	buildRpnSyntaxTree(): string | undefined {
		let rpnSyntaxTree: string | undefined;
		const mmpProofStep: MmpProofStep = this.cursorContext.mmpProofStep!;
		const parseNode: InternalNode | undefined = mmpProofStep.parseNode;
		if (parseNode != undefined) {
			// const rpnSyntaxTreeBuilder: RpnSyntaxTreeBuilder = new RpnSyntaxTreeBuilder(this.mmParser);
			// const rpnSyntaxTreeBuilder: RpnSyntaxTreeBuilder = new RpnSyntaxTreeBuilder();
			const syntaxTreeClassifierFull: SyntaxTreeClassifierFull = new SyntaxTreeClassifierFull();
			// rpnSyntaxTreeBuilder.setMmParser(this.mmParser);
			//TODO use parameters below, or even better, add metainfo to the model
			//TODO1 the formula classifier classifies formulas, but here we classify ParseNodes
			// rpnSyntaxTree = syntaxTreeClassifierFull.buildRpnSyntaxTreeFromParseNode(parseNode, this.mmParser, 0, 3);
			rpnSyntaxTree = syntaxTreeClassifierFull.classify(parseNode, this.mmParser);
		}
		return rpnSyntaxTree;
	}

	//#region isUnifiable

	isUnifiable(stepSuggestionLabel: string) {
		let hasBeenFoundSubstitution = false;
		// const assertionStatement: LabeledStatement | undefined = this.mmParser.labelToStatementMap.get(stepSuggestion.label);
		const assertionStatement: LabeledStatement | undefined = this.mmParser.labelToStatementMap.get(stepSuggestionLabel);
		if (assertionStatement instanceof AssertionStatement && !GrammarManager.isSyntaxAxiom2(assertionStatement)) {
			const uSubstitutionBuilder: USubstitutionBuilder = new USubstitutionBuilder(
				this.cursorContext.mmpProofStep!, assertionStatement, this.mmParser.outermostBlock,
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

	//#region getCompletionItemsFromStepSuggestions

	//#region getUnifiableStepSuggestions


	private getUnifiableStepSuggestions(stepSuggestions: IStepSuggestion[]): IStepSuggestion[] {
		const unifiableStepSuggestions: IStepSuggestion[] = [];
		stepSuggestions.forEach((stepSuggestion: IStepSuggestion) => {
			// if (this.isUnifiable(stepSuggestion))
			if (this.isUnifiable(stepSuggestion.label))
				unifiableStepSuggestions.push(stepSuggestion);
		});
		return unifiableStepSuggestions;
	}
	//#endregion getUnifiableStepSuggestions

	//#region addCompletionItem
	private insertReplaceEdit(stepSuggestion: IStepSuggestion): InsertReplaceEdit | undefined {
		let insertReplaceEdit: InsertReplaceEdit | undefined;
		if (this.mmpProofStep != undefined && this.mmpProofStep.label != undefined) {
			const insertRange: Range = this.mmpProofStep!.label!.range;
			const replaceRange: Range = range(stepSuggestion.label, insertRange.start.line, insertRange.start.character);
			insertReplaceEdit = {
				insert: insertRange,
				replace: replaceRange,
				newText: stepSuggestion.label
			};
		}
		return insertReplaceEdit;
	}
	private addCompletionItem(stepSuggestion: IStepSuggestion, index: number, totalMultiplicity: number,
		completionItems: CompletionItem[]) {
		// const label = `${stepSuggestion.label} ${stepSuggestion.multiplicity}`;
		const relativeMultiplicity: number = stepSuggestion.multiplicity / totalMultiplicity;
		const detail = `${relativeMultiplicity.toFixed(2)} relative weight   -    ${stepSuggestion.multiplicity}  total`;
		const insertReplaceEdit: InsertReplaceEdit | undefined = this.insertReplaceEdit(stepSuggestion);
		const completionItem: CompletionItem = {
			label: stepSuggestion.label,
			detail: detail,
			//TODO see if LSP supports a way to disable client side sorting
			sortText: String(index).padStart(3, '0'),
			textEdit: insertReplaceEdit
			//TODO search how to remove the icon from the completion list
			// kind: CompletionItemKind.Keyword
			// data: symbol
		};
		completionItems.push(completionItem);
	}
	//#endregion addCompletionItem
	private getCompletionItemsFromStepSuggestions(stepSuggestions: IStepSuggestion[]): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		const unifiableStepSuggestions: IStepSuggestion[] = this.getUnifiableStepSuggestions(stepSuggestions);
		const totalMultiplicity: number =
			unifiableStepSuggestions.reduce((sum: number, current: IStepSuggestion) => sum + current.multiplicity, 0);
		unifiableStepSuggestions.forEach((stepSuggestion: IStepSuggestion, i: number) => {
			this.addCompletionItem(stepSuggestion, i, totalMultiplicity, completionItems);
		});
		return completionItems;
	}
	//#endregion getCompletionItemsFromStepSuggestions
	private getCompletionItemsFromModels(): CompletionItem[] {
		let completionItemsFromModels: CompletionItem[] = [];
		const rpnSyntaxTree: string | undefined = this.buildRpnSyntaxTree();
		if (rpnSyntaxTree != undefined) {
			// the cursor is on a proof step that has a valid parse node
			const stepSuggestions: IStepSuggestion[] | undefined =
				this.stepSuggestionMap.get(rpnSyntaxTree);
			if (stepSuggestions != undefined)
				// the formula was not succesfully completed: symbols are the possible next symbols
				completionItemsFromModels = this.getCompletionItemsFromStepSuggestions(stepSuggestions);
		}
		return completionItemsFromModels;
	}
	//#endregion getCompletionItemsFromModels

	//#region addCompletionItemsFromPartialLabel
	private addCompletionItemsFromPartialLabelActually(partialLabel: string, completionItems: CompletionItem[]) {
		// completionItems.push({ label: partialLabel + 'testtest' });
		// const filteringString: string = partialLabel.substring(0, 2);
		const c0: string = partialLabel[0];
		const c1: string = partialLabel[1];
		const c2: string = partialLabel[2];
		const regExp = new RegExp(`.*${c0}.*${c1}.*${c2}.*`);
		this.mmParser.labelToAssertionMap.forEach((_assertion: AssertionStatement, label: string) => {
			// if (label.indexOf(filteringString) != -1) {
			if (regExp.test(label))
				// the current assertion's label contains the partial label input by the user
				if (this.isUnifiable(label)) {
					const completionItem: CompletionItem = {
						label: label,
					};
					completionItems.push(completionItem);
				}
		});
	}
	/** when the user inputs some characters, then this method adds more CompletionItem(s), using
	 * a general algorithm that does not depend on a trained model: all 'matching' assertions
	 * are returned
	 */
	private addCompletionItemsFromPartialLabel(completionItems: CompletionItem[]) {
		if (this.mmpProofStep != undefined && this.mmpProofStep.label != undefined &&
			this.mmpProofStep.label.value.length >= Parameters.numberOfCharsTriggeringCompletionItemsFromPartialLabel)
			this.addCompletionItemsFromPartialLabelActually(this.mmpProofStep.label.value, completionItems);
	}
	//#endregion addCompletionItemsFromPartialLabel

	completionItems(): CompletionItem[] {
		let completionItems: CompletionItem[] = [
			{
				label: 'Dummy for test',
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'Dummy for test 2',
				kind: CompletionItemKind.Text,
				data: 2
			}
		];
		completionItems = this.getCompletionItemsFromModels();
		this.addCompletionItemsFromPartialLabel(completionItems);

		return completionItems;
	}
	//#endregion completionItems

}