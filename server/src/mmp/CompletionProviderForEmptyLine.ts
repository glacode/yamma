import { CompletionItem } from 'vscode-languageserver';
import { MmpParser } from './MmpParser';

export class CompletionProviderForEmptyLine {
	constructor(private mmpParser: MmpParser) {

	}

	//#region completionItems
	addCompletionItemForTheoremLabel(completionItems: CompletionItem[]) {
		if (this.mmpParser.mmpProof != undefined &&
			this.mmpParser.mmpProof?.mmpTheoremLabels.length == 0) {
			const completionItem: CompletionItem = {
				label: '$theorem'
			};
			completionItems.push(completionItem);
		}
	}
	addCompletionItemForGetProof(completionItems: CompletionItem[]) {
		const completionItem: CompletionItem = {
			label: '$getproof'
		};
		completionItems.push(completionItem);
	}
	completionItems(): CompletionItem[] {
		const completionItems: CompletionItem[] = [];
		// if (this.cursorContext.cursorCharacter == 0) {
		this.addCompletionItemForTheoremLabel(completionItems);
		this.addCompletionItemForGetProof(completionItems);
		// }
		return completionItems;
	}
	//#endregion completionItems
}