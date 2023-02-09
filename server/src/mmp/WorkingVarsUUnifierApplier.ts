import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmpProofStep } from "./MmpProofStep";
import { MmpProof } from './MmpProof';
import { IMmpStatement } from './MmpStatement';
import { FormulaToParseNodeCache } from './FormulaToParseNodeCache';
import { concatTokenValuesWithSpaces } from '../mm/Utils';

export class WorkingVarsUnifierApplier {
	unifier: Map<string, InternalNode>;
	uProof: MmpProof;
	constructor(unifier: Map<string, InternalNode>, uProof: MmpProof,
		private formulaToParseNodeCache?: FormulaToParseNodeCache) {
		this.unifier = unifier;
		this.uProof = uProof;
	}

	//#region applyUnifier

	//#region applyUnifierToProofStep

	//#region applyUnifierToSingleNode

	invalidateParseNodeCache(mmpProofStep: MmpProofStep) {
		if (this.formulaToParseNodeCache != undefined && mmpProofStep.formula != undefined) {
			const stepFormulaString: string = concatTokenValuesWithSpaces(mmpProofStep.formula);

			this.formulaToParseNodeCache.invalidate(stepFormulaString);
		}
	}

	applyUnifierToSingleInternalNode(parseNode: InternalNode, mmpProofStep: MmpProofStep) {
		for (let i = 0; i < parseNode.parseNodes.length; i++) {
			const child: ParseNode = parseNode.parseNodes[i];
			if (GrammarManager.isInternalParseNodeForWorkingVar(child)) {
				// child is an internal node for a Working Var
				const workingVar: string = GrammarManager.getTokenValueFromInternalNode(<InternalNode>child);
				const substitutionForWorkingVar: InternalNode | undefined = this.unifier.get(workingVar);
				if (substitutionForWorkingVar != undefined) {
					parseNode.parseNodes.splice(i, 1, substitutionForWorkingVar);
					this.invalidateParseNodeCache(mmpProofStep);

				}
			} else if (child instanceof InternalNode)
				this.applyUnifierToSingleNode(child, mmpProofStep);
		}
	}
	applyUnifierToSingleNode(parseNode: InternalNode | undefined, mmpProofStep: MmpProofStep) {
		if (parseNode instanceof InternalNode)
			this.applyUnifierToSingleInternalNode(parseNode, mmpProofStep);
	}
	//#endregion applyUnifierToSingleNode
	applyUnifierToProofStep(mmpProofStep: MmpProofStep) {
		mmpProofStep.eHypUSteps.forEach((eHypUStep: MmpProofStep | undefined) => {
			if (eHypUStep != undefined)
				// eHypUStep is a UProofStep
				this.applyUnifierToSingleNode(eHypUStep.parseNode, mmpProofStep);
		});
		this.applyUnifierToSingleNode(mmpProofStep.parseNode, mmpProofStep);
	}
	//#endregion applyUnifierToProofStep

	/**
	 * applies the unifier in every step of this.uProof;
	 * at the end of the method, this.uProof will have all working vars
	 * replaced by the given unifier
	 */
	applyUnifier() {
		this.uProof.uStatements.forEach((uStatement: IMmpStatement) => {
			if (uStatement instanceof MmpProofStep)
				this.applyUnifierToProofStep(uStatement);
		});
	}
	//#endregion applyUnifier
}