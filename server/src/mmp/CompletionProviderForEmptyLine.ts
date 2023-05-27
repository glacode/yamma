import { CompletionItem, InsertReplaceEdit, Range } from 'vscode-languageserver';
import { CursorContext } from './CursorContext';
import { MmpParser } from './MmpParser';
import { MmToken } from '../grammar/MmLexer';
import { range } from '../mm/Utils';

export class CompletionProviderForEmptyLine {
	constructor(private cursorContext: CursorContext, private mmpParser: MmpParser) {

	}

	//#region completionItems

	//#region addCompletionItem
	private insertReplaceEdit(stepSuggestionLabel: string): InsertReplaceEdit | undefined {
		let insertReplaceEdit: InsertReplaceEdit | undefined;
		const firstTokenIfItTouchesTheCursor: MmToken | undefined =
			CursorContext.firstTokenIfItTouchesTheCursor(this.cursorContext.cursorLine,
				this.cursorContext.cursorCharacter, this.mmpParser);
		if (firstTokenIfItTouchesTheCursor != undefined) {
			const insertRange: Range = firstTokenIfItTouchesTheCursor.range;
			const replaceRange: Range = range(stepSuggestionLabel, insertRange.start.line, insertRange.start.character);
			insertReplaceEdit = {
				insert: insertRange,
				replace: replaceRange,
				newText: stepSuggestionLabel
			};
		}
		return insertReplaceEdit;
	}
	addCompletionItem(suggestedLable: string, completionItems: CompletionItem[]) {
		const insertReplaceEdit: InsertReplaceEdit | undefined =
			this.insertReplaceEdit(suggestedLable);
		const completionItem: CompletionItem = {
			label: suggestedLable,
			textEdit: insertReplaceEdit
		};
		completionItems.push(completionItem);
	}
	//#endregion addCompletionItem


	addCompletionItemForTheoremLabel(completionItems: CompletionItem[]) {
		if (this.mmpParser.mmpProof != undefined &&
			this.mmpParser.mmpProof?.mmpTheoremLabels.length == 0)
			// there is not a MmpTheoremStatement, in the proof
			this.addCompletionItem('$theorem ', completionItems);
	}
	addCompletionItemForGetProof(completionItems: CompletionItem[]) {
		this.addCompletionItem('$getproof ', completionItems);
	}
	completionItems(): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		this.addCompletionItemForTheoremLabel(completionItems);
		this.addCompletionItemForGetProof(completionItems);
		return completionItems;
	}
	//#endregion completionItems
}