import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmpProofStep } from "./MmpProofStep";
import { MmpProof } from './MmpProof';
import { IUStatement } from './UStatement';

export class WorkingVarsUnifierApplier {
	unifier: Map<string, InternalNode>;
	uProof: MmpProof;
	constructor(unifier: Map<string, InternalNode>, uProof: MmpProof) {
		this.unifier = unifier;
		this.uProof = uProof;
	}

	//#region applyUnifier

	//#region applyUnifierToProofStep

	//#region applyUnifierToSingleNode
	applyUnifierToSingleInternalNode(parseNode: InternalNode) {
		for (let i = 0; i < parseNode.parseNodes.length; i++) {
			const child: ParseNode = parseNode.parseNodes[i];
			if (GrammarManager.isInternalParseNodeForWorkingVar(child)) {
				// child is an internal node for a Working Var
				const workingVar: string = GrammarManager.getTokenValueFromInternalNode(<InternalNode>child);
				const substitutionForWorkingVar: InternalNode | undefined = this.unifier.get(workingVar);
				if (substitutionForWorkingVar != undefined)
					parseNode.parseNodes.splice(i, 1, substitutionForWorkingVar);
			} else if (child instanceof InternalNode)
				this.applyUnifierToSingleNode(child);
		}
	}
	applyUnifierToSingleNode(parseNode: InternalNode | undefined) {
		if (parseNode instanceof InternalNode)
			this.applyUnifierToSingleInternalNode(parseNode);
	}
	//#endregion applyUnifierToSingleNode
	applyUnifierToProofStep(uProofStep: MmpProofStep) {
		uProofStep.eHypUSteps.forEach((eHypUStep: MmpProofStep | undefined) => {
			if (eHypUStep != undefined)
				// eHypUStep is a UProofStep
				this.applyUnifierToSingleNode(eHypUStep.parseNode);
		});
		this.applyUnifierToSingleNode(uProofStep.parseNode);
	}
	//#endregion applyUnifierToProofStep

	/**
	 * applies the unifier in every step of this.uProof;
	 * at the end of the method, this.uProof will have all working vars
	 * replaced by the given unifier
	 */
	applyUnifier() {
		this.uProof.uStatements.forEach((uStatement: IUStatement) => {
			if (uStatement instanceof MmpProofStep)
				this.applyUnifierToProofStep(uStatement);
		});
	}
	//#endregion applyUnifier
}