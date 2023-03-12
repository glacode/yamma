//import { Assertion } from "../app";
import { Statement, ZIStatement, ZRStatement } from "../mm/Statements";
import { ProvableStatement } from "../mm/ProvableStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { BlockStatement } from "../mm/BlockStatement";
import { Frame } from "../mm/Frame";
import { Verifier } from '../mm/Verifier';

export class ProofCompressor {
    //#region DecompressProof

    //#region getDecompressedInts
    // static getCompressedString(statementContent: string[]): string {
    //     const ep = statementContent.lastIndexOf(')');
    //     let compressedString = "";
    //     for (let index = ep + 1; index < statementContent.length; index++) {
    //         compressedString += statementContent[index];
    //     }
    //     return compressedString;
    // }

    failed: boolean;

    constructor() {
        this.failed = false;
    }

    //#region DecompressProof

    //#region getDecompressedInts
    public static getDecompressedIntsFromString(compressedString: string): number[] {
        const decompressedInts: number[] = [];
        const charCodeA: number = 'A'.charCodeAt(0);
        const charCodeT: number = 'T'.charCodeAt(0);
        let numStart = 0;
        while (numStart < compressedString.length) {
            let numNext = numStart;
            while (compressedString[numNext] > 'T') {
                numNext++;
            }
            let val = 0;
            for (let i = numStart; i < numNext; i++) {
                const curChCode = compressedString.charCodeAt(i);
                val += 4 * Math.pow(5, (numNext - i)) * (curChCode - charCodeT);
            }
            val += compressedString.charCodeAt(numNext++) - charCodeA + 1;
            decompressedInts.push(val);
            if (compressedString.length > numNext && compressedString[numNext] == 'Z') {
                numNext++;
                decompressedInts.push(0);
            }
            numStart = numNext;
        }
        return decompressedInts;
    }
    private getDecompressedInts(provableStatement: ProvableStatement): number[] {
        // const compressedString = ProofCompressor.getCompressedString(provableStatement.Content);
        const compressedString = provableStatement.compressedProofString;
        const decompressedInts = ProofCompressor.getDecompressedIntsFromString(compressedString);
        return decompressedInts;
    }
    //#endregion getDecompressedInts

    //#region getDecompressedProof
    // adds the labels of the mandatory hyps ad the beginning of the proof labels
    getDecompressedProof(provableStatement: ProvableStatement,
        decompressed_ints: number[], labelToStatementMap: Map<string, LabeledStatement>): Statement[] {
        const frame = <Frame>provableStatement.frame;
        const fHypCount = frame.fHyps.length;
        const eHypCount = frame.eHyps.length;
        const proofLabels = provableStatement.CompressedProofLabels;
        const labelCount = proofLabels.length;
        // const zCount = decompressed_ints.reduce(
        //     (previousValue, currentValue) => previousValue += (currentValue === 0 ? 1 : 0) )
        const zCount = decompressed_ints.filter(i => i === 0).length;
        const decompressedProof: Statement[] = [];
        let statement: Statement;
        decompressed_ints.forEach(j => {
            let i = j;
            if (i === 0) {
                statement = new ZIStatement();
            } else {
                i -= 1;
                if (i < fHypCount) {
                    statement = frame.fHyps[i];
                } else {
                    if (i < fHypCount + eHypCount) {
                        statement = frame.eHyps[i - fHypCount];
                    } else {
                        i -= (fHypCount + eHypCount);
                        if (i < labelCount) {
                            //  statement = (<BlockStatement>provableStatement.ParentBlock).LookUpStatement()
                            const currentLabel = proofLabels[i];
                            // statement = <Statement>labelToStatementMap.get(currentLabel);
                            statement = <Statement>Verifier.getProofStatement(currentLabel,
                                labelToStatementMap,<BlockStatement>provableStatement.ParentBlock);
                        } else {
                            i -= labelCount;
                            if (i < zCount) {
                                statement = new ZRStatement(i);
                            } else {
                                //TODO1 mar 12 consider adding Diagnostic. For example, see metamath error message
                                // for nnawordex if at the beginning of the proof you replace BEFZCEF with BEFCCEF
                                this.failed = true;
                                // throw new Error("Couldn't uncompress proof.");
                            }
                        }

                    }

                }
            }
            decompressedProof.push(statement);
        });
        return decompressedProof;
    }
    //#endregion getDecompressedProof

    /** it tries to decompress the proof of a ProvableStatement; it will set the value of the failed property;
     * it will return diagnostics if error are encountered
    */
    DecompressProof(provableStatement: ProvableStatement,
        labelToStatementMap: Map<string, LabeledStatement>): Statement[] {
            this.failed = false;
        const decompressed_ints: number[] =
            this.getDecompressedInts(provableStatement);
        const decompressedProof: Statement[] =
            this.getDecompressedProof(provableStatement, decompressed_ints, labelToStatementMap);
        return decompressedProof;
    }
    //#endregion DecompressProof
}

