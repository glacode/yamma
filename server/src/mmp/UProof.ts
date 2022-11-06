
import { BlockStatement } from '../mm/BlockStatement';
import { DisjointVarMap } from '../mm/DisjointVarMap';
import { MmToken } from '../grammar/MmLexer';
import { MmpProofStep, ProofStepFirstTokenInfo } from './MmpStatements';
import { DisjVarUStatement } from '../mm/Statements';
import { UCompressedProofStatement } from './UCompressedProofStatement';
import { UProofStep } from './UProofStep';
import { IUStatement, UComment, UProofStatement, UTheoremLabel } from './UStatement';
import { WorkingVars } from './WorkingVars';
import { UProofFormatter } from './UProofFormatter';
import { ITheoremSignature } from '../mmt/MmtParser';

export class UProof implements ITheoremSignature {
	outermostBlock: BlockStatement;
	workingVars: WorkingVars;
	maxRefAlreadyAssigned = 0;

	uStatements: IUStatement[];

	/** the theorem label is expected to be the first statement */
	public get theoremLabel(): MmToken | undefined {
		let theoremLabel: MmToken | undefined;
		if (this.uStatements[0] instanceof UTheoremLabel && this.uStatements[0].theoremLabel != undefined)
			// the first statement is a theorem label statement and the theoremLabel is actually specified
			theoremLabel = this.uStatements[0].theoremLabel;
		return theoremLabel;
	}

	/**
	 * The main comment is expected to be the second statement, just after
	 * the theorem label statement
	 */
	public get mainComment(): UComment | undefined {
		let uComment: UComment | undefined;
		if (this.uStatements[0] instanceof UTheoremLabel && this.uStatements[1] instanceof UComment)
			// the first statement is a theorem label statement and the second statement is a comment;
			// this is the expected state with no diagnostics
			uComment = this.uStatements[1];
		else if (this.uStatements[0] instanceof UComment)
			// the theorem label statement is missing; this will rise a Diagnostic, but if
			// the first statement is comment, we return it as the main comment
			uComment = this.uStatements[0];
		return uComment;
	}


	/** if the qed step is proven, proofStatement will contain the proof statement */
	proofStatement: UProofStatement | UCompressedProofStatement | undefined;

	// lastUProofStep is introduced for better performance, only
	/**the last MmpProofStep in the array of uStatements*/
	lastUProofStep: MmpProofStep | undefined;
	// lastUProofStep: UProofStep | undefined;


	/**contains an efficient (for search) representation of the Disjoint Vars Statement defined. It's introduced for performance only */
	// private _disjVars: Map<string, Set<string>>;
	disjVars: DisjointVarMap;

	eHyps: UProofStep[];

	/** the array of defined disjoint var constraints */
	disjVarUStatements: DisjVarUStatement[]

	// needed to implement ITheoremSignature
	get pStatement(): MmpProofStep | undefined {
		let pStat: MmpProofStep | undefined;
		if (this.lastUProofStep?.stepRef == "qed")
			pStat = this.lastUProofStep;
		return pStat;
	}


	constructor(outermostBlock: BlockStatement, workingVars: WorkingVars, startIndexForNewRefs?: number) {
		this.outermostBlock = outermostBlock;
		this.workingVars = workingVars;
		if (startIndexForNewRefs != undefined)
			this.maxRefAlreadyAssigned = startIndexForNewRefs - 1;
		this.uStatements = [];

		// this._disjVars = new Map<string, Set<string>>();
		this.disjVars = new DisjointVarMap();
		this.eHyps = [];
		this.disjVarUStatements = [];
	}



	/** the set of the mandatory vars for this UProof */
	get mandatoryVars(): Set<string> {
		const result: Set<string> = new Set<string>();
		this.uStatements.forEach((uStatement: IUStatement) => {
			if (uStatement instanceof MmpProofStep && (uStatement.isEHyp || uStatement.stepRef == "qed")) {
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

	//#region addUProofStepFromMmpStep

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

	addUProofStepFromMmpStep(mmpProofStep: MmpProofStep) {
		this.uStatements.push(mmpProofStep);
		this.lastUProofStep = mmpProofStep;
		// this.refToUStatementMap.set(mmpProofStep.stepRef, mmpProofStep);
		this.updateMaxRefIfItsTheCase(mmpProofStep.stepRef);
		if (mmpProofStep.stepFormula != undefined)
			// we use the step formula instead of the step parse node, because we've decided
			// to consider a WorkingVar to be already existent, even when it is in a non parsable formula
			this.updateWorkingVarsIfTheCase(mmpProofStep.stepFormula);
		this.updateEHyps(mmpProofStep);
		// this.updateDisjVarUStatements(mmpProofStep);
	}
	//#endregion addUProofStepFromMmpStep

	updateAllWorkingVars() {
		this.workingVars.reset();
		this.uStatements.forEach((uStatement: IUStatement) => {
			if (uStatement instanceof MmpProofStep && uStatement.stepFormula != undefined)
				this.updateWorkingVarsIfTheCase(uStatement.stepFormula);
		});
	}

	// static createUProofFromMmpProof(mmpStatements: MmpStatement[]): UProof {
	// 	const uProof: UProof = new UProof();
	// 	mmpStatements.forEach((mmpStatement: MmpStatement) => {
	// 		if (mmpStatement instanceof MmpProofStep)
	// 			uProof.addUProofStepFromMmpStep(mmpStatement);
	// 		else
	// 			// mmpStatement instanceof UComment
	// 			uProof.addUStatement(mmpStatement);
	// 	});
	// 	return uProof;
	// }
	//#endregion createUProofFromMmpProof

	addUProofStepAtIndex(uProofStep: MmpProofStep, index: number) {
		this.uStatements.splice(index, 0, uProofStep);
		if (this.lastUProofStep != undefined && this.uStatements.indexOf(this.lastUProofStep) < index)
			this.lastUProofStep = uProofStep;
		this.updateMaxRefIfItsTheCase(uProofStep.stepRef);
		// this.refToUStatementMap.set(uProofStep.stepRef!, uProofStep);
	}

	addUStatement(uStatement: IUStatement) {
		this.uStatements.push(uStatement);
		if (uStatement instanceof MmpProofStep) {
			this.updateMaxRefIfItsTheCase(uStatement.stepRef);
			// this.refToUStatementMap.set(uStatement.stepRef!, uStatement);
		}
	}

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
		const disjVarUStatement: DisjVarUStatement = new DisjVarUStatement(statementContent);
		this.uStatements.push(disjVarUStatement);
		this.disjVarUStatements.push(disjVarUStatement);
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
		const stepRefToken: MmToken = new MmToken(stepRef,0,0);
		const firstTokenValue = stepRef + '::';
		const firstToken: MmToken = new MmToken(firstTokenValue,0,0);
		const proofStepFirstTokenInfo: ProofStepFirstTokenInfo = new ProofStepFirstTokenInfo(
			firstToken,false,stepRefToken);
		const mmpProofStep = new MmpProofStep(this,proofStepFirstTokenInfo,true,false,stepRefToken);
		// const uProofStep = new UProofStep(this, true, false, stepRef, [], undefined, undefined, undefined);
		// this.addUProofStepAtIndex(uProofStep, index);
		// return uProofStep;
		this.addUProofStepAtIndex(mmpProofStep, index);
		return mmpProofStep;
	}

	// returns the text of the whole proof, built starting from the parse nodes
	toText(): string {
		const uProofFormatter: UProofFormatter = new UProofFormatter(this);
		const text = uProofFormatter.textWithIndentedProof();
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
		this.uStatements.forEach((uStatement: IUStatement) => {
			let uStatementText: string = uStatement.toText();
			if (uStatement instanceof UComment)
				uStatementText = `\n${uStatementText}\n`;
			text = text + uStatementText + "\n";
		});
		return text;
	}

	/**inserts a proofStatement just after the qed step */
	insertProofStatement(proofStatement: UProofStatement | UCompressedProofStatement) {
		//this method should only be invoked when the QED step is the last one
		if (this.lastUProofStep?.stepRef == "qed") {
			const indexOfQEDstep = this.uStatements.indexOf(this.lastUProofStep);
			this.uStatements.splice(indexOfQEDstep + 1, 0, proofStatement);
			this.proofStatement = proofStatement;
		}
	}

	//#region mandatoryFHypsLabelsInRPNorder
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
	//#endregion mandatoryFHypsLabelsInRPNorder



}
