import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { InternalNode } from '../grammar/ParseNode';
import { CursorContext } from '../languageServerHandlers/OnCompletionHandler';
import { MmParser } from '../mm/MmParser';
import { AssertionStatement, LabeledStatement } from '../mm/Statements';
import { MmpProofStep } from '../mmp/MmpStatements';
import { SubstitutionResult, USubstitutionBuilder } from '../mmp/USubstitutionBuilder';
import { IStepSuggestion } from './ModelBuilder';
import { RpnSyntaxTreeBuilder } from './RpnSyntaxTreeBuilder';

export class StepSuggestion {
	cursorContext: CursorContext;
	stepSuggestionMap: Map<string, IStepSuggestion[]>;
	mmParser: MmParser;

	constructor(cursorContext: CursorContext, stepSuggestionMap: Map<string, IStepSuggestion[]>, mmParser: MmParser) {
		this.cursorContext = cursorContext;
		this.stepSuggestionMap = stepSuggestionMap;
		this.mmParser = mmParser;
	}

	//#region completionItems

	buildRpnSyntaxTree(): string | undefined {
		let rpnSyntaxTree: string | undefined;
		const mmpProofStep: MmpProofStep = this.cursorContext.mmpProofStep!;
		const parseNode: InternalNode | undefined = mmpProofStep.parseNode;
		if (parseNode != undefined) {
			const rpnSyntaxTreeBuilder: RpnSyntaxTreeBuilder = new RpnSyntaxTreeBuilder(this.mmParser);
			//TODO use parameters below, or even better, add metainfo to the model
			rpnSyntaxTree = rpnSyntaxTreeBuilder.buildRpnSyntaxTreeFromParseNode(parseNode, 0, 3);
		}
		return rpnSyntaxTree;
	}

	//#region getCompletionItems

	//#region getUnifiableStepSuggestions
	isUnifiable(stepSuggestion: IStepSuggestion) {
		let hasBeenFoundSubstitution = false;
		const assertionStatement: LabeledStatement | undefined = this.mmParser.labelToStatementMap.get(stepSuggestion.label);
		if (assertionStatement instanceof AssertionStatement) {
			const uSubstitutionBuilder: USubstitutionBuilder = new USubstitutionBuilder(
				this.cursorContext.mmpProofStep!, assertionStatement, this.mmParser.outermostBlock,
				this.mmParser.workingVars, this.mmParser.grammar, []);
			const substitutionResult: SubstitutionResult =
				uSubstitutionBuilder.buildSubstitutionForExistingParseNodes();
			hasBeenFoundSubstitution = substitutionResult.hasBeenFound;
		} else
			console.log(`label ${stepSuggestion.label} is not a label for an assertion, this is not expected. ` +
				`May be that assertion was removed from the theory, after the model was built.`);
		return hasBeenFoundSubstitution;
	}
	getUnifiableStepSuggestions(stepSuggestions: IStepSuggestion[]): IStepSuggestion[] {
		const unifiableStepSuggestions: IStepSuggestion[] = [];
		stepSuggestions.forEach((stepSuggestion: IStepSuggestion) => {
			if (this.isUnifiable(stepSuggestion))
				unifiableStepSuggestions.push(stepSuggestion);
		});
		return unifiableStepSuggestions;
	}
	//#endregion getUnifiableStepSuggestions

	getCompletionItems(stepSuggestions: IStepSuggestion[]): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		const unifiableStepSuggestions: IStepSuggestion[] = this.getUnifiableStepSuggestions(stepSuggestions);
		const totalMultiplicity: number =
			unifiableStepSuggestions.reduce((sum: number, current: IStepSuggestion) => sum + current.multiplicity, 0);
		unifiableStepSuggestions.forEach((stepSuggestion: IStepSuggestion, i: number) => {
			// const label = `${stepSuggestion.label} ${stepSuggestion.multiplicity}`;
			const relativeMultiplicity: number = stepSuggestion.multiplicity / totalMultiplicity;
			const detail = `${relativeMultiplicity.toFixed(2)} relative weight   -    ${stepSuggestion.multiplicity}  total`;
			const completionItem: CompletionItem = {
				label: stepSuggestion.label,
				detail: detail,
				//TODO see if LSP supports a way to disable client side sorting
				sortText: String(i).padStart(3, '0')
				//TODO search how to remove the icon from the completion list
				// kind: CompletionItemKind.Keyword
				// data: symbol
			};
			completionItems.push(completionItem);
		});
		return completionItems;
	}
	// getCompletionItems(stepSuggestions: IStepSuggestion[]): CompletionItem[] {
	// 	const completionItems: CompletionItem[] = [];
	// 	stepSuggestions.forEach((stepSuggestion: IStepSuggestion, i: number) => {
	// 		// const label = `${stepSuggestion.label} ${stepSuggestion.multiplicity}`;
	// 		const completionItem: CompletionItem = {
	// 			label: stepSuggestion.label,
	// 			detail: stepSuggestion.multiplicity.toString(),
	// 			//TODO see if LSP supports a way to disable client side sorting
	// 			sortText: String(i).padStart(3, '0')
	// 			//TODO search how to remove the icon from the completion list
	// 			// kind: CompletionItemKind.Keyword
	// 			// data: symbol
	// 		};
	// 		completionItems.push(completionItem);
	// 	});
	// 	return completionItems;
	// }
	//#endregion getCompletionItems

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
		const rpnSyntaxTree: string | undefined = this.buildRpnSyntaxTree();
		if (rpnSyntaxTree != undefined) {
			// the cursor is on a proof step that has a valid parse node
			const stepSuggestions: IStepSuggestion[] | undefined =
				this.stepSuggestionMap.get(rpnSyntaxTree);
			if (stepSuggestions != undefined)
				// the formula was not succesfully completed: symbols are the possible next symbols
				completionItems = this.getCompletionItems(stepSuggestions);
		}
		return completionItems;
	}
	//#endregion completionItems

}