import { CompletionItem, MarkupContent, MarkupKind } from 'vscode-languageserver';
import { GlobalState } from '../general/GlobalState';
import { MmParser } from '../mm/MmParser';
import { LabeledStatement } from "../mm/LabeledStatement";
import { concatTokenValuesWithSpaces } from '../mm/Utils';
import { OnHoverHandler } from './OnHoverHandler';

export class OnCompletionResolveHandler {
	// item: CompletionItem
	constructor() {
		// this.item = item;
	}
	addDocumentationIfPossible(item: CompletionItem) {
		const mmParser: MmParser | undefined = GlobalState.mmParser;
		if (mmParser != undefined) {
			const labeledStatement: LabeledStatement | undefined = mmParser.labelToStatementMap.get(item.label);
			if (labeledStatement != undefined) {
				//TODO consider using an alternative comment formatter, in place of concatTokenValuesWithSpaces
				//Try to see if a concatTokenValues that only respects line breaks would be better
				const documentationString: string = OnHoverHandler.getContentValueForLabeledStatement(labeledStatement,
					concatTokenValuesWithSpaces);
				// item.documentation = OnHoverHandler.getContentValueForLabeledStatement(labeledStatement);
				const markupContent: MarkupContent = { kind: MarkupKind.Markdown, value: documentationString };
				item.documentation = markupContent;
			}
		}
	}
}