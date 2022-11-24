import { CompletionItem } from 'vscode-languageserver';
import { MmStatistics } from '../mm/MmStatistics';
import { AssertionStatement } from "../mm/AssertionStatement";
import { intersection } from '../mm/Utils';
import { MmpSearchStatement } from '../mmp/MmpSearchStatement';

export class SearchStatementCompletionProvider {

	mmpSearchStatement: MmpSearchStatement;
	mmStatistics: MmStatistics;
	constructor(mmpSearchStatement: MmpSearchStatement, mmStatistics: MmStatistics) {
		this.mmpSearchStatement = mmpSearchStatement;
		this.mmStatistics = mmStatistics;
	}

	//#region completionItems
	assertionsSets(): Set<Set<AssertionStatement>> {
		const result: Set<Set<AssertionStatement>> = new Set<Set<AssertionStatement>>();
		this.mmpSearchStatement.symbolsToSearch.forEach((symbol: string) => {
			const assertionsContainingThisSymbol: Set<AssertionStatement> | undefined =
				this.mmStatistics.symbolToAssertionsMap?.get(symbol);
			if (assertionsContainingThisSymbol != undefined)
				result.add(assertionsContainingThisSymbol);
		});
		return result;
	}

	//#region completionItemsForAssertionsInTheIntersections
	addAssertion(assertion: AssertionStatement, completionItems: CompletionItem[]) {
		const completionItem: CompletionItem = {
			label: assertion.Label,
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
	completionItemsForAssertionsInTheIntersections(assertionsToBeReturned: Set<AssertionStatement> | undefined): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		if (assertionsToBeReturned != undefined)
		assertionsToBeReturned.forEach((assertion: AssertionStatement) => {
			this.addAssertion(assertion,completionItems);
			
		});
		return completionItems;
	}
	//#endregion completionItemsForAssertionsInTheIntersections
	
	completionItems(): CompletionItem[] {
		const assertionsSets: Set<Set<AssertionStatement>> = this.assertionsSets();
		const assertionsInTheIntersection: Set<AssertionStatement> | undefined = intersection<AssertionStatement>(assertionsSets);
		const result: CompletionItem[] = this.completionItemsForAssertionsInTheIntersections(assertionsInTheIntersection);
		return result;
	}
	//#endregion completionItems

}