import { GrammarManager } from '../grammar/GrammarManager';
import { BlockStatement } from '../mm/BlockStatement';
import { ProofNode } from './ProofNode';


/**
 * This class resembles the RNPstep class in mmj2.
 * Stores backreference information in "packed" and "compressed" formats.
 * In packed format, proof steps come in three different flavors: unmarked
 * (for example 'syl') and marked (for example '5:syl'), as well
 * as backreference steps (just written as numbers i.e. '5'). In
 * compressed format the same rules apply, except it is harder to read.
 * Marked steps get a 'Z' after the number, and backreferences are
 * numbers larger than the statement list. In our format, which most closely
 * resembles the packed format, unmarked steps have undefined markedStep
 * and undefined backRef.
 * Marked steps have a valid markedStep (the ref number, in the packedProof)
 * and undefined backRef.
 * Backreference steps, have undefined markedStep and backRef is referenced step.
 * )
 */
export class RpnStep {

	public isMarkedStep = false;

	public markedStepNumber?: number;

	//#region isMarkedStepCandidate

	/** true iff the proof for the given proof node is a single label; we don't want
	 * this kind of RPNStep to be a marked step. This is similar the mmj2 behaviour,
	 * see the paramater pressLeaf given as true to the mmj2 method
	 * ParseNode.convetToRPN(final boolean pressLeaf)
	 */
	isSingleStepProof(proofNode: ProofNode) {
		const output = proofNode.children.length == 0;
		return output;
	}
	/** true iff its proof is a single step. It is used by  */
	public get isMarkedStepCandidate(): boolean {
		const output: boolean = !this.proofNode.mmpProofStep?.isEHyp
			&& !this.isSingleStepProof(this.proofNode);
		return output;
	}
	//#endregion isMarkedStepCandidate

	constructor(public proofNode: ProofNode, public backRef?: RpnStep) {
	}

	//#region packetProof
	/** this is similar to the ParseNode.convertToRPN() method in mmj2	 */

	//#region packetProof2

	//#region packedProofForAStepThatIsNotABackreference

	//#region addCurrentProofNode
	static isUnmarkedStep(proofNode: ProofNode, outermostBlock: BlockStatement) {
		// const isUnmarked: boolean = proofNode.proofNodeType == ProofNodeType.substitution;
		const isUnmarked: boolean = GrammarManager.isInternalParseNodeForFHyp(
			proofNode.internalNode, outermostBlock.v);
		return isUnmarked;
	}
	static createRpnStep(proofNode: ProofNode, outermostBlock: BlockStatement,
		encountered: Map<ProofNode, RpnStep>): RpnStep {
		let rpnStep: RpnStep;
		// const referencedStep: RpnStep | undefined = encountered.get(proofNode);
		if (RpnStep.isUnmarkedStep(proofNode, outermostBlock))
			rpnStep = new RpnStep(proofNode, undefined);
		else {
			// this is possibly a marked step
			rpnStep = new RpnStep(proofNode, undefined);
			encountered.set(proofNode, rpnStep);
		}
		return rpnStep;
	}
	static addCurrentProofNode(proofNode: ProofNode, outermostBlock: BlockStatement,
		encountered: Map<ProofNode, RpnStep>, rpnSteps: RpnStep[]) {
		const currentProofNode: RpnStep = RpnStep.createRpnStep(proofNode,
			outermostBlock, encountered);
		rpnSteps.push(currentProofNode);
	}
	//#endregion addCurrentProofNode

	static packedProofForAStepThatIsNotABackreference(proofNode: ProofNode,
		outermostBlock: BlockStatement, encountered: Map<ProofNode, RpnStep>, rpnSteps: RpnStep[]) {
		proofNode.children.forEach((child: ProofNode) => {
			this.packedProof2(child, outermostBlock, encountered, rpnSteps);
		});
		RpnStep.addCurrentProofNode(proofNode, outermostBlock,
			encountered, rpnSteps);
	}
	//#endregion packedProofForAStepThatIsNotABackreference


	static packedProof2(proofNode: ProofNode, outermostBlock: BlockStatement,
		encountered: Map<ProofNode, RpnStep>, rpnSteps: RpnStep[]) {
		const referencedStep: RpnStep | undefined = encountered.get(proofNode);
		if (referencedStep != undefined && referencedStep.isMarkedStepCandidate) {
			// this is a backReference step
			referencedStep.isMarkedStep = true;
			const rpnStep = new RpnStep(proofNode, referencedStep);
			rpnSteps.push(rpnStep);
		} else
			// this is NOT a backReference step
			RpnStep.packedProofForAStepThatIsNotABackreference(
				proofNode, outermostBlock, encountered, rpnSteps);
	}
	//#endregion packetProof2

	static setMarkedStepNumber(rpnSteps: RpnStep[]) {
		let nextMarkedStatementIndex = 1;
		rpnSteps.forEach((rpnStep: RpnStep) => {
			if (rpnStep.isMarkedStep && rpnStep.markedStepNumber == undefined)
				rpnStep.markedStepNumber = nextMarkedStatementIndex++;
		});
	}

	static packedProof(proofNode: ProofNode, outermostBlock: BlockStatement): RpnStep[] {
		const squishedProofNode: ProofNode = ProofNode.squishProofNode(proofNode);
		const encountered: Map<ProofNode, RpnStep> = new Map<ProofNode, RpnStep>();
		const rpnSteps: RpnStep[] = [];
		RpnStep.packedProof2(squishedProofNode, outermostBlock, encountered, rpnSteps);
		RpnStep.setMarkedStepNumber(rpnSteps);
		return rpnSteps;
	}
	//#endregion packetProof

	toText(): string {
		let text: string;
		if (this.backRef != undefined)
			// this is a backreference step
			text = this.backRef.markedStepNumber!.toString();
		else if (this.markedStepNumber != undefined)
			// this is a marked step
			text = `${this.markedStepNumber}:${this.proofNode.toText()}`;
		else
			// this is a unmarked step
			text = this.proofNode.toText();
		return text;
	}

}