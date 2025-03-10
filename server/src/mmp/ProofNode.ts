import { InternalNode } from '../grammar/ParseNode';
import { BlockStatement } from '../mm/BlockStatement';
import { MmpProofStep } from './MmpProofStep';

export class ProofNode {
	constructor(
		public internalNode: InternalNode,
		public children: ProofNode[],
		public mmpProofStep?: MmpProofStep) {
	}

	toText(): string {
		let text: string;
		if (this.mmpProofStep != undefined)
			// this is a proof node for a MmpProofStep
			text = this.mmpProofStep.stepLabel!;
		else
			// this is a proof node for a substitution
			text = this.internalNode.label;
		return text;
	}

	public get cachedRpnRepresentation(): string {
		const representation: string = this.internalNode.cachedRpnRepresentation;
		return representation;
	}

	//#region proofNodeForParseNode
	private static proofNodesWithSubstitution(outermostBlock: BlockStatement,
		substitutionInRpnOrder: Map<string, InternalNode>): ProofNode[] {
		const proofNodes: ProofNode[] = [];
		substitutionInRpnOrder.forEach((substitution: InternalNode) => {
			// const proofNode: ProofNode = substitution.proofNode(outermostBlock, grammar);
			const proofNode: ProofNode = ProofNode.proofNodeForParseNode(substitution, outermostBlock);
			proofNodes.push(proofNode);
		});
		return proofNodes;
	}
	public static proofNodeForParseNode(parseNode: InternalNode, outermostBlock: BlockStatement) {
		const substitutionInRpnOrder: Map<string, InternalNode> = parseNode.buildSubstitutionInRpnOrder(
			outermostBlock, outermostBlock.grammar!);
		const children: ProofNode[] = ProofNode.proofNodesWithSubstitution(outermostBlock,
			substitutionInRpnOrder);
		// const proofStatementStep: UProofStatementStep = {
		// 	label: parseNode.label,
		// 	parseNode: parseNode
		// };
		const proofNode: ProofNode = new ProofNode(parseNode, children);
		return proofNode;
	}
	//#endregion proofNodeForParseNode


	//#region proofNode

	//#region proofNodeChildren

	//#region addProofNodesForFStatements
	private static addProofNodesForFStatements(mmpProofStep: MmpProofStep, proofNodes: ProofNode[]) {
		const mandatoryVarsInRPNorder: string[] =
			mmpProofStep.getMandatoryVarsInRPNorder(mmpProofStep.mmpProof.outermostBlock);
		mandatoryVarsInRPNorder.forEach((logicalVar: string) => {
			const logicalVarSubstitutionNode: InternalNode =
				<InternalNode>mmpProofStep.substitution?.get(logicalVar);
			// const proofNode: ProofNode = logicalVarSubstitutionNode.proofNode(
			// 	mmpProofStep.uProof.outermostBlock, <Grammar>mmpProofStep.uProof.outermostBlock.grammar);
			const proofNode: ProofNode = ProofNode.proofNodeForParseNode(logicalVarSubstitutionNode,
				mmpProofStep.mmpProof.outermostBlock);
			proofNodes.push(proofNode);
		});
	}
	//#endregion addProofNodesForFStatements

	private static addProofNodesForEHyps(mmpProofStep: MmpProofStep, output: ProofNode[]) {
		mmpProofStep.eHypUSteps.forEach((eHyp: MmpProofStep | undefined) => {
			if (eHyp instanceof MmpProofStep) {
				const proofNode: ProofNode = ProofNode.proofNodeForMmpProofStep(eHyp);
				output.push(proofNode);
			}
		});
	}

	private static proofNodeChildren(mmpProofStep: MmpProofStep): ProofNode[] {
		const output: ProofNode[] = [];
		if (mmpProofStep.substitution != undefined)
			this.addProofNodesForFStatements(mmpProofStep, output);
		this.addProofNodesForEHyps(mmpProofStep, output);
		return output;
	}
	//#endregion proofNodeChildren

	public static proofNodeForMmpProofStep(mmpProofStep: MmpProofStep): ProofNode {
		const children: ProofNode[] = ProofNode.proofNodeChildren(mmpProofStep);
		const output: ProofNode = new ProofNode(mmpProofStep.parseNode!, children, mmpProofStep);
		return output;
	}
	//#endregion proofNode

	//#region squishProofNode
	private static squishProofNodeChildren(children: ProofNode[], encountered: Map<string, ProofNode>) {
		for (let i = 0; i < children.length; i++) {
			children[i] = ProofNode.squishProofNode2(children[i], encountered);
		}
	}

	private static squishProofNode2(proofNode: ProofNode, encountered: Map<string, ProofNode>): ProofNode {
		if (proofNode.children != undefined)
			ProofNode.squishProofNodeChildren(proofNode.children, encountered);
		let output: ProofNode = proofNode;
		const mayBeEncountered: ProofNode | undefined = encountered.get(proofNode.cachedRpnRepresentation);
		if (mayBeEncountered != undefined)
			output = mayBeEncountered;
		else
			// this formula has never been seen, before
			encountered.set(proofNode.cachedRpnRepresentation, proofNode);
		return output;
	}
	public static squishProofNode(proofNode: ProofNode): ProofNode {
		const output: ProofNode = ProofNode.squishProofNode2(proofNode, new Map<string, ProofNode>());
		return output;
	}
	//#endregion squishProofNode
}