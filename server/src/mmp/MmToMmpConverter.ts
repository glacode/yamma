
import { MmToken } from '../grammar/MmLexer';
import { AssertionStatement } from '../mm/AssertionStatement';
import { BlockStatement } from '../mm/BlockStatement';
import { EHyp } from '../mm/EHyp';
import { FHyp } from '../mm/FHyp';
import { Frame } from '../mm/Frame';
import { LabeledStatement } from '../mm/LabeledStatement';
import { ProvableStatement } from '../mm/ProvableStatement';
import { Statement, ZIStatement, ZRStatement } from '../mm/Statements';
import { concatWithSpaces, fromStringsToTokens, rebuildOriginalStringFromTokens, splitToTokensDefault } from '../mm/Utils';
import { Verifier } from '../mm/Verifier';
import { MmpProof } from './MmpProof';
import { MmpProofStep } from './MmpProofStep';
import { MmpComment } from './MmpStatement';
import { ProofStepFirstTokenInfo } from './MmpStatements';
import { MmpTheoremLabel } from './MmpTheoremLabel';
import { ProofCompressor } from './ProofCompressor';
import { WorkingVars } from './WorkingVars';

export class MmToMmpConverter {
	private mmpProof: MmpProof;
	private stack: string[][] = [];
	private stored: string[][] = [];
	private verifier: Verifier = new Verifier([]);
	private formulaStringToMmpProofStepMap: Map<string, MmpProofStep> = new Map<string, MmpProofStep>();

	constructor(private theoremLabel: string, private outermostBlock: BlockStatement,
		private labelToStatementMap: Map<string, LabeledStatement>) {
		this.mmpProof = new MmpProof(this.outermostBlock, new WorkingVars(new Map<string, string>()));
	}

	//#region buildProof

	//#region buildProofForProvableStatement
	addTheoremLabel(label: string) {
		const mmpTheoremLabel: MmpTheoremLabel = new MmpTheoremLabel(
			new MmToken("$theorem", 0, 0), new MmToken(label, 0, 0));
		this.mmpProof.addMmpStatement(mmpTheoremLabel);
	}
	addComment(comment: MmToken[]) {
		const commentContent: string = rebuildOriginalStringFromTokens(comment);
		const newComment: string = '* ' + commentContent;
		const newTokens: MmToken[] = splitToTokensDefault(newComment);
		const mmpComment: MmpComment = new MmpComment(newTokens, newComment);
		this.mmpProof.addMmpStatement(mmpComment);
	}
	private addHeaderStatements(provableStatement: ProvableStatement) {
		this.addTheoremLabel(provableStatement.Label);
		if (provableStatement.comment != undefined)
			this.addComment(provableStatement.comment);
		//TODO1 18 MAY 2023 add comment
	}
	//#region addMmpStatements

	//#region addSingleStepToMmpProof

	//#region addAssertionStatementWithSubstitution

	//#region buildMmpProofStep
	//#region getEHypMmpSteps
	//#region getEHypMmpStep
	getFormulaStringWithSubstitution(formula: string[], substitution: Map<string, string[]>): string {
		const formulaWithSubstitution: string[] =
			this.verifier.applySubstitution(formula, substitution);
		const formulaStringWithSubstitution: string = concatWithSpaces(formulaWithSubstitution);
		return formulaStringWithSubstitution;
	}
	getEHypMmpStep(eHyp: EHyp, substitution: Map<string, string[]>): MmpProofStep {
		const eHypFormulaStringWithSubstitution: string = this.getFormulaStringWithSubstitution(
			eHyp.formula, substitution);
		const mmpProofStep: MmpProofStep = this.formulaStringToMmpProofStepMap.get(
			eHypFormulaStringWithSubstitution)!;
		return mmpProofStep;
	}
	//#endregion getEHypMmpStep
	getEHypMmpSteps(assertionStatementProofStep: AssertionStatement,
		substitution: Map<string, string[]>):
		MmpProofStep[] {
		const eHypMmpSteps: MmpProofStep[] = [];
		assertionStatementProofStep.frame!.eHyps.forEach((eHyp: EHyp) => {
			const eHypMmpStep: MmpProofStep = this.getEHypMmpStep(eHyp, substitution);
			eHypMmpSteps.push(eHypMmpStep);
		});
		return eHypMmpSteps;
	}
	//#endregion getEHypMmpSteps

	//#region buildFirstTokenInfo
	getStepRef(isLastStatementInMmProof: boolean): string {
		let stepRef = this.mmpProof.mmpStatements.length.toString();
		if (isLastStatementInMmProof)
			stepRef = 'qed';
		return stepRef;
	}
	//#region buildFirstToken
	getStepRefs(eHypMmpSteps: MmpProofStep[]): string {
		let stepRefs: string = eHypMmpSteps.length == 0 ? '' : eHypMmpSteps[0].stepRef;
		for (let i = 1; i < eHypMmpSteps.length; i++)
			stepRefs += ',' + eHypMmpSteps[i].stepRef;
		return stepRefs;
	}
	buildFirstToken(stepRef: string, eHypMmpSteps: MmpProofStep[],
		stepLabel: string): MmToken {
		const stepRefs: string = this.getStepRefs(eHypMmpSteps);
		// const firstTokenValue = stepRef + '::';
		const firstTokenValue = `${stepRef}:${stepRefs}:${stepLabel}`;
		const firstToken: MmToken = new MmToken(firstTokenValue, 0, 0);
		return firstToken;
	}
	//#endregion buildFirstToken
	buildEHypRefs(eHypMmpSteps: MmpProofStep[]): MmToken[] {
		const eHypRefs: MmToken[] = [];
		eHypMmpSteps.forEach((eHypMmpStep: MmpProofStep) => {
			const eHypRef: MmToken = new MmToken(eHypMmpStep.stepRef, 0, 0);
			eHypRefs.push(eHypRef);
		});
		return eHypRefs;
	}
	buildFirstTokenInfo(assertionStatementProofStep: AssertionStatement,
		eHypMmpSteps: MmpProofStep[],
		isLastStatementInMmProof: boolean): ProofStepFirstTokenInfo {
		const isEHyp = false;
		const stepRef: string = this.getStepRef(isLastStatementInMmProof);
		const stepRefToken: MmToken = new MmToken(stepRef, 0, 0);
		const firstToken: MmToken = this.buildFirstToken(stepRef, eHypMmpSteps,
			assertionStatementProofStep.Label);
		const eHypRefs: MmToken[] = this.buildEHypRefs(eHypMmpSteps);
		const labelToken: MmToken = new MmToken(assertionStatementProofStep.Label, 0, 0);
		const proofStepFirstTokenInfo: ProofStepFirstTokenInfo = new ProofStepFirstTokenInfo(
			firstToken, isEHyp, stepRefToken, eHypRefs, labelToken);
		return proofStepFirstTokenInfo;
	}
	//#endregion buildFirstTokenInfo

	buildMmpProofStep(assertionStatementProofStep: AssertionStatement,
		assertionStatementWithSubstitution: string[], substitution: Map<string, string[]>,
		isLastStatementInMmProof: boolean): MmpProofStep {
		const eHypMmpSteps: MmpProofStep[] = this.getEHypMmpSteps(
			assertionStatementProofStep, substitution);
		const firstTokenInfo: ProofStepFirstTokenInfo = this.buildFirstTokenInfo(
			assertionStatementProofStep, eHypMmpSteps, isLastStatementInMmProof);
		const formula: MmToken[] = fromStringsToTokens(assertionStatementWithSubstitution);
		const mmpProofStep: MmpProofStep = new MmpProofStep(this.mmpProof, firstTokenInfo, true, false,
			firstTokenInfo.stepRef, firstTokenInfo.eHypRefs, eHypMmpSteps,
			firstTokenInfo.stepLabel, formula);
		return mmpProofStep;
	}
	//#endregion buildMmpProofStep
	private addAssertionStatementWithSubstitution(assertionStatementProofStep: AssertionStatement,
		assertionStatementWithSubstitution: string[], substitution: Map<string, string[]>,
		isLastStatementInMmProof: boolean) {
		const mmpProofStep: MmpProofStep = this.buildMmpProofStep(assertionStatementProofStep,
			assertionStatementWithSubstitution, substitution, isLastStatementInMmProof);
		this.mmpProof.addMmpStep(mmpProofStep);
		this.formulaStringToMmpProofStepMap.set(mmpProofStep.textForFormula!
			, mmpProofStep);
	}
	//#endregion addAssertionStatementWithSubstitution
	private addSingleStepToMmpProof(assertionStatementProofStep: AssertionStatement,
		isLastStatementInMmProof: boolean) {
		const frameProofStep: Frame = <Frame>assertionStatementProofStep.frame;
		const popCount: number = frameProofStep.fHyps.length + frameProofStep.eHyps.length;
		const fHypsStack: string[][] = this.verifier.fHypsStack(frameProofStep, this.stack);
		const substitution: Map<string, string[]> =
			this.verifier.buildSubstitution(frameProofStep.fHyps, fHypsStack);
		for (let i = 0; i < popCount; i++)
			this.stack.pop();
		const assertionStatementWithSubstitution: string[] =
			this.verifier.applySubstitution(assertionStatementProofStep.formula, substitution);
		if (assertionStatementProofStep.formula[0] == '|-')
			this.addAssertionStatementWithSubstitution(assertionStatementProofStep,
				assertionStatementWithSubstitution, substitution, isLastStatementInMmProof);
		this.stack.push(assertionStatementWithSubstitution);
	}
	//#endregion addSingleStepToMmpProof
	private addMmpStatementsFromDecompressedProof(mmProof: Statement[]) {
		mmProof.forEach((statement: Statement, i: number) => {
			if (statement instanceof FHyp) {
				this.stack.push(statement.formula);
			} else if (statement instanceof EHyp) {
				//TODO1 20 MAY add eHyp MmpProofStep
				this.stack.push(statement.formula);
			} else if (statement instanceof ZIStatement) {
				this.stored.push(this.stack[this.stack.length - 1]);
			} else if (statement instanceof ZRStatement) {
				this.stack.push(this.stored[(<ZRStatement>statement).referencedZ]);
			} else if (statement instanceof AssertionStatement)
				this.addSingleStepToMmpProof(<AssertionStatement>statement,
					i == mmProof.length - 1);
		});
	}
	private addMmpStatements(provableStatement: ProvableStatement) {
		const proofCompressor: ProofCompressor = new ProofCompressor([]);
		const mmProof: Statement[] = proofCompressor.DecompressProof(provableStatement,
			this.labelToStatementMap);
		this.addMmpStatementsFromDecompressedProof(mmProof);
	}
	//#endregion addMmpStatements
	buildProofForProvableStatement(provableStatement: ProvableStatement): MmpProof {
		this.addHeaderStatements(provableStatement);
		this.addMmpStatements(provableStatement);
		return this.mmpProof;
	}
	//#endregion buildProofForProvableStatement

	buildProof(): MmpProof | undefined {
		let mmpProof: MmpProof | undefined;
		const provableStatement: LabeledStatement | undefined =
			this.labelToStatementMap.get(this.theoremLabel);
		if (provableStatement instanceof ProvableStatement)
			mmpProof = this.buildProofForProvableStatement(provableStatement);
		return mmpProof;
	}
	//#endregion buildProof
}