import { HoverParams, Position, Range, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from "vscode-languageserver-textdocument";
import { MmParser } from '../mm/MmParser';
import { AssertionStatement, EHyp, LabeledStatement } from '../mm/Statements';
import { concatWithSpaces, rebuildOriginalStringFromTokens } from '../mm/Utils';

export abstract class OnHoverHandler {
	//#region GetContentValue
	/**
	 * The text to be shown for the onHover event
	 */

	//Returns the token containing @position

	//#region getTokenFromPosition
	static getLineFromPosition(textDocument: TextDocument, position: Position): string {
		const lineNumber = position.line;
		const lineRange: Range = { start: { line: lineNumber, character: 0 }, end: { line: lineNumber + 1, character: 0 } };
		const line = textDocument.getText(lineRange);
		return line;
	}
	static getTokenGivenTheColumn(line: string, column: number): string {
		const lineBeforePosition = line.substring(0, column);
		let matches = lineBeforePosition.match(/[\s+:,]/g);
		let tokenStart = 0;
		if (matches != null)
			tokenStart = lineBeforePosition.lastIndexOf(matches[matches.length - 1]) + 1;
		//var tokenStart = lineBeforePosition.lastIndexOf(matches[matches.length - 1]) + 1
		const lineAfterPosition = line.substring(column);
		let tokenEnd = line.length;
		matches = lineAfterPosition.match(/[\s+:,]/g);
		if (matches != null)
			tokenEnd = column + lineAfterPosition.indexOf(matches[0]);
		const token = line.slice(tokenStart, tokenEnd);
		// const startPosition: Position = { line: line, character: tokenStart };
		// const endPosition: Position = { line: line, character: tokenEnd };
		// const tokenRange: Range = { start: startPosition, end: endPosition };
		// const token = textDocument.getText(tokenRange);
		TextDocument.create;
		return token;
	}

	static getTokenFromPosition(textDocument: TextDocument, position: Position): string {
		const line = OnHoverHandler.getLineFromPosition(textDocument, position);
		const token = OnHoverHandler.getTokenGivenTheColumn(line, position.character);
		return token;
	}
	//#endregion getTokenFromPosition

	//#region getContentValueFromToken
	static getMainContentForLabeledStatement(labeledStatement: LabeledStatement): string {
		//TODO add spaces between tokens
		const mainContent = `**${labeledStatement.Label}** ` + concatWithSpaces(labeledStatement.formula);
		// labeledStatement.Content.forEach(symbol => {
		// 	mainContent += " " + symbol;
		// });
		// + " ".concat(...labeledStatement.Content)
		return mainContent;
	}
	static getContentValueForLabeledStatement(labeledStatement: LabeledStatement): string {
		let contentValue = "";
		if ( labeledStatement.comment != undefined && labeledStatement.comment.length > 0) {
			contentValue = rebuildOriginalStringFromTokens(labeledStatement.comment);
			contentValue += "\n___\n";
		}
		if (labeledStatement instanceof AssertionStatement) {
			const eHyps = <EHyp[]>labeledStatement.frame?.eHyps;
			eHyps.forEach(eHyp => {
				// contentValue = contentValue.concat(OnHoverHandler.getMainContentForLabeledStatement(eHyp));
				contentValue = contentValue.concat(concatWithSpaces(eHyp.formula));
				contentValue += "  \n";
			});
		}
		contentValue += "___\n";
		contentValue = contentValue.concat(OnHoverHandler.getMainContentForLabeledStatement(labeledStatement));
		return contentValue;
	}
	static getContentValueFromToken(parser: MmParser, token: string): string | undefined {
		const labeledStatement: LabeledStatement | undefined = parser.labelToStatementMap.get(token);
		// let contentValue = `${token} is not a valid label`;
		let contentValue : string | undefined;
		if (labeledStatement != undefined)
			contentValue = OnHoverHandler.getContentValueForLabeledStatement(labeledStatement);
		return contentValue;
	}
	//#endregion getContentValueFromToken

	public static getHoverMessage(params: HoverParams, documents: TextDocuments<TextDocument>, parser: MmParser): string
		| undefined {
		let contentValue: string | undefined;
		const textDocument: TextDocument = <TextDocument>documents.get(params.textDocument.uri);
		const token = OnHoverHandler.getTokenFromPosition(textDocument, params.position);
		// OnHoverHandler.GetContentValueFromToken(token, parser)
		// let contentValue = "";
		if (token != "" && parser.isParsingComplete) {
			contentValue = OnHoverHandler.getContentValueFromToken(parser, token);
		}
		return contentValue;
	}
	//#endregion GetContentValue
}

