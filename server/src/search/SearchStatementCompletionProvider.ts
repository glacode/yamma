import { Command, CompletionItem, Range, TextEdit } from 'vscode-languageserver';
import { MmStatistics } from '../mm/MmStatistics';
import { AssertionStatement } from "../mm/AssertionStatement";
import { intersection } from '../mm/Utils';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';
import { MmpParser } from '../mmp/MmpParser';
import { MmpProofStep } from '../mmp/MmpProofStep';

export class SearchStatementCompletionProvider {

	public static noAssertionFoundLabel = "No Assertion Found";

	mmpSearchStatement: MmpSearchStatement;
	mmStatistics: MmStatistics;
	constructor(mmpSearchStatement: MmpSearchStatement, private mmpParser: MmpParser, mmStatistics: MmStatistics) {
		this.mmpSearchStatement = mmpSearchStatement;
		this.mmStatistics = mmStatistics;
	}

	//#region completionItems

	//#region getAssertionsFromSymbolFilter

	//#region assertionsSets
	addAssertionSet(symbol: string, result: Set<Set<AssertionStatement>>) {
		let assertionsContainingThisSymbol: Set<AssertionStatement> | undefined =
			this.mmStatistics.symbolToAssertionsMap?.get(symbol);
		if (assertionsContainingThisSymbol == undefined)
			assertionsContainingThisSymbol = new Set<AssertionStatement>();
		result.add(assertionsContainingThisSymbol);
	}
	private assertionsSets(): Set<Set<AssertionStatement>> {
		const result: Set<Set<AssertionStatement>> = new Set<Set<AssertionStatement>>();
		this.mmpSearchStatement.symbolsToSearch.forEach((symbol: string) => {
			if (symbol != "'")
				// current symbol does not represent the boundary of a search string
				this.addAssertionSet(symbol, result);
		});
		return result;
	}
	//#endregion assertionsSets

	//#region selectAssertionsContainingNormalizedSubstrings

	//#region assertionContainsAllSubstrings
	private assertionOrEHypsContainSubstring(assertion: AssertionStatement, normalizedSUbstring: string): boolean {
		let containsSubstring: boolean = assertion.normalizedFormula.indexOf(normalizedSUbstring) != -1;
		let i = 0;
		while (!containsSubstring && i < assertion.frame!.eHyps.length) {
			// all substrings are contained, so far; and i points to an existing substring to check
			// containsAllSubstrings = assertion.normalizedFormula.indexOf(normalizedSubstringsToSearch[i]) != -1;
			containsSubstring = assertion.frame!.eHyps[i].normalizedFormula.indexOf(normalizedSUbstring) != -1;
			i++;
		}
		return containsSubstring;
	}
	private assertionContainsAllSubstrings(assertion: AssertionStatement, normalizedSubstringsToSearch: string[]): boolean {
		let containsAllSubstrings = true;
		let i = 0;
		while (containsAllSubstrings && i < normalizedSubstringsToSearch.length) {
			// all substrings are contained, so far; and i points to an existing substring to check
			// containsAllSubstrings = assertion.normalizedFormula.indexOf(normalizedSubstringsToSearch[i]) != -1;
			containsAllSubstrings = this.assertionOrEHypsContainSubstring(assertion, normalizedSubstringsToSearch[i]);
			i++;
		}
		return containsAllSubstrings;
	}
	//#endregion assertionContainsAllSubstrings
	private selectAssertionsContainingNormalizedSubstrings(assertions: Set<AssertionStatement> | undefined,
		normalizedSubstringsToSearch: string[]): Set<AssertionStatement> | undefined {
		let assertionsContainingNormalizedSubstrings: Set<AssertionStatement> | undefined = assertions;
		if (normalizedSubstringsToSearch.length > 0 && assertions != undefined) {
			// at least one normalized substring is used to filter out assertions
			assertionsContainingNormalizedSubstrings = new Set<AssertionStatement>();
			assertions.forEach((assertion: AssertionStatement) => {
				if (this.assertionContainsAllSubstrings(assertion, normalizedSubstringsToSearch))
					assertionsContainingNormalizedSubstrings!.add(assertion);
			});
		}
		return assertionsContainingNormalizedSubstrings;
	}
	//#endregion selectAssertionsContainingNormalizedSubstrings

	private getAssertionsFromSymbolFilter() {
		const assertionsSets: Set<Set<AssertionStatement>> = this.assertionsSets();
		const assertionsInTheIntersection: Set<AssertionStatement> | undefined = intersection<AssertionStatement>(assertionsSets);
		const assertionsInTheIntersectionContainingNormalizedSubstrings: Set<AssertionStatement> | undefined = this.selectAssertionsContainingNormalizedSubstrings(assertionsInTheIntersection,
			this.mmpSearchStatement.normalizedSubstringsToSearch);
		return assertionsInTheIntersectionContainingNormalizedSubstrings;
	}

	//#endregion getAssertionsFromSymbolFilter

	addItemNotFound(completionItems: CompletionItem[]) {
		const command: Command = Command.create('Search completion item selected', 'yamma.completionitemselected');
		const completionItem: CompletionItem = {
			label: SearchStatementCompletionProvider.noAssertionFoundLabel,
			command: command,
			// additionalTextEdits: [additionalTextEdit],
		};
		completionItems.push(completionItem);
	}


	//#region completionItemsForAssertionsInTheIntersections

	//#region  getRangeToInsertLabel
	getLineToInsertLabel(): number {
		let i = 0;
		while (this.mmpParser.mmpProof != undefined && i < this.mmpParser.mmpProof.mmpStatements.length &&
			this.mmpParser.mmpProof.mmpStatements[i] != this.mmpSearchStatement)
			i++;
		let lineToInsertLabel: number = this.mmpSearchStatement.range.start.line;
		if (this.mmpParser.mmpProof != undefined && i < this.mmpParser.mmpProof.mmpStatements.length &&
			this.mmpParser.mmpProof.mmpStatements[i - 1] instanceof MmpProofStep) {
			// this.mmpParser.uProof!.uStatements[i - 1] is the MmpProofStep just above this.mmpSearchStatement
			// this should always be the case, unless the user moved the search statement around
			const mmpProofStep: MmpProofStep = <MmpProofStep>this.mmpParser.mmpProof!.mmpStatements[i - 1];
			lineToInsertLabel = mmpProofStep.range.start.line;
		}
		return lineToInsertLabel;
	}
	getRangeToInsertLabel(): Range {
		const lineToInsertLabel: number = this.getLineToInsertLabel();
		// const range: Range = Range.create(this.mmpSearchStatement.range.start.line - 1, 0,
		// 	this.mmpSearchStatement.range.start.line - 1, 0);
		const range: Range = Range.create(lineToInsertLabel, 0, lineToInsertLabel, 0);
		return range;
	}
	//#endregion getRangeToInsertLabel

	//#region addAssertion
	createCommand(label: string, labelRange: Range): Command {
		const args: any[] = [this.mmpSearchStatement.range.start.line, this.mmpSearchStatement.range.end.line, label,
		labelRange.start.line];
		// const searchCompletionItemCommandParameters: ISearchCompletionItemCommandParameters = {
		// 	searchStatementRange: this.mmpSearchStatement.range,
		// 	uri: 'TODO'
		// };
		const command: Command = Command.create('Search completion item selected', 'yamma.completionitemselected',
			args);
		return command;
	}
	addAssertion(assertion: AssertionStatement, completionItems: CompletionItem[],
		rangeToInsertLabel: Range, _textEditToRemoveSearchStatement: TextEdit) {
		const additionalTextEdit: TextEdit = {
			range: rangeToInsertLabel,
			newText: assertion.Label + '\n'
		};
		const command: Command = this.createCommand(assertion.Label, rangeToInsertLabel);
		// const insertReplaceEdit: InsertReplaceEdit = {
		// 	insert: this.mmpSearchStatement.range,
		// 	replace: this.mmpSearchStatement.range,
		// 	newText: ''
		// };
		// const tEdit: TextEdit = { newText: '', range: this.mmpSearchStatement.range };
		const completionItem: CompletionItem = {
			label: assertion.Label,
			// insertText: 'a',
			// textEdit: tEdit
			// textEdit: TextEdit.del(this.mmpSearchStatement.range),
			// textEdit: textEditToRemoveSearchStatement,
			// textEdit: insertReplaceEdit,
			// additionalTextEdits: [_textEditToRemoveSearchStatement, additionalTextEdit],
			command: command,
			additionalTextEdits: [additionalTextEdit],

			// detail: detail,
			// //TODO see if LSP supports a way to disable client side sorting
			// // sortText: String(index).padStart(3, '0'),
			// sortText: this.sortText(stepSuggestion.completionItemKind, index),
			// textEdit: insertReplaceEdit,
			// kind: stepSuggestion.completionItemKind
			// data: symbol
		};
		completionItems.push(completionItem);
	}
	//#endregion addAssertion
	completionItemsForAssertionsInTheIntersections(assertionsToBeReturned: Set<AssertionStatement> | undefined): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		const rangeToInsertLabel: Range = this.getRangeToInsertLabel();
		const textEditToRemoveSearchStatement: TextEdit = {
			range: this.mmpSearchStatement.range,
			newText: ''
		};
		if (assertionsToBeReturned != undefined)
			assertionsToBeReturned.forEach((assertion: AssertionStatement) => {
				this.addAssertion(assertion, completionItems, rangeToInsertLabel, textEditToRemoveSearchStatement);
			});
		return completionItems;
	}
	//#endregion completionItemsForAssertionsInTheIntersections

	//#region applyCommentFilter
	addAssertionIfItPassesCommentFilter(assertion: AssertionStatement,
		assertionsFromSymbolAndCommentFilters: Set<AssertionStatement>) {
		if (this.assertionContainsAllSubstrings(assertion, this.mmpSearchStatement.substringsToSearchInComments)) {
			assertionsFromSymbolAndCommentFilters.add(assertion);
		}
	}
	private doesCommentContainAllSubstrings(assertionComment: string, normalizedSubstringsToSearch: string[]): boolean {
		let containsAllSubstrings = (assertionComment != undefined);
		let i = 0;
		while (containsAllSubstrings && i < normalizedSubstringsToSearch.length) {
			// all substrings are contained, so far; and i points to an existing substring to check
			// containsAllSubstrings = assertion.normalizedFormula.indexOf(normalizedSubstringsToSearch[i]) != -1;
			containsAllSubstrings = assertionComment.indexOf(normalizedSubstringsToSearch[i]) != -1;
			i++;
		}
		return containsAllSubstrings;
	}

	applyCommentFilter(assertionsFromSymbolFilter: Set<AssertionStatement> | undefined): Set<AssertionStatement> | undefined {
		let assertionsFromSymbolAndCommentFilters = assertionsFromSymbolFilter;
		if (this.mmpSearchStatement.substringsToSearchInComments.length > 0) {
			// the user added a filter for comments content
			assertionsFromSymbolAndCommentFilters = new Set<AssertionStatement>();

			if (this.mmpSearchStatement.symbolsToSearch.length == 0) {

				// the use didn't request to filter for symbols, but only for comments
				this.mmpParser.mmParser.labelToNonSyntaxAssertionMap.forEach((assertion: AssertionStatement) => {
					if (this.doesCommentContainAllSubstrings(assertion.normalizedComment,
						this.mmpSearchStatement.substringsToSearchInComments))
						assertionsFromSymbolAndCommentFilters!.add(assertion);
				}, assertionsFromSymbolAndCommentFilters);
			}
			else if (assertionsFromSymbolFilter != undefined)
				assertionsFromSymbolFilter.forEach((assertion: AssertionStatement) => {
					if (this.doesCommentContainAllSubstrings(assertion.normalizedComment,
						this.mmpSearchStatement.substringsToSearchInComments))
						assertionsFromSymbolAndCommentFilters!.add(assertion);
				});
		}
		return assertionsFromSymbolAndCommentFilters;
	}
	//#endregion applyCommentFilter

	completionItems(): CompletionItem[] {
		const assertionsFromSymbolFilter: Set<AssertionStatement> | undefined = this.getAssertionsFromSymbolFilter();
		const assertionsFromSymbolAndCommentFilters: Set<AssertionStatement> | undefined =
			this.applyCommentFilter(assertionsFromSymbolFilter);
		// const result: CompletionItem[] = this.completionItemsForAssertionsInTheIntersections(assertionsInTheIntersection);
		const result: CompletionItem[] =
			this.completionItemsForAssertionsInTheIntersections(assertionsFromSymbolAndCommentFilters);
		if (result.length == 0)
			// the search yelds no result
			this.addItemNotFound(result);
		return result;
	}


	//#endregion completionItems

}