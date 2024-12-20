import { MmToken } from '../grammar/MmLexer';
import { InternalNode, ParseNode } from '../grammar/ParseNode';

export interface InternalNodeForThread {
	label: string;
	kind: string;
	parseNodes: ParseNodeForThread[]
}

export interface MmTokenForThread {
	value: string;
	line: number;
	column: number;
}

/**
 * The ParseNodeForThreadConverter class provides methods to convert parse nodes and tokens
 * into a format suitable for multi-threaded processing. We need this because threads cannot
 * pass objects that are not serializable.
 */
export abstract class ParseNodeForThreadConverter {

	//#region convertParseNode
	static convertMmToken(mmToken: MmToken): MmTokenForThread {
		const mmTokenForThread: MmTokenForThread = {
			value: mmToken.value,
			line: mmToken.line,
			column: mmToken.column
		};
		return mmTokenForThread;
	}

	//#region converInternalParseNode
	private static convertParseNodes(parseNodes: ParseNode[]): ParseNodeForThread[] {
		const parseNodesForThread: ParseNodeForThread[] = [];
		parseNodes.forEach((parseNode: ParseNode) => {
			const parseNodeForThread: ParseNodeForThread = ParseNodeForThreadConverter.convertParseNode(parseNode);
			parseNodesForThread.push(parseNodeForThread);
		});
		return parseNodesForThread;
	}
	private static convertInternalParseNode(parseNode: InternalNode): InternalNodeForThread {
		const subNodes: ParseNodeForThread[] = ParseNodeForThreadConverter.convertParseNodes(parseNode.parseNodes);
		const internalNodeForThread: InternalNodeForThread = {
			label: parseNode.label,
			kind: parseNode.kind,
			parseNodes: subNodes
		};
		return internalNodeForThread;
	}
	//#endregion converInternalParseNode

	public static convertParseNode(parseNode: ParseNode): ParseNodeForThread {
		let parseNodeForThread: ParseNodeForThread;
		if (parseNode instanceof MmToken)
			parseNodeForThread = ParseNodeForThreadConverter.convertMmToken(parseNode);
		else
			// parseNode is an InternalNode
			parseNodeForThread = ParseNodeForThreadConverter.convertInternalParseNode(parseNode);
		return parseNodeForThread;
	}
	//#endregion convertParseNode


	//#region convertParseNodeForThread


	//#region convertInternalParseNodeForThread
	private static convertParseNodesForThread(parseNodesForThreads: ParseNodeForThread[]): ParseNode[] {
		const parseNodes: ParseNode[] = [];
		parseNodesForThreads.forEach((parseNodeForThread: ParseNodeForThread) => {
			const parseNode: ParseNode = ParseNodeForThreadConverter.convertParseNodeForThread(parseNodeForThread);
			parseNodes.push(parseNode);
		});
		return parseNodes;
	}
	private static convertInternalParseNodeForThread(internalNodeForThread: InternalNodeForThread): InternalNode {
		const subNodes: ParseNode[] = ParseNodeForThreadConverter.convertParseNodesForThread(internalNodeForThread.parseNodes);
		const internalNode: InternalNode = new InternalNode(
			internalNodeForThread.label, internalNodeForThread.kind, subNodes);
		return internalNode;
	}
	//#endregion convertInternalParseNodeForThread

	public static convertParseNodeForThread(parseNodeForThread: ParseNodeForThread): ParseNode {
		let parseNode: ParseNode;
		if ('value' in parseNodeForThread)
			// parseNode is a MmTokenForThread
			parseNode = new MmToken(parseNodeForThread.value, parseNodeForThread.line, parseNodeForThread.column);
		else
			// parseNode is a InternalNodeForThread
			parseNode = ParseNodeForThreadConverter.convertInternalParseNodeForThread(parseNodeForThread);
		return parseNode;
	}
	//#endregion convertParseNodeForThread
}

export type ParseNodeForThread = InternalNodeForThread | MmTokenForThread;
