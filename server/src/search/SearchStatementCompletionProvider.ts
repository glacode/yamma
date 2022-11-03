import { MmpSearchStatement } from '../mmp/MmpSearchStatement';

export class SearchStatementCompletionProvider {
	completionItems(): import("vscode-languageserver-types").CompletionItem[] {
		throw new Error('Method not implemented.');
	}
	mmpSearchStatement: MmpSearchStatement;
	constructor(mmpSearchStatement: MmpSearchStatement) {
		this.mmpSearchStatement = mmpSearchStatement;
	}
}