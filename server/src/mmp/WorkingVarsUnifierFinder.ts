import { GrammarManager } from '../grammar/GrammarManager';
import { InternalNode, ParseNode } from '../grammar/ParseNode';


/**
 * the input of the MGU algorithm is a vector of these pairs
 */
export type OrderedPairOfNodes = {
	parseNode1: InternalNode,
	parseNode2: InternalNode
}

export enum UnificationAlgorithmState {
	// the algorithm needs at least another cycle
	running = "running",
	// two constants don't match
	clashFailure = "clashFailure",
	// a working var should be replaced with a ParseNode containing it
	occourCheckFailure = "occourCheckFailure",
	// the unification was successfully computed
	complete = "complete"
}

/**
 * Implements the Martelli Montanari algorithm, to find
 * the Most General Unifier (if it exists) for the Working Vars in a UProof;
 * 
 * Here is a list of the 6 rules, referred in the code:
 * 1. f(s1,...,sn) ~ f(t1,...,tn)                   action: replace by s1=t1,...,sn=tn
 * 2. f(s1,...,sn) ~ g(t1,...,tm)  where f != g     action: halt with "clash" failure (this case will never happen,
 *                                                          because we get here, only when we've found a valid substitution)
 * 3. x ~ x                                         action: delete the pair
 * 4. t ~ x   where t is not a variable             action: replace by x ~ t
 * 5. x ~ t   where x does not occour in t and      action: peform substitution { x / t } on all other pairs
 *                  x occours in some other pair
 * 6. x ~ t   where x is occurs in t and x != t     action: halt with "occur check" failure
 */
export class WorkingVarsUnifierFinder {

	currentState: UnificationAlgorithmState | undefined;
	
	/**
	 * when the unification is succesfully completed, this substitutionResult will contain
	 * a Most General Unifier for Working Vars
	 */
	mostGeneralUnifierResult: Map<string, InternalNode>;
	
	/**if the MGU algorith ends in error, this will contain the pair of nodes that gave the occur check error;
	 * the first node is a node for a working var
	 */
	occourCheckOrderedPair: OrderedPairOfNodes | undefined;

	/** if the MGU algorith ends in clash failure error, this will contain the pair of nodes that gave the clash failure error;
	* the first node is a node for a working var
	*/
	clashFailureOrderedPair: OrderedPairOfNodes | undefined;


	// private uProof: UProof;
	// private labelToStatementMap: Map<string, LabeledStatement>;

	private currentOrderedPairsOfNodes: OrderedPairOfNodes[];
	private workingVarsForWhichRule5hasAlreadyBeenApplied: Set<string> = new Set<string>();

	// alreadyReplacedWorkingVars: Set<string>;

	constructor(startingOrderedPairsOfNodes: OrderedPairOfNodes[], private logicalVariables: Set<string>) {
		this.currentOrderedPairsOfNodes = startingOrderedPairsOfNodes;

		this.mostGeneralUnifierResult = new Map<string, InternalNode>();
		// this.alreadyReplacedWorkingVars = new Set<string>();
	}

	//#region findMostGeneralUnifier

	//#region runACycle

	//#region tryToPerformAnActionForCurrentPair

	private isInternalNodeForVariable(parseNode: InternalNode): boolean {
		const result: boolean = GrammarManager.isInternalParseNodeForWorkingVar(parseNode) ||
			GrammarManager.isInternalParseNodeForFHyp(parseNode, this.logicalVariables);
		return result;
	}

	//#region applyRule1
	buildOrderedPairsForChildren(node1: InternalNode, node2: InternalNode): OrderedPairOfNodes[] {
		const orderedPairsForChildren: OrderedPairOfNodes[] = [];
		for (let i = 0; i < node1.parseNodes.length; i++) {
			// this class is invoked when a valid substitution has been found, thus
			// MmToken nodes are guaranted do match and need not be checked here
			if (node1.parseNodes[i] instanceof InternalNode) {
				const orderedPair: OrderedPairOfNodes = {
					parseNode1: <InternalNode>node1.parseNodes[i],
					parseNode2: <InternalNode>node2.parseNodes[i]
				};
				orderedPairsForChildren.push(orderedPair);
			}
		}
		return orderedPairsForChildren;
	}
	protected applyRule1(i: number, node1: InternalNode, node2: InternalNode) {
		// here node1 and node2 are not parse nodes for working vars
		const orderedPairsForChildren: OrderedPairOfNodes[] = this.buildOrderedPairsForChildren(node1, node2);
		this.currentOrderedPairsOfNodes.splice(i, 1, ...orderedPairsForChildren);
	}
	//#endregion applyRule1

	//#region  applyRule5
	protected replaceNodeInDescendants(workingVarToBeReplaced: string, replacingNode: InternalNode,
		nodeToBeReplaced: InternalNode) {
		for (let i = 0; i < nodeToBeReplaced.parseNodes.length; i++) {
			const descendant: ParseNode = nodeToBeReplaced.parseNodes[i];
			if (GrammarManager.isInternalParseNodeForWorkingVar(descendant) &&
				GrammarManager.getTokenValueFromInternalNode(<InternalNode>descendant) == workingVarToBeReplaced)
				nodeToBeReplaced.parseNodes.splice(i, 1, replacingNode);
			else if (descendant instanceof InternalNode)
				this.replaceNodeInDescendants(workingVarToBeReplaced, replacingNode, descendant);
		}
	}
	applyRule5(i: number, node1: InternalNode, node2: InternalNode) {
		const workingVarToBeReplaced = GrammarManager.getTokenValueFromInternalNode(node1);
		for (let j = 0; j < this.currentOrderedPairsOfNodes.length; j++) {
			if (j != i)
				this.replaceNodeInDescendants(workingVarToBeReplaced, node2, this.currentOrderedPairsOfNodes[j].parseNode1);
			this.replaceNodeInDescendants(workingVarToBeReplaced, node2, this.currentOrderedPairsOfNodes[j].parseNode2);
		}
		this.workingVarsForWhichRule5hasAlreadyBeenApplied.add(workingVarToBeReplaced);
	}
	//#endregion applyRule5

	tryToPerformAnActionForCurrentPair(i: number): boolean {
		const orderedPair = this.currentOrderedPairsOfNodes[i];
		const parseNode1: InternalNode = orderedPair.parseNode1;
		const parseNode2: InternalNode = orderedPair.parseNode2;

		const isParseNode1WorkingVar = this.isInternalNodeForVariable(parseNode1);
		// const isParseNode2WorkingVar = GrammarManager.isInternalParseNodeForWorkingVar(parseNode2);
		const isParseNode2WorkingVar = this.isInternalNodeForVariable(parseNode2);

		let hasBeenPerformedOneAction = false;

		if (!isParseNode1WorkingVar && !isParseNode2WorkingVar && parseNode1.label == parseNode2.label) {
			// rule 1
			this.applyRule1(i, parseNode1, parseNode2);
			hasBeenPerformedOneAction = true;
		} else if (!isParseNode1WorkingVar && !isParseNode2WorkingVar && parseNode1.label != parseNode2.label) {
			// rule 2
			this.currentState = UnificationAlgorithmState.clashFailure;
			this.clashFailureOrderedPair = { parseNode1: parseNode1, parseNode2: parseNode2 };
			hasBeenPerformedOneAction = true;
		}
		else if (GrammarManager.areParseNodesEqual(parseNode1, parseNode2)) {
			// rule 3
			this.currentOrderedPairsOfNodes.splice(i, 1);
			hasBeenPerformedOneAction = true;
		} else if (!(isParseNode1WorkingVar) && isParseNode2WorkingVar) {
			// rule 4
			this.currentOrderedPairsOfNodes[i].parseNode1 = parseNode2;
			this.currentOrderedPairsOfNodes[i].parseNode2 = parseNode1;
			hasBeenPerformedOneAction = true;
		} else if (isParseNode1WorkingVar &&
			this.workingVarsForWhichRule5hasAlreadyBeenApplied.has(GrammarManager.getTokenValueFromInternalNode(parseNode1)) &&
			// this.mostGeneralUnifierResult.get(GrammarManager.getWorkingVarFromInternalNode(parseNode1)) == undefined &&
			// !this.alreadyReplacedWorkingVars.has(GrammarManager.getWorkingVarFromInternalNode(parseNode1)) &&
			!(<InternalNode>parseNode2).containsTokenValue(GrammarManager.getTokenValueFromInternalNode(parseNode1))) {
			//rule 5
			this.applyRule5(i, parseNode1, parseNode2);
			hasBeenPerformedOneAction = true;
		}
		else if (isParseNode1WorkingVar &&
			this.mostGeneralUnifierResult.get(GrammarManager.getTokenValueFromInternalNode(parseNode1)) == undefined
			&& (<InternalNode>parseNode2).containsTokenValue(GrammarManager.getTokenValueFromInternalNode(parseNode1))) {
			// rule 6  (the second AND condition above has been added for performance only)
			this.currentState = UnificationAlgorithmState.occourCheckFailure;
			this.occourCheckOrderedPair = { parseNode1: parseNode1, parseNode2: parseNode2 };
			hasBeenPerformedOneAction = true;
		}
		// else
		// 	// no action has been performed
		// 	this.currentState = UnificationAlgorithmState.complete;
		return hasBeenPerformedOneAction;
	}
	//#endregion tryToPerformAnActionForCurrentPair

	runUnificationCycles() {
		this.currentState = UnificationAlgorithmState.running;
		let i = 0;
		// let hasBeenPerformedOneAction = true;
		while (i < this.currentOrderedPairsOfNodes.length && this.currentState == UnificationAlgorithmState.running) {
			const hasBeenPerformedOneAction = this.tryToPerformAnActionForCurrentPair(i);
			if (hasBeenPerformedOneAction)
				i = 0;
			else
				i++;
		}
		// if (!hasBeenPerformedOneAction)
		if (this.currentState == UnificationAlgorithmState.running)
			// no action has been performed in the last cycle
			this.currentState = UnificationAlgorithmState.complete;
	}
	//#endregion runACycle

	/**
	 * 
	 * @returns the most general unifier for the UProof
	 */
	findMostGeneralUnifier(): Map<string, InternalNode> | undefined {
		let result: Map<string, InternalNode> | undefined;
		// if (this.currentOrderedPairsOfNodes.length > 0)
		// there is something to try to unify
		// this.currentState = UnificationAlgorithmState.running;
		// else
		// 	this.currentState = UnificationAlgorithmState.complete;
		// while (this.currentState == UnificationAlgorithmState.running)
		this.runUnificationCycles();
		if (this.currentState == UnificationAlgorithmState.complete) {
			// the Most General Unifier has been succesfully found
			this.currentOrderedPairsOfNodes.forEach((orderedPair: OrderedPairOfNodes) => {
				const workingVar: string = GrammarManager.getTokenValueFromInternalNode(orderedPair.parseNode1);
				const substitution: InternalNode = orderedPair.parseNode2;
				this.mostGeneralUnifierResult.set(workingVar, substitution);
			});
			result = this.mostGeneralUnifierResult;
		}
		return result;
	}
	//#endregion findMostGeneralUnifier

	public static buildErrorMessageForOccourCheckOrderedPair(occourCheckOrderedPair: OrderedPairOfNodes): string {
		const workingVar: string = GrammarManager.getTokenValueFromInternalNode(occourCheckOrderedPair.parseNode1);
		const strParseNode2: string = GrammarManager.buildStringFormula(occourCheckOrderedPair.parseNode2);
		const errorMessage: string = `Working Var unification error: the  working var ${workingVar} should be ` +
			`replaced with the following subformula, containing itself ${strParseNode2}`;
		return errorMessage;
	}

}