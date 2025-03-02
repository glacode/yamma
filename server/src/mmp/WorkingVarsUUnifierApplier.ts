import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmpProofStep } from "./MmpProofStep";
import { MmpProof } from './MmpProof';
import { IMmpStatement } from './MmpStatement';
import { FormulaToParseNodeCache } from './FormulaToParseNodeCache';
import { concatTokenValuesWithSpaces } from '../mm/Utils';
import { MmpSubstitutionBuilder, SubstitutionResult } from './MmpSubstitutionBuilder';

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

	applyUnifierToSingleInternalNode(parseNode: InternalNode): boolean {
		let isParseNodeChanged = false;
		for (let i = 0; i < parseNode.parseNodes.length; i++) {
			const child: ParseNode = parseNode.parseNodes[i];
			if (GrammarManager.isInternalParseNodeForWorkingVar(child)) {
				// child is an internal node for a Working Var
				const workingVar: string = GrammarManager.getTokenValueFromInternalNode(<InternalNode>child);
				const substitutionForWorkingVar: InternalNode | undefined = this.unifier.get(workingVar);
				if (substitutionForWorkingVar != undefined) {
					parseNode.parseNodes.splice(i, 1, substitutionForWorkingVar);
					isParseNodeChanged = true;
				}
			} else if (child instanceof InternalNode) {
				const isChildChanged = this.applyUnifierToSingleInternalNode(child);
				isParseNodeChanged ||= isChildChanged;
			}
		}

		// const length: number = parseNode.parseNodes.length;
		// // let i = 0;
		// for (i = 0; i < length; i++) {
		// 	const child: ParseNode = parseNode.parseNodes[i];
		// 	if (GrammarManager.isInternalParseNodeForWorkingVar(child)) {
		// 		// child is an internal node for a Working Var
		// 		const workingVar: string = GrammarManager.getTokenValueFromInternalNode(<InternalNode>child);
		// 		const substitutionForWorkingVar: InternalNode | undefined = this.unifier.get(workingVar);
		// 		if (substitutionForWorkingVar != undefined) {
		// 			parseNode.parseNodes.splice(i, 1, substitutionForWorkingVar);
		// 			isParseNodeChanged = true;

		// 		}
		// 	} else if (child instanceof InternalNode)
		// 		isParseNodeChanged ||= this.applyUnifierToSingleInternalNode(child);
		// }
		return isParseNodeChanged;
	}
	// applyUnifierToSingleNode(parseNode: InternalNode | undefined): boolean {
	// 	let isParseNodeChanged = false;
	// 	if (parseNode instanceof InternalNode)
	// 		isParseNodeChanged = this.applyUnifierToSingleInternalNode(parseNode);
	// 	return isParseNodeChanged;
	// }
	//#endregion applyUnifierToSingleNode
	applyUnifierToSubstitution(mmpProofStep: MmpProofStep) {
		mmpProofStep.substitution?.forEach((internalNode: InternalNode, logicalVar: string) => {
			if (GrammarManager.isInternalParseNodeForWorkingVar(internalNode)) {
				// the substitution substitutes the logical var with a single working var
				const workingVar: string = GrammarManager.getTokenValueFromInternalNode(internalNode);
				const substitutionForWorkingVar: InternalNode | undefined = this.unifier.get(workingVar);
				if (substitutionForWorkingVar != undefined)
					mmpProofStep.substitution?.set(logicalVar, substitutionForWorkingVar);
			} else
				// the substitution is an internal node that may contain some working vars
				// for which the unifier has found a substitution
				this.applyUnifierToSingleInternalNode(internalNode);
		});
	}

	rebuildSubstitution(mmpProofStep: MmpProofStep) {
		if (mmpProofStep.assertion != undefined) {
			const uSubstitutionBuilder: MmpSubstitutionBuilder = new MmpSubstitutionBuilder(mmpProofStep,
				mmpProofStep.assertion, mmpProofStep.mmpProof.outermostBlock,
				mmpProofStep.mmpProof.workingVars, mmpProofStep.mmpProof.outermostBlock.grammar!, []);
			const substitutionResult: SubstitutionResult = uSubstitutionBuilder.buildSubstitution();
			if (substitutionResult.hasBeenFound)
				mmpProofStep.substitution = substitutionResult.substitution!;
		}
	}

	applyUnifierToProofStep(mmpProofStep: MmpProofStep) {

		// mmpProofStep.eHypUSteps.forEach((eHypUStep: MmpProofStep | undefined) => {
		// 	if (eHypUStep != undefined)
		// 		// eHypUStep is a UProofStep
		// 		isParseNodeChanged ||= this.applyUnifierToSingleNode(eHypUStep.parseNode, eHypUStep);
		// });
		if (mmpProofStep.parseNode != undefined) {
			const isParseNodeChanged = this.applyUnifierToSingleInternalNode(mmpProofStep.parseNode);
			if (isParseNodeChanged) {
				// the unifier changed at least a working var in the parse node
				this.invalidateParseNodeCache(mmpProofStep);
				// this.applyUnifierToSubstitution(mmpProofStep);
			}
		}
		this.rebuildSubstitution(mmpProofStep);

	}
	//#endregion applyUnifierToProofStep

	/**
	 * applies the unifier in every step of this.uProof;
	 * at the end of the method, this.uProof will have all working vars
	 * replaced by the given unifier
	 */
	applyUnifier() {
		this.uProof.mmpStatements.forEach((uStatement: IMmpStatement) => {
			if (uStatement instanceof MmpProofStep)
				this.applyUnifierToProofStep(uStatement);
		});
	}
	//#endregion applyUnifier
}