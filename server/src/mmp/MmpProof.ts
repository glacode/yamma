
import { BlockStatement } from '../mm/BlockStatement';
import { DisjointVarMap } from '../mm/DisjointVarMap';
import { MmToken } from '../grammar/MmLexer';
import { ProofStepFirstTokenInfo } from './MmpStatements';
import { MmpProofStep } from "./MmpProofStep";
import { MmpDisjVarStatement } from "./MmpDisjVarStatement";
import { IMmpStatement, MmpComment, TextForProofStatement } from './MmpStatement';
import { MmpTheoremLabel } from "./MmpTheoremLabel";
import { WorkingVars } from './WorkingVars';
import { MmpProofFormatter } from './MmpProofFormatter';
import { ITheoremSignature } from '../mmt/MmtParser';
import { MmpAllowDiscouraged } from './MmpAllowDiscouraged';

export class MmpProof implements ITheoremSignature {
	outermostBlock: BlockStatement;
	workingVars: WorkingVars;
	maxRefAlreadyAssigned = 0;

	mmpStatements: IMmpStatement[];
	mmpTheoremLabels: MmpTheoremLabel[] = [];

	public allowDiscouragedStatement = false;  // it will be true iff the proof contains $allowdiscouraged
	// it is not used for now, but it could be, in the future

	private _mandatoryHypLabels?: Set<string>;

	/** the theorem label is expected to be the first statement */
	public get theoremLabel(): MmToken | undefined {
		let theoremLabel: MmToken | undefined;
		if (this.mmpStatements[0] instanceof MmpTheoremLabel && this.mmpStatements[0].theoremLabel != undefined)
			// the first statement is a theorem label statement and the theoremLabel is actually specified
			theoremLabel = this.mmpStatements[0].theoremLabel;
		return theoremLabel;
	}

	public mainComment?: MmpComment;

	/**
	 * The main comment is expected to be the second statement, just after
	 * the theorem label statement
	 */
	// public get mainComment(): MmpComment | undefined {
	// 	let uComment: MmpComment | undefined;
	// 	if (this.mmpStatements[0] instanceof MmpTheoremLabel && this.mmpStatements[1] instanceof MmpComment)
	// 		// the first statement is a theorem label statement and the second statement is a comment;
	// 		// this is the expected state with no diagnostics
	// 		uComment = this.mmpStatements[1];
	// 	else if (this.mmpStatements[0] instanceof MmpComment)
	// 		// the theorem label statement is missing; this will rise a Diagnostic, but if
	// 		// the first statement is comment, we return it as the main comment
	// 		uComment = this.mmpStatements[0];
	// 	return uComment;
	// }


	/** if the qed step is proven, proofStatement will contain the proof statement */
	proofStatement: IMmpStatement | undefined;

	//TODO1 NOV 10 2023 add a test fot this getter
	/** true iff the proof is complete (a proof statement has been generated) */
	public get isProofComplete(): boolean {
		const result: boolean = this.proofStatement != undefined;
		return result;
	}

	// lastMmpProofStep is introduced for better performance, only
	/**the last MmpProofStep in the array of uStatements*/
	lastMmpProofStep: MmpProofStep | undefined;

	/** the (compressed or normal) proof text */
	textProofStatement?: TextForProofStatement;


	/**contains an efficient (for search) representation of the Disjoint Vars Statement defined. It's introduced for performance only */
	// private _disjVars: Map<string, Set<string>>;
	disjVars: DisjointVarMap;

	eHyps: MmpProofStep[];

	/** the array of defined disjoint var constraints */
	disjVarMmpStatements: MmpDisjVarStatement[]

	// needed to implement ITheoremSignature
	get pStatement(): MmpProofStep | undefined {
		let pStat: MmpProofStep | undefined;
		if (this.lastMmpProofStep?.stepRef == "qed")
			pStat = this.lastMmpProofStep;
		return pStat;
	}

	/** maps a (normalized) formula to the index of its MmpProofStep
	 * (its first occourence)
	*/
	formulaToProofStepMap: Map<string, number>;

	/** the number of steps added by the unification; this is added to
	 * this.formulaToProofStepMap to find the real step index
	 */
	private statementsInsertedAtASpecificIndexSoFar = 0;

	constructor(outermostBlock: BlockStatement, workingVars: WorkingVars,
		private startIndexForNewRefs?: number) {
		this.outermostBlock = outermostBlock;
		this.workingVars = workingVars;
		if (startIndexForNewRefs != undefined)
			this.maxRefAlreadyAssigned = startIndexForNewRefs - 1;
		this.mmpStatements = [];

		// this._disjVars = new Map<string, Set<string>>();
		this.disjVars = new DisjointVarMap();
		this.eHyps = [];
		this.disjVarMmpStatements = [];
		this.formulaToProofStepMap = new Map<string, number>();
	}

	private reset() {
		this.maxRefAlreadyAssigned = 0;
		if (this.startIndexForNewRefs != undefined)
			this.maxRefAlreadyAssigned = this.startIndexForNewRefs - 1;
		this.mmpStatements = [];

		// this._disjVars = new Map<string, Set<string>>();
		this.disjVars = new DisjointVarMap();
		this.eHyps = [];
		this.disjVarMmpStatements = [];
		this.formulaToProofStepMap = new Map<string, number>();
	}


	/** the set of the mandatory vars for this UProof */
	get mandatoryVars(): Set<string> {
		const result: Set<string> = new Set<string>();
		this.mmpStatements.forEach((uStatement: IMmpStatement) => {
			if (uStatement instanceof MmpProofStep && (uStatement.isEHyp || uStatement.stepRef == "qed")
				&& uStatement.parseNode != undefined) {
				const mandatoryVarsForThisStatement: Set<string> =
					uStatement.parseNode!.symbolsSubsetOf(this.outermostBlock.v);
				mandatoryVarsForThisStatement.forEach((mandatoryVar: string) => {
					if (!result.has(mandatoryVar))
						result.add(mandatoryVar);
				});
			}
		});
		return result;
	}

	//#region disjVarUStatements

	// compare(disjVar1: DisjVarUStatement, disjVar2: DisjVarUStatement): number {
	// 	let result: number;
	// 	if (disjVar1.var1 < disjVar2.var1 || (disjVar1.var1 == disjVar2.var2 && disjVar1.var1 < disjVar2.var2))
	// 		// disjVar1 preceeds disjvar2
	// 		result = 1;
	// 	else if (disjVar1.var1 == disjVar2.var1 && disjVar1.var2 == disjVar2.var2)
	// 		// disjVar1 and disjVar2 are equal
	// 		result = 0;
	// 	else
	// 		// disjVar2 preceeds disjvar1
	// 		result = -1;
	// 	return result;
	// }

	// /** the array of DisjVarUStatement defined in this UProof */
	// get disjVarUStatements(): DisjVarUStatement[] {
	// 	const result: DisjVarUStatement[] = [];
	// 	this.uStatements.forEach((uStatement: IUStatement) => {
	// 		if (uStatement instanceof DisjVarUStatement)
	// 			result.push(uStatement);
	// 	});
	// 	result.sort(this.compare);
	// 	return result;
	// }
	//#endregion disjVarUStatements

	//#region createUProofFromMmpProof

	//#region addMmpStep

	//#region getRef
	updateMaxRefIfItsTheCase(stepRef: string) {
		if (stepRef.startsWith('d')) {
			const stepRefSuffix: string = stepRef.slice(1);
			const mayBeAnInt = parseInt(stepRefSuffix);
			if (!isNaN(mayBeAnInt) && mayBeAnInt > this.maxRefAlreadyAssigned)
				this.maxRefAlreadyAssigned = mayBeAnInt;
		}
	}

	/**
	 * returns the ref for the new MmpProofStep; if stepRef is not undefined, it is assigned as is; if it
	 * is an automatically generated ref, this._maxNewRef is updated, it needed; if stepRef
	 * is undefined, a new ref is generated
	 * @param stepRef 
	 */
	getRef(stepRef: MmToken | undefined): string {
		let newRef: string;
		if (stepRef != undefined) {
			newRef = stepRef.value;
			this.updateMaxRefIfItsTheCase(stepRef.value);
		} else
			newRef = this.getNewRef();
		return newRef;
	}
	//#endregion getRef

	updateWorkingVarsIfTheCase(stepFormula: MmToken[]) {
		stepFormula.forEach((mmToken: MmToken) => {
			this.workingVars.updateWorkingVarsIfTheCase(mmToken.value);
		});
	}

	updateFormulaToProofStepMap(normalizedFormula: string) {
		if (normalizedFormula != undefined) {
			// const normalizedFormula: string = concatTokenValuesWithSpaces(proofStep.formula!);
			const indexForFormulaIfAlreadyPresent: number | undefined =
				this.formulaToProofStepMap.get(normalizedFormula);
			if (indexForFormulaIfAlreadyPresent == undefined) {
				// the current formula has not been encountered, yet
				const proofStatementIndex: number = this.mmpStatements.length - 1;
				this.formulaToProofStepMap.set(normalizedFormula, proofStatementIndex);
			}
		}
	}


	/** if the current proof step is an eHyp, it is added to the array of eHyps  */
	private updateEHyps(mmpProofStep: MmpProofStep) {
		if (mmpProofStep.isEHyp)
			this.eHyps.push(mmpProofStep);
	}

	// /** if the current proof step is a, it is added to the array of eHyps  */
	// updateDisjVarUStatements(mmpProofStep: MmpProofStep) {
	// 	if (mmpProofStep instanceof DisjVarUStatement)
	// 		this.disjVarUStatements.push(mmpProofStep);
	// }

	addMmpStep(mmpProofStep: MmpProofStep) {
		this.mmpStatements.push(mmpProofStep);
		this.lastMmpProofStep = mmpProofStep;
		// this.refToUStatementMap.set(mmpProofStep.stepRef, mmpProofStep);
		this.updateMaxRefIfItsTheCase(mmpProofStep.stepRef);
		if (mmpProofStep.stepFormula != undefined) {
			// we use the step formula instead of the step parse node, because we've decided
			// to consider a WorkingVar to be already existent, even when it is in a non parsable formula
			this.updateWorkingVarsIfTheCase(mmpProofStep.stepFormula);
			this.updateFormulaToProofStepMap(mmpProofStep.normalizedFormula!);
		}
		this.updateEHyps(mmpProofStep);
		// this.updateDisjVarUStatements(mmpProofStep);
	}
	//#endregion addMmpStep

	updateAllWorkingVars() {
		this.workingVars.reset();
		this.mmpStatements.forEach((uStatement: IMmpStatement) => {
			if (uStatement instanceof MmpProofStep && uStatement.stepFormula != undefined)
				this.updateWorkingVarsIfTheCase(uStatement.stepFormula);
		});
	}

	//#region insertStatementToTheHeader
	incrementFormulaToProofStepMap() {
		this.formulaToProofStepMap.forEach((index: number, ref: string) => {
			this.formulaToProofStepMap.set(ref, ++index);
		});
	}
	insertStatementToTheHeader(mmpStatement: IMmpStatement, index: number) {
		this.mmpStatements.splice(index, 0, mmpStatement);
		if (mmpStatement instanceof MmpComment && this.mainComment == undefined)
			this.mainComment = mmpStatement;
		this.incrementFormulaToProofStepMap();
	}
	//#endregion insertStatementToTheHeader

	insertMmpProofStepAtIndex(uProofStep: MmpProofStep, index: number) {
		this.mmpStatements.splice(index, 0, uProofStep);
		if (this.lastMmpProofStep != undefined && this.mmpStatements.indexOf(this.lastMmpProofStep) < index)
			this.lastMmpProofStep = uProofStep;
		this.updateMaxRefIfItsTheCase(uProofStep.stepRef);
		this.statementsInsertedAtASpecificIndexSoFar++;
		// this.refToUStatementMap.set(uProofStep.stepRef!, uProofStep);
	}

	addMmpStatement(mmpStatement: IMmpStatement) {
		if (mmpStatement instanceof MmpProofStep) {
			this.addMmpStep(mmpStatement);
		} else {
			this.mmpStatements.push(mmpStatement);
			if (mmpStatement instanceof MmpTheoremLabel)
				this.mmpTheoremLabels.push(mmpStatement);
			else if (mmpStatement instanceof MmpAllowDiscouraged)
				this.allowDiscouragedStatement = true;
			else if (mmpStatement instanceof MmpComment && this.mainComment == undefined)
				this.mainComment = mmpStatement;
		}
	}

	//#region insertMmpStatements
	/** insert statements at the given index */
	insertMmpStatements(mmpStatements: IMmpStatement[], i: number) {
		const currentMmpStatements = this.mmpStatements;
		this.reset();
		for (let j = 0; j < i; j++)
			this.addMmpStatement(currentMmpStatements[j]);
		for (let j = 0; j < mmpStatements.length; j++)
			this.addMmpStatement(mmpStatements[j]);
		for (let j = i; j < currentMmpStatements.length; j++)
			this.addMmpStatement(currentMmpStatements[j]);
		// this.mmpStatements.splice(i, 0, ...mmpStatements);
		// this.statementsInsertedAtASpecificIndexSoFar += mmpStatements.length;
	}
	//#endregion insertMmpStatements


	containsDjVarStatement(var1: string, var2: string): boolean {
		// const orderedVar1 = (var1 < var2 ? var1 : var2);
		// const orderedVar2 = (var1 < var2 ? var2 : var1);
		// const varsDisjointFromOrderedVar1 = this._disjVars.get(orderedVar1);
		// const result: boolean = varsDisjointFromOrderedVar1 != undefined && varsDisjointFromOrderedVar1.has(orderedVar2);
		const result: boolean = this.disjVars.containsDjContraint(var1, var2);
		return result;
	}

	// addDisjointVarStatement(var1: string, var2: string) {
	addDisjointVarStatement(statement: MmToken[]) {
		// here we assume var1 != var2
		// const orderedVar1 = (var1 < var2 ? var1 : var2);
		// const orderedVar2 = (var1 < var2 ? var2 : var1);
		// const disjVar: DisjVarUStatement = new DisjVarUStatement(orderedVar1, orderedVar2);
		const statementContent: MmToken[] = statement.slice(1);
		const disjVarUStatement: MmpDisjVarStatement = new MmpDisjVarStatement(statementContent);
		this.mmpStatements.push(disjVarUStatement);
		this.disjVarMmpStatements.push(disjVarUStatement);
		this.disjVars.add(statementContent[0].value, statementContent[1].value);
	}

	/**
	 * returns a new ref in the form 'dnn'
	 * @returns 
	 */
	getNewRef(): string {
		this.maxRefAlreadyAssigned++;
		const newRef: string = "d" + this.maxRefAlreadyAssigned;
		return newRef;
	}

	/**
	 * creates a new MmpProofStep, with a new ref, empty formula and empty parse node
	 * and adds it to the proof, inserting it just before the proof step with position index
	 * @param index the position of the UStatement, before which the new MmpProofStep has to be inserted
	 * @returns 
	 */
	createEmptyUStepAndAddItBeforeIndex(index: number): MmpProofStep {
		const stepRef: string = this.getNewRef();
		const stepRefToken: MmToken = new MmToken(stepRef, 0, 0);
		const firstTokenValue = stepRef + '::';
		const firstToken: MmToken = new MmToken(firstTokenValue, 0, 0);
		const proofStepFirstTokenInfo: ProofStepFirstTokenInfo = new ProofStepFirstTokenInfo(
			firstToken, false, stepRefToken);
		const mmpProofStep = new MmpProofStep(this, proofStepFirstTokenInfo, true, false, stepRefToken);
		// const uProofStep = new UProofStep(this, true, false, stepRef, [], undefined, undefined, undefined);
		// this.addUProofStepAtIndex(uProofStep, index);
		// return uProofStep;
		this.insertMmpProofStepAtIndex(mmpProofStep, index);
		return mmpProofStep;
	}

	// returns the text of the whole proof, built starting from the parse nodes
	toText(): string {
		const mmpProofFormatter: MmpProofFormatter = new MmpProofFormatter(this);
		const text = mmpProofFormatter.textWithIndentedProof();
		// let text = "";
		// this.uStatements.forEach((uStatement: IUStatement) => {
		// 	let uStatementText: string = uStatement.toText();
		// 	if (uStatement instanceof UComment)
		// 		uStatementText = `\n${uStatementText}\n`;
		// 	text = text + uStatementText + "\n";
		// });
		return text;
	}

	/** returns the proof text, without indentation */
	toTextWithoutIndentation(): string {
		let text = "";
		this.mmpStatements.forEach((uStatement: IMmpStatement) => {
			let uStatementText: string = uStatement.toText();
			if (uStatement instanceof MmpComment)
				uStatementText = `\n${uStatementText}\n`;
			text = text + uStatementText + "\n";
		});
		return text;
	}

	/**inserts a proofStatement just after the qed step */
	insertProofStatement(proofStatement: IMmpStatement) {
		//this method should only be invoked when the QED step is the last one
		if (this.lastMmpProofStep?.stepRef == "qed") {
			const indexOfQEDstep = this.mmpStatements.indexOf(this.lastMmpProofStep);
			this.mmpStatements.splice(indexOfQEDstep + 1, 0, proofStatement);
			this.proofStatement = proofStatement;
		}
	}

	/**
	 * returns the labels of the mandatory $f labels in RPN order. This method can be
	 * invoked only when the proof is found (and then both the qed statement and the
	 * $e hyps have valid parse nodes) 
	 */
	get mandatoryFHypsLabelsInRPNorder(): Set<string> {
		const mandatoryVars: Set<string> = this.mandatoryVars;
		const mandatoryVarsInRpnOrder: string[] = this.outermostBlock.getVariablesInRPNorder(mandatoryVars);
		const result: Set<string> = new Set<string>();
		mandatoryVarsInRpnOrder.forEach((mandatoryVar: string) => {
			const mandatoryFHypLabel: string = this.outermostBlock.varToFHypMap.get(mandatoryVar)!.Label;
			// if (!result.has(mandatoryFHypLabel))
			result.add(mandatoryFHypLabel);
		});
		return result;
	}

	//#region mandatoryFHypsLabelsInRPNorder
	setMandatoryHypLabels() {
		const mandatoryFHypsLabels = this.mandatoryFHypsLabelsInRPNorder;
		this._mandatoryHypLabels = new Set<string>(mandatoryFHypsLabels);
		this.eHyps.forEach((eHyp: MmpProofStep) => {
			this._mandatoryHypLabels?.add(eHyp.stepLabel!);
		});
	}
	get mandatoryHypLabels(): Set<string> {
		if (this._mandatoryHypLabels == undefined)
			this.setMandatoryHypLabels();
		return this._mandatoryHypLabels!;
	}
	//#endregion mandatoryFHypsLabelsInRPNorder

	/** returns the actual index for the given formula; formulaToProofStepMap is
	 * adjusted, considering proof steps that could have been added, so far
	 */
	adjustedStepIndexForThisFormula(formula: string): number | undefined {
		const originalIndex: number | undefined =
			this.formulaToProofStepMap.get(formula);
		const adjustedIndex: number | undefined = originalIndex != undefined ?
			originalIndex + this.statementsInsertedAtASpecificIndexSoFar : undefined;
		return adjustedIndex;
	}
}
