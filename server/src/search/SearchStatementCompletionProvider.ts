import { Command, CompletionItem, Range, TextEdit } from 'vscode-languageserver';
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

	getRangeToInsertLabel(): Range {
		//TODO1 use the last mmpProofStep above the mmpSearchStatement
		// const position: Position = {
		// 	line: this.mmpSearchStatement.range.start.line - 1,
		// 	character: 0
		// };
		// const range: Range = oneCharacterRange(position);
		const range: Range = Range.create(this.mmpSearchStatement.range.start.line - 1, 0,
			this.mmpSearchStatement.range.start.line - 1, 0);
		return range;
	}

	//#region addAssertion
	createCommand(rangeToInsertLabel: Range, label: string): Command {
		const range: Range = Range.create(rangeToInsertLabel.start.line,0,
			rangeToInsertLabel.start.line,label.length);
		const command: Command = Command.create( "ssssss",'window.activeTextEditor.selection',range);
		// const command: Command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
		return command;
	}
	addAssertion(assertion: AssertionStatement, completionItems: CompletionItem[],
		_rangeToInsertLabel: Range, _textEditToRemoveSearchStatement: TextEdit) {
		const additionalTextEdit: TextEdit = {
			range: _rangeToInsertLabel,
			newText: "$$" + assertion.Label + '\n'
		};
		// const command: Command = this.createCommand(_rangeToInsertLabel,assertion.Label);
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
			// command: command
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

	completionItems(): CompletionItem[] {
		const assertionsSets: Set<Set<AssertionStatement>> = this.assertionsSets();
		const assertionsInTheIntersection: Set<AssertionStatement> | undefined = intersection<AssertionStatement>(assertionsSets);
		const result: CompletionItem[] = this.completionItemsForAssertionsInTheIntersections(assertionsInTheIntersection);
		return result;
	}
	//#endregion completionItems

}