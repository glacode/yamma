import { Position } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { MmToken } from '../grammar/MmLexer';
import { InternalNode, ParseNode } from '../grammar/ParseNode';
import { MmpProof } from './MmpProof';

import { IMmpStatementWithRange, UProofStatementStep } from './MmpStatement';
import { concatTokenValuesWithSeparator, concatTokenValuesWithSpaces } from '../mm/Utils';
import { ProofStepFirstTokenInfo } from './MmpStatements';
import { GrammarManager } from '../grammar/GrammarManager';
import { BlockStatement } from '../mm/BlockStatement';
import { Grammar } from 'nearley';
import { ILabeledStatementSignature } from '../mmt/MmtParser';
import { LabeledStatement } from "../mm/LabeledStatement";
import { AssertionStatement } from "../mm/AssertionStatement";


export class MmpProofStep implements IMmpStatementWithRange, ILabeledStatementSignature {
	uProof: MmpProof;

	//the first token is not parsable if, for instance, it contains 3 or more colons
	isFirstTokenParsable: boolean;
	isEHyp: boolean;
	stepRef: string;
	eHypUSteps: (MmpProofStep | undefined)[];
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

	/** call this method if this UProofStep is completeley proven */
	setIsProven() {
		this._isProven = true;
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

	private _hasWorkingVars?: boolean;

	//#region hasWorkingVars

	//#region setHasWorkingVars
	setHasWorkingVarsRecursive(parseNode: InternalNode) {
		if (GrammarManager.isInternalParseNodeForWorkingVar(parseNode))
			this._hasWorkingVars = true;
		else {
			let i = 0;
			while (!this._hasWorkingVars && i++ < parseNode.parseNodes.length) {
				const childNode: ParseNode = parseNode.parseNodes[i];
				if (childNode instanceof InternalNode)
					this.setHasWorkingVarsRecursive(childNode);
			}
		}
	}
	private setHasWorkingVars(): void {
		this._hasWorkingVars = false;
		if (this.parseNode != undefined)
			this.setHasWorkingVarsRecursive(this.parseNode);
	}
	//#endregion setHasWorkingVars

	public get hasWorkingVars(): boolean {
		if (this._hasWorkingVars == undefined)
			this.setHasWorkingVars();
		return this._hasWorkingVars!;
	}
	//#endregion hasWorkingVars

	firstTokenInfo: ProofStepFirstTokenInfo;
	// isEHyp: boolean;
	stepRefToken: MmToken;
	// eHypRefs?: MmToken[]
	// eHypRefsRanges: Range[]
	// stepLabelToken?: MmToken;
	// stepLabelRange: Range
	// stepFormula?: MmToken[]
	// parseNode?: InternalNode   // contains the ParseNode for the fomula, iff the formula nonempty and it is parsable
	// mmpTokenizer: MmpTokenizer
	// indexOfFirstToken: number
	// indexOfLastToken: number
	constructor(uProof: MmpProof,
		firstTokenInfo: ProofStepFirstTokenInfo,
		isFirstTokenParsable: boolean, isEHyp: boolean, stepRefToken: MmToken, eHypRefs?: MmToken[],
		eHypMmpSteps?: (MmpProofStep | undefined)[],
		// eHypRefsRanges: Range[],
		stepLabelToken?: MmToken,
		// stepLabelRange: Range,
		stepFormula?: MmToken[],
		// mmpTokenizer: MmpTokenizer, indexOfFirstToken: number, indexOfLastToken: number
		formulaParseNode?: InternalNode
	) {
		//TODO most of this properties are a duplication of UProofStep properties, try to remove them
		const actualEHypMmpSteps: (MmpProofStep | undefined)[] = (eHypMmpSteps == undefined ? [] : eHypMmpSteps);
		// super(uProof, isFirstTokenParsable, isEHyp, stepRefToken?.value, actualEHypMmpSteps,
		// 	eHypRefs, stepLabelToken, stepFormula, formulaParseNode);
		this.uProof = uProof;
		this.isEHyp = isEHyp;
		this.isFirstTokenParsable = isFirstTokenParsable;
		this.stepRef = stepRefToken?.value;
		this.eHypUSteps = actualEHypMmpSteps;
		this.eHypRefs = eHypRefs;
		// this.stepLabel = stepLabel;
		this.stepLabel = stepLabelToken?.value;
		this.stepFormula = stepFormula;
		this.parseNode = formulaParseNode;

		this._isProven = false;
		this.skipUnification = false;
		this.firstTokenInfo = firstTokenInfo;
		// this.isEHyp = isEHyp;
		this.stepRefToken = stepRefToken;
		this.stepRef = stepRefToken.value;
		// this.eHypRefs = eHypRefs;
		// this.stepLabel = stepLabelToken?.value;
		this.stepLabelToken = stepLabelToken;
		// this.stepFormula = stepFormula;
		// this.parseNode = formulaParseNode;
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

	//TODO now that you are also passing firstTokenInfo, you can also use firstTokenInfo.firstToken.range.start	
	public get startPosition() {
		let start: Position = { line: 0, character: 0 };
		if (this.stepRefToken != undefined)
			start = this.stepRefToken.range.start;
		else if (this.eHypRefs != undefined && this.eHypRefs.length > 0)
			start = this.eHypRefs[0].range.start;
		else if (this.stepLabelToken != undefined)
			start = this.stepLabelToken.range.start;
		else if (this.stepFormula != undefined)
			start = this.stepFormula[0].range.start;
		return start;
	}

	public get endPosition() {
		let end: Position = { line: 0, character: 0 };
		if (this.stepFormula != undefined && this.stepFormula.length > 0)
			end = this.stepFormula[this.stepFormula.length - 1].range.end;











		// else if (this.stepLabelToken != undefined)
		// 	end = this.stepLabelToken.range.end;
		// else if (this.eHypRefs != undefined && this.eHypRefs.length > 0)
		// 	end = this.eHypRefs[this.eHypRefs.length - 1].range.end;
		// else if (this.stepRefToken != undefined) {
		// 	end = this.stepRefToken.range.end;
		// 	if (this.stepRefToken.value == '')
		// 		// there should be just a ':' on the line
		// 		end.character += 2;
		// }
		else
			end = this.firstTokenInfo.firstToken.range.end;
		return end;
	}

	/**
	 * returns the range of the whole proof step
	 */
	public get range() {
		const start: Position = this.startPosition;
		const end: Position = this.endPosition;
		const range: Range = {
			start: start,
			end: end
		};
		return range;
	}

	//#region eHypRefsRange
	public get eHypRefsRange(): Range | undefined {
		let range: Range | undefined;
		let startCharacter: number | undefined;
		let endCharacter: number | undefined;
		if (this.stepRefToken != undefined && this.stepLabelToken != undefined) {
			startCharacter = this.stepRefToken.range.end.character + 1;
			endCharacter = this.stepLabelToken.range.start.character - 1;
		} else if (this.stepRefToken != undefined && this.stepLabel == undefined) {
			startCharacter = this.stepRefToken.range.end.character + 1;
			endCharacter = startCharacter + 1;
		} else if (this.stepRefToken == undefined && this.stepLabelToken != undefined) {
			startCharacter = this.stepLabelToken.range.start.character - 1;
			endCharacter = startCharacter + 1;
		}
		if (startCharacter != undefined) {
			const start: Position = { line: this.range.start.line, character: startCharacter };
			const end: Position = { line: this.range.start.line, character: <number>endCharacter };
			range = { start: start, end: end };
		}
		return range;
	}
	//#endregion eHypRefsRange
	public get firstTokenInfoToString(): string {
		let result = "";
		if (this.stepRefToken != undefined)
			result += this.stepRefToken.value;
		result += ":";
		if (this.eHypRefs != undefined)
			result += concatTokenValuesWithSeparator(this.eHypRefs, ',');
		result += ":";
		if (this.stepLabelToken != undefined)
			result += this.stepLabelToken.value;
		return result;
	}
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
				const eHypUStep: MmpProofStep = <MmpProofStep>this.eHypUSteps[i];
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
