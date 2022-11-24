import { Grammar } from 'nearley';
import { BlockStatement } from '../mm/BlockStatement';
import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { AssertionStatement } from "../mm/AssertionStatement";
import { USubstitutionApplier } from './USubstitutionApplier';
import { OrderedPairOfNodes } from './WorkingVarsUnifierFinder';
import { MmpProofStep } from "./MmpProofStep";

/**
 * this class helps to initialize the Working Vars MGU Finder.
 * It takes a UProofStep, an assertion and a valid substitution for the logical vars to uProofStep's parse nodes
 * and returns a set of ordered pairs of nodes to be later unified by the MGU Finder
 */
export class WorkingVarsUnifierInitializer {
	uProofStep: MmpProofStep;
	assertion: AssertionStatement;
	substitution: Map<string, InternalNode>;
	outermostBlock: BlockStatement;
	grammar: Grammar;

	startingPairsForMGUFinder: OrderedPairOfNodes[] = [];

	constructor(uProofStep: MmpProofStep, assertion: AssertionStatement, substitution: Map<string, InternalNode>,
		outermostBlock: BlockStatement, grammar: Grammar) {
		this.uProofStep = uProofStep;
		this.assertion = assertion;
		this.substitution = substitution;
		this.outermostBlock = outermostBlock;
		this.grammar = grammar;
	}



	//#region buildStartingPairsForMGUAlgorithm

	//#region addStartingPairsForMGUAlgorithmForParseNode

	addStartingPairsForMGUFinderForParseNodeWithLogicalNodeSubstituted(uStepParseNode: ParseNode,
		newNodeWithSubstitution: ParseNode) {
		if (GrammarManager.isInternalParseNodeForWorkingVar(uStepParseNode)) {
			// uStepParseNode is a ParseNode for a Working Var
			// uStepParseNode AND logicalSystemFormulaParseNode are internal nodes; for the case uStepParseNode instanceof MmToken nothing has
			// to be done, because when we get here a substitution for logical vars has been found and then leaf nodes match successfully
			if (!GrammarManager.areParseNodesEqual(uStepParseNode, newNodeWithSubstitution)) {
				const orderedPairOfNodes: OrderedPairOfNodes = {
					parseNode1: <InternalNode>uStepParseNode,
					parseNode2: <InternalNode>newNodeWithSubstitution
				};
				this.startingPairsForMGUFinder.push(orderedPairOfNodes);
			}
		} else if (uStepParseNode instanceof InternalNode)
			// uStepParseNode AND logicalSystemFormulaParseNode are internal nodes;
			// for the case uStepParseNode instanceof MmToken nothing has to be done, because when we get here a substitution
			// for logical vars has been found and then leaf nodes match successfully
			for (let i = 0; i < uStepParseNode.parseNodes.length; i++) {
				// if ((<InternalNode>newNodeWithSubstitution).parseNodes[i] == undefined) {
				// 	const a = 3;
				// }
				this.addStartingPairsForMGUFinderForParseNodeWithLogicalNodeSubstituted(uStepParseNode.parseNodes[i],
					(<InternalNode>newNodeWithSubstitution).parseNodes[i]);
			}
	}
	// addStartingPairsForMGUAlgorithmForParseNode(uStepParseNode: InternalNode, logicalSystemFormulaParseNode: InternalNode) {
	// 	const newNodeWithSubstitution = USubstitutionApplier.createParseNode(logicalSystemFormulaParseNode,
	// 		this.substitution, this.outermostBlock);
	// 	this.addStartingPairsForMGUFinderForParseNodeWithLogicalNodeSubstituted(uStepParseNode, newNodeWithSubstitution);
	// }
	addStartingPairsForMGUAlgorithmForParseNode(uStepParseNode: InternalNode, logicalSystemFormulaParseNode: InternalNode) {
		const newNodeWithSubstitution: InternalNode =
			<InternalNode>USubstitutionApplier.createParseNode(logicalSystemFormulaParseNode,
				this.substitution, this.outermostBlock);
		if ((GrammarManager.containsWorkingVar(uStepParseNode) || GrammarManager.containsWorkingVar(newNodeWithSubstitution))
		&& !GrammarManager.areParseNodesEqual(newNodeWithSubstitution,uStepParseNode)) {
			// we add nodes to the unification algorithm, only if at least one of the two contains a working var and
			// they are not equal; the working algorithm would work anyway,
			// but we prefer to start it with fewer pairs to unify
			const orderedPairOfNodes: OrderedPairOfNodes = {
				parseNode1: newNodeWithSubstitution,
				parseNode2: uStepParseNode
			};
			this.startingPairsForMGUFinder.push(orderedPairOfNodes);
		}
	}
	//#endregion addStartingPairsForMGUAlgorithmForParseNode

	addStartingPairsForMGUAlgorithmForEHyps() {
		for (let i = 0; i < this.uProofStep.eHypUSteps.length; i++) {
			if (this.uProofStep.eHypUSteps[i] != undefined && this.uProofStep.eHypUSteps[i]?.parseNode != undefined)
				this.addStartingPairsForMGUAlgorithmForParseNode(<InternalNode>this.uProofStep.eHypUSteps[i]?.parseNode,
					<InternalNode>this.assertion.frame?.eHyps[i].parseNode);
		}
	}
	/** builds the starting pairs for the MGU algorithm, for the MmpProofStep given to the constructor  */
	buildStartingPairsForMGUAlgorithm(): OrderedPairOfNodes[] {
		this.addStartingPairsForMGUAlgorithmForEHyps();
		if (this.uProofStep.parseNode != undefined)
			this.addStartingPairsForMGUAlgorithmForParseNode(this.uProofStep.parseNode, this.assertion.parseNode);
		return this.startingPairsForMGUFinder;
	}
	//#endregion buildStartingPairsForMGUAlgorithm

}