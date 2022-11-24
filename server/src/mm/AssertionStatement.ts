import { BlockStatement } from "./BlockStatement";
import { Frame } from "./Frame";
import { MmToken } from '../grammar/MmLexer';
import { LabeledStatement } from "./LabeledStatement";
import { EHyp } from './EHyp';


export interface IEHypOrderForStepDerivation {
    // /** true iff the current EHyp requires new variables to be unified */
    // hasNewLogicalVarsToBeUnified: boolean,
    /** the additional variables to be unified for the current EHyp*/
    additionalVariablesToBeUnified: Set<string>,
    /** the index of the EHyp in the assertion */
    eHypIndex: number
}

export abstract class AssertionStatement extends LabeledStatement {
    frame: Frame | undefined;

    // private logicalVarsInAssertionStatement: Set<string> | undefined;
    // private eHypToLogicalVarsMap: Map<EHyp, Set<string>> | undefined;

    /** this is used to dinamically build the eHyp order for step derivation */
    private eHypToNotYetUnifiedLogicalVarsMap: Map<EHyp, Set<string>> | undefined;

    /** the suggested order to try step derivation */
    private _eHypsOrderForStepDerivation: IEHypOrderForStepDerivation[] | undefined;

    private emptySetOfStrings: Set<string> = new Set<string>();

    //#region eHypsOrderForStepDerivation

    //#region setEHypsOrderForStepDerivation

    //#region initializeLogicalVarsInEachFormula
    // private initializeLogicalVarsInAssertionStatement() {
    //     if (this.outermostBlock != undefined)
    //         this.logicalVarsInAssertionStatement = this.parseNode.logicalVariables(this.outermostBlock);
    // }
    // private initializeEHypToLogicalVarsMap() {
    //     if (this.outermostBlock != undefined)
    //         this.frame?.eHyps.forEach((eHyp: EHyp) => {
    //             const logicalVariables: Set<string> = eHyp.parseNode.logicalVariables(this.outermostBlock!);
    //             this.eHypToLogicalVarsMap?.set(eHyp, logicalVariables);
    //         });
    // }

    //#region initializeEHypToNotYetUnifiedLogicalVarsMap
    private initializeSingleEHypToNotYetUnifiedLogicalVarsMap(eHyp: EHyp) {
        const logicalVariablesNotYetUnified: Set<string> = new Set<string>();
        eHyp.logicalVariables.forEach((logicalVariable: string) => {
            if (!this.logicalVariables.has(logicalVariable)) {
                // the current logicalVariable is not in the assertion logical variables
                logicalVariablesNotYetUnified.add(logicalVariable);
                // alreadyUnifiedVariables.add(logicalVariable);
            }
        });
        this.eHypToNotYetUnifiedLogicalVarsMap?.set(eHyp,logicalVariablesNotYetUnified);
    }
    /** initializes this.eHypToNotYetUnifiedLogicalVarsMap with all the logical variables
     * in each EHyp, minus the logical variables in the assertion
     */
    private initializeEHypToNotYetUnifiedLogicalVarsMap() {
        // const alreadyUnifiedVariables: Set<string> = new Set<string>(this.logicalVariables);
        this.frame?.eHyps.forEach((eHyp: EHyp) => {
            this.initializeSingleEHypToNotYetUnifiedLogicalVarsMap(eHyp);
        });
    }
    //#endregion initializeEHypToNotYetUnifiedLogicalVarsMap

    private initializeLogicalVarsInEachFormula() {
        // this.initializeLogicalVarsInAssertionStatement();
        // this.initializeEHypToLogicalVarsMap();
        this.initializeEHypToNotYetUnifiedLogicalVarsMap();
    }
    //#endregion initializeLogicalVarsInEachFormula

    //#region setEHypOrderForStepDerivation

    //#region getIndexesWithNoVarsToBeUnified
    getIndexesWithNoVarsToBeUnified(indexesNotAddedYet: number[]): number[] {
        const indexesWithNoVarsToBeUnified: number[] = [];
        indexesNotAddedYet.forEach((eHypIndex: number) => {
            const eHyp: EHyp = this.frame!.eHyps[eHypIndex];
            const logicalVarsNotYetUnified: Set<string> = this.eHypToNotYetUnifiedLogicalVarsMap!.get(eHyp)!;
            if (logicalVarsNotYetUnified.size == 0)
                indexesWithNoVarsToBeUnified.push(eHypIndex);
        });
        return indexesWithNoVarsToBeUnified;
    }
    //#endregion getIndexesWithNoVarsToBeUnified

    //#region setEHypsOrderForIndexesWithNoVarsToBeUnified
    /** sorts descending */
    private compareFormulaLengthDescending(i: number, j: number): number {
        const eHyp1: EHyp = this.frame!.eHyps[i];
        const eHyp2: EHyp = this.frame!.eHyps[j];
        const formulaLengh1: number = eHyp1.formula.length;
        const formulaLengh2: number = eHyp2.formula.length;
        // sorts descending
        const result = formulaLengh2 - formulaLengh1;
        return result;
    }

    //#region setEHypOrder
    removeAdditionalVarsUnified(additionalVariablesJustUnified: Set<string>) {
        this.eHypToNotYetUnifiedLogicalVarsMap!.forEach((notYetUnifiedLogicalVars: Set<string>) => {
            if (notYetUnifiedLogicalVars.size > 0)
                // this is just to maybe speedup the process
                additionalVariablesJustUnified.forEach((logicalVariable: string) => {
                    notYetUnifiedLogicalVars.delete(logicalVariable);
                });
        });
        throw new Error('Method not implemented.');
    }
    setEHypOrder(eHypIndex: number, additionalVariablesToBeUnified: Set<string>, indexesNotAddedYet: number[]) {
        const eHypOrderForStepDerivation: IEHypOrderForStepDerivation = {
            additionalVariablesToBeUnified: additionalVariablesToBeUnified,
            eHypIndex: eHypIndex
        };
        this._eHypsOrderForStepDerivation?.push(eHypOrderForStepDerivation);
        const index: number = indexesNotAddedYet.indexOf(eHypIndex);
        indexesNotAddedYet.splice(index);
        if (additionalVariablesToBeUnified.size > 0)
            this.removeAdditionalVarsUnified(additionalVariablesToBeUnified);
    }
    //#endregion setEHypOrder
    private setEHypsOrderForIndexesWithNoVarsToBeUnified(indexesWithNoVarsToBeUnified: number[],
        indexesNotAddedYet: number[]) {
        indexesWithNoVarsToBeUnified.sort(this.compareFormulaLengthDescending);
        indexesWithNoVarsToBeUnified.forEach((eHypIndex: number) => {
            this.setEHypOrder(eHypIndex, this.emptySetOfStrings, indexesNotAddedYet);
        });
    }
    //#endregion setEHypsOrderForIndexesWithNoVarsToBeUnified

    //#region pickOneEHypWithMaximalNumberOfAdditionalVarsToBeUnified
    getAdditionalVariablesToBeUnified(eHypIndex: number): Set<string> {
        const eHyp: EHyp = this.frame!.eHyps[eHypIndex];
        const additionalVariablesToBeUnified: Set<string> = this.eHypToNotYetUnifiedLogicalVarsMap!.get(eHyp)!;
        return additionalVariablesToBeUnified;
    }
    private compareNumberOfAdditionalVarsToBeUnifiedDescending(i: number, j: number): number {
        const additionalVarsToBeUnified1: Set<string> = this.getAdditionalVariablesToBeUnified(i);
        const additionalVarsToBeUnified2: Set<string> = this.getAdditionalVariablesToBeUnified(j);
        const numberOfAdditionalVarsToBeUnified1: number = additionalVarsToBeUnified1.size;
        const numberOfAdditionalVarsToBeUnified2: number = additionalVarsToBeUnified2.size;
        // sorts descending
        const result = numberOfAdditionalVarsToBeUnified2 - numberOfAdditionalVarsToBeUnified1;
        return result;
    }
    private pickOneEHypWithMaximalNumberOfAdditionalVarsToBeUnified(indexesNotAddedYet: number[]) {
        indexesNotAddedYet.sort(this.compareNumberOfAdditionalVarsToBeUnifiedDescending);
        const eHypIndex: number = indexesNotAddedYet[0];
        const additionalVariablesToBeUnified: Set<string> = this.getAdditionalVariablesToBeUnified(eHypIndex);
        this.setEHypOrder(eHypIndex, additionalVariablesToBeUnified, indexesNotAddedYet);
    }
    //#endregion

    setEHypOrderForStepDerivation(indexesNotAddedYet: number[]) {
        const indexesWithNoVarsToBeUnified: number[] = this.getIndexesWithNoVarsToBeUnified(indexesNotAddedYet);
        if (indexesWithNoVarsToBeUnified.length > 0)
            // at the current stage, there are EHyps with no additional logical variables to be unified
            this.setEHypsOrderForIndexesWithNoVarsToBeUnified(indexesWithNoVarsToBeUnified, indexesNotAddedYet);
        else
            this.pickOneEHypWithMaximalNumberOfAdditionalVarsToBeUnified(indexesNotAddedYet);
    }
    //#endregion setEHypOrderForStepDerivation

    setEHypsOrderForStepDerivation(): void {
        //TODO1 this is a stub implementation
        if (this.frame != undefined) {
            this.initializeLogicalVarsInEachFormula();
            const numOfEHyps: number = this.frame.eHyps.length;
            this._eHypsOrderForStepDerivation = [];
            const indexesNotAddedYet: number[] = Array.from(Array(numOfEHyps).keys());
            while (this._eHypsOrderForStepDerivation.length < numOfEHyps) {
                this.setEHypOrderForStepDerivation(indexesNotAddedYet);
            }
            // Array.from(Array(numOfEHyps).keys());
        }
    }
    //#endregion setEHypsOrderForStepDerivation

    /** the suggested order to try step derivation; the goal is to
     * have fast failure if no derivation is possible. From heuristics,
     * we first try the longest ones. Furthermore, EHyps with all logical vars
     * substituted are tried first, because they can be addressed using maps (from
     * formulas to MmpProofStep's; assuming the MmpProofStep to be derived
     * has no working vars)
     */
    get eHypsOrderForStepDerivation(): IEHypOrderForStepDerivation[] | undefined {
        if (this._eHypsOrderForStepDerivation == undefined)
            // the orders has not been defined yet
            this.setEHypsOrderForStepDerivation();
        return this._eHypsOrderForStepDerivation!;
    }
    //#endregion eHypsOrderForStepDerivation
    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(label, content, parentBlock, comment);
    }

    // returns the mandatory vars for the current AssertionStatement
    mandatoryVars(outermostrBlock: BlockStatement): Set<string> {
        const mandatoryVars: string[] = outermostrBlock.get_mand_vars(this.formula, this.frame!.eHyps);
        const result: Set<string> = new Set<string>(mandatoryVars);
        return result;
    }
}
