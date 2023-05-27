import { Command, CompletionItem, InsertReplaceEdit, Range } from 'vscode-languageserver';
import { MmpParser } from './MmpParser';
import { CursorContext } from './CursorContext';
import { AssertionStatement } from '../mm/AssertionStatement';
import { StepSuggestion } from '../stepSuggestion/StepSuggestion';
import { MmToken } from '../grammar/MmLexer';
import { range } from '../mm/Utils';

export class CompletionProviderForAfterGetProof {

	private command: Command = Command.create('Completion item selected', 'yamma.completionitemselected');

	constructor(private cursorContext: CursorContext, private mmpParser: MmpParser) {

	}

	//#region completionItems
	getPartialLabel(): MmToken {
		let partialLabel: MmToken | undefined;
		if (this.cursorContext.currentLine.length > 1)
			// there are at least two tokens
			partialLabel = this.cursorContext.currentLine[1];
		else
			partialLabel = new MmToken('', this.cursorContext.cursorLine, this.cursorContext.cursorCharacter);
		return partialLabel;
	}
	//#region getCompletionItemsFromPartialLabel
	insertReplaceEdit(partialLabel: MmToken, label: string): InsertReplaceEdit | undefined {
		const insertRange: Range = partialLabel.range;
		const replaceRange: Range = range(label, insertRange.start.line, insertRange.start.character);
		const insertReplaceEdit = {
			insert: insertRange,
			replace: replaceRange,
			newText: label
		};
		return insertReplaceEdit;
	}
	createAndAddItemFromPartialLabel(partialLabel: MmToken, label: string,
		completionItems: CompletionItem[]) {
		const insertReplaceEdit: InsertReplaceEdit | undefined = this.insertReplaceEdit(partialLabel, label);
		const completionItem: CompletionItem = {
			label: label,
			command: this.command,
			// sortText: this.sortText(this.completionItemKindForPartialLabel, i),
			textEdit: insertReplaceEdit
			// kind: this.completionItemKindForPartialLabel
		};
		completionItems.push(completionItem);
	}
	getCompletionItemsFromPartialLabel(partialLabel: MmToken): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		const regExp: RegExp = StepSuggestion.buildRegExp(partialLabel.value);
		this.mmpParser.mmParser.labelToNonSyntaxAssertionMap.forEach((_assertion: AssertionStatement, label: string) => {
			if (partialLabel.value == '' || regExp.test(label)) {
				// the current assertion's label contains the partial label input by the user
				this.createAndAddItemFromPartialLabel(partialLabel, label, completionItems);
			}
		});
		return completionItems;
	}
	//#endregion getCompletionItemsFromPartialLabel
	completionItems(): CompletionItem[] {
		let completionItems: CompletionItem[] = [];
		const partialLabel: MmToken = this.getPartialLabel();
		if (partialLabel != undefined)
			//there was a partial label for the $getproof statement 
			completionItems = this.getCompletionItemsFromPartialLabel(partialLabel);
		return completionItems;
	}
	//#endregion completionItems

}