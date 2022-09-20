import { Grammar } from 'nearley';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmToken } from '../grammar/MmLexer';
import { InternalNode } from '../grammar/ParseNode';
import { LabeledStatement, AssertionStatement } from '../mm/Statements';
import { UProof } from '../mmp/UProof';
import { IUStatement, UProofStatementStep } from '../mmp/UStatement';
import { concatTokenValuesWithSpaces } from '../mm/Utils';
import { BlockStatement } from '../mm/BlockStatement';
import { ILabeledStatementSignature } from '../mmt/MmtParser';
import { Range } from 'vscode-languageserver';
// import { MmpProofStep } from './MmpStatements';

/**
 * UProofStep's are used by the unifier. They are "similar" to the MmpProofStep's, but they don't
 * use MmToken's because the unifier doesn't care about the Range of each symbol.
 */
export class UProofStep implements IUStatement, ILabeledStatementSignature {
	uProof: UProof;

	//the first token is not parsable if, for instance, it contains 3 or more colons
	isFirstTokenParsable: boolean;
	isEHyp: boolean;
	stepRef: string;
	eHypUSteps: (UProofStep | undefined)[];
	eHypRefs?: MmToken[];
	stepLabelToken?: MmToken;
	// eHypRefsRanges: Range[]
	stepLabel?: string
	// stepLabelRange: Range
	stepFormula?: MmToken[]
	parseNode?: InternalNode   // contains the ParseNode for the fomula, iff the formula nonempty and it is parsable

	skipUnification: boolean;  // when set to true, the unification process is not even tried out on this step

	/** the indentation level for a tree like display of the proof */
	indentationLevel: number | undefined

	/** this is optional just to allow MmpProofStep not to assign a UProof; but th UProof object will always
	 * assign itself in the constructor: thus, the unification / trasformation process can consider this to be
	 * an actual UProof
	 */


	/**
	 * when defined, it contains a map from the mandatory variables of the logical assertion, to the actual
	 * parse nodes in the proof
	*/
	substitution: Map<string, InternalNode> | undefined;

	//TODO handle the case it is proven, but with working vars
	/** 
	 * false by default, it will be assigned true only if the UProofStep is completely proven.
	 * isProven will be set to true even if working vars are still present in the proof
	*/
	private _isProven: boolean;


	public get isProven(): boolean {
		const isProven = (this.isEHyp && this.stepLabel != undefined) || this._isProven;
		return isProven;
	}

	private _assertion: AssertionStatement | undefined;

	public get assertion(): AssertionStatement | undefined {
		if (this._assertion == undefined) {
			const labelToStatementMap = this.uProof!.outermostBlock.mmParser!.labelToStatementMap;
			// const statement: LabeledStatement | undefined = labelToStatementMap.get()
			let statement: LabeledStatement | undefined = undefined;
			if (this.stepLabel != undefined) {
				statement = labelToStatementMap.get(this.stepLabel);
			}
			if (statement instanceof AssertionStatement)
				this._assertion = statement;
		}
		return this._assertion;
	}




	// mmpTokenizer: MmpTokenizer
	// indexOfFirstToken: number
	// indexOfLastToken: number
	constructor(uProof: UProof, isFirstTokenParsable: boolean, isEHyp: boolean, stepRef: string,
		eHypUSteps: (UProofStep | undefined)[],
		// we keep eHypRefs in UProof because if there is a ref to a non existent proof step,
		// we've decided to leave the ref unchanged
		eHypRefs?: MmToken[],
		// stepLabel?: string,
		stepLabelToken?: MmToken,
		stepFormula?: MmToken[],
		parseNode?: InternalNode
	) {
		this.uProof = uProof;
		this.isEHyp = isEHyp;
		this.isFirstTokenParsable = isFirstTokenParsable;
		this.stepRef = stepRef;
		this.eHypUSteps = eHypUSteps;
		this.eHypRefs = eHypRefs;
		// this.stepLabel = stepLabel;
		this.stepLabel = stepLabelToken?.value;
		this.stepFormula = stepFormula;
		this.parseNode = parseNode;

		this._isProven = false;
		this.skipUnification = false;
	}
	get label(): MmToken | undefined {
		// let result: MmToken | undefined;
		// if (this instanceof MmpProofStep)
		// 	result = this.stepLabelToken;
		// return result;
		return this.stepLabelToken;
	}
	get formula(): MmToken[] | undefined {
		return this.stepFormula;
	}

	//QUI!!! see if it's needed and in the case, implement it
	// needed to implement ILabeledStatementSignature
	rangeIfBothLabelAndFormulaAreEmpty?: Range | undefined;

	// getAssertion(labelToStatementMap: Map<string, LabeledStatement>): AssertionStatement | undefined {
	// 	let statement: LabeledStatement | undefined = undefined;
	// 	if (this.stepLabel != undefined) {
	// 		statement = labelToStatementMap.get(this.stepLabel);

	// 	}
	// 	let assertion: AssertionStatement | undefined = undefined;
	// 	if (statement instanceof AssertionStatement)
	// 		assertion = statement;
	// 	return assertion;
	// }

	//#region toText

	//#region textForFirstTokenInfo

	//#region textForEHypRefs
	/** if the current EHyp is undefined, but there was a ref, we leave the original ref unchanged */
	textForEHypRef(eHypIndex: number): string {
		let text = '';
		if (this.eHypUSteps[eHypIndex] != undefined && this.eHypUSteps[eHypIndex]!.stepRef != undefined)
			text = this.eHypUSteps[eHypIndex]!.stepRef;
		else if (this.eHypRefs != undefined && this.eHypRefs[eHypIndex] != undefined)
			text = this.eHypRefs[eHypIndex].value;
		return text;
	}
	textForEHypRefs() {
		let result = "";
		if (this.eHypUSteps.length > 0)
			// result = (this.eHypUSteps[0]?.stepRef === undefined ? '' : this.eHypUSteps[0]?.stepRef);
			result = this.textForEHypRef(0);
		for (let i = 1; i < this.eHypUSteps.length; i++) {
			// const newRef: string = (this.eHypUSteps[i]!.stepRef === undefined ? '' : this.eHypUSteps[i]!.stepRef!);
			const newRef: string = this.textForEHypRef(i);
			result += "," + newRef;
		}
		return result;
	}
	//#endregion textForEHypRefs

	textForFirstTokenInfo() {
		const textForEHyp: string = (this.isEHyp ? "h" : "");
		const textForEHypRefs = this.textForEHypRefs();
		const textForStepLabel = (this.stepLabel === undefined ? '' : this.stepLabel!);
		const result: string = textForEHyp + this.stepRef + ":" + textForEHypRefs + ":" + textForStepLabel;
		return result;
	}
	//#endregion textForFirstTokenInfo

	/**
	 * Returns the full text of the UProofStep
	 * @returns
	 */
	toText() {
		const textForFirstTokenInfo = this.textForFirstTokenInfo();
		let textForFormula = "";
		if (this.parseNode != undefined)
			textForFormula = GrammarManager.buildStringFormula(this.parseNode!);
		else
			// this.parseNode == undefined
			if (this.stepFormula != undefined)
				// this.parseNode == undefined && this.stepFormula != undefined
				textForFormula = concatTokenValuesWithSpaces(this.stepFormula!);
		const text: string = textForFirstTokenInfo + " " + textForFormula;
		return text;
	}
	//#endregion toText

	/**
	 * call this method if this UProofStep is completeley proven
	 */
	setIsProven() {
		this._isProven = true;
	}


	//#region proofArray

	//#region proofArrayForFStatements
	getMandatoryVarsInRPNorder(outermostBlock: BlockStatement): string[] {
		const vars: Set<string> = new Set<string>(this.substitution!.keys());
		const mandatoryVarsInRPNorder: string[] = outermostBlock.getVariablesInRPNorder(vars);
		return mandatoryVarsInRPNorder;
	}
	proofArrayForFStatements(outermostBlock: BlockStatement): UProofStatementStep[] {
		const proofArray: UProofStatementStep[] = [];
		const mandatoryVarsInRPNorder: string[] = this.getMandatoryVarsInRPNorder(outermostBlock);
		// for (const logicalVar of this.substitution!.keys()) {
		// mandatoryVarsInRPNorder.forEach((logicalVar: string) => {
		// 	const substitution: InternalNode = <InternalNode>this.substitution?.get(logicalVar);
		// 	const proofArrayForSubstitution: UProofStatementStep[] = substitution.proofArray();
		// 	proofArray.push(...proofArrayForSubstitution);
		// });
		for (let i = mandatoryVarsInRPNorder.length - 1; 0 <= i; i--) {
			const logicalVar: string = mandatoryVarsInRPNorder[i];
			const logicalVarSubstitutionNode: InternalNode = <InternalNode>this.substitution?.get(logicalVar);
			const proofArrayForSubstitution: UProofStatementStep[] = logicalVarSubstitutionNode.proofArray(
				outermostBlock, <Grammar>outermostBlock.grammar);
			proofArray.unshift(...proofArrayForSubstitution);
		}
		return proofArray;
	}
	//#endregion proofArrayForFStatements

	/**
	 * returns a proof for the current step (undefined if there is no proof, yet).
	 * It assumes that every UProofStep has already been checked for unification
	 * and this.isProven has been assigned and this.substitution has been assigned.
	 * @proofArrayForFStatements is used to compute the RPN order of the mandatory F Hyps
	 * 
	 */
	proofArray(outermostBlock: BlockStatement): UProofStatementStep[] | undefined {
		let proof: UProofStatementStep[] | undefined;
		const currentUProofStatementStep: UProofStatementStep =
			{ label: this.stepLabel!, parseNode: this.parseNode! };
		if (this.isEHyp)
			proof = [currentUProofStatementStep];
		else if (this.isProven) {
			// the proof of this step is complete
			// proof = [];
			// proof = this.proofArrayForFStatements(outermostBlock);
			// this.eHypUSteps.forEach((eHypUStep: UProofStep | undefined) => {
			// 	const proofForEHypUStep: UProofStatementStep[] =
			// 		<UProofStatementStep[]>eHypUStep?.proofArray(outermostBlock);
			// 	proof?.push(...proofForEHypUStep);
			// });
			// proof?.push(currentUProofStatementStep);
			proof = [];
			proof.unshift(currentUProofStatementStep);
			for (let i = this.eHypUSteps.length - 1; 0 <= i; i--) {
				const eHypUStep: UProofStep = <UProofStep>this.eHypUSteps[i];
				const proofForEHypUStep: UProofStatementStep[] =
					<UProofStatementStep[]>eHypUStep?.proofArray(outermostBlock);
				proof?.unshift(...proofForEHypUStep);
			}
			const proofArrayForFStatements = this.proofArrayForFStatements(outermostBlock);
			proof.unshift(...proofArrayForFStatements);
		}
		return proof;
	}
	//#endregion proofArray
}