import { BlockStatement } from "./BlockStatement";
import { MmToken } from '../grammar/MmLexer';
import { AssertionStatement } from './AssertionStatement';

// export class AxiomStatementOld extends AssertionStatementOld {
//     constructor(label: string, content: string[], disjVars: DisjVars,
//         f_hyps: FHyp[], e_hyps: EHyp[], parentBlock: BlockStatement) {
//         super(label, content, disjVars, f_hyps, e_hyps, parentBlock);
//     }
// }
//export class ProvableStatement extends AssertionStatementOld {
// constructor(label: string, content: string[], disjVars: DisjVars,
//     f_hyps: FHyp[], e_hyps: EHyp[], parentBlock: BlockStatement) {
//     super(label, content, disjVars, f_hyps, e_hyps, parentBlock);

export class ProvableStatement extends AssertionStatement {

    constructor(label: string, content: MmToken[], parentBlock: BlockStatement, comment?: MmToken[]) {
        super(label, content, parentBlock, comment);
    }

    get Proof(): string[] {
        const proof: string[] = [];
        let hasProofBegun = false;
        this.Content.forEach(token => {
            if (hasProofBegun)
                proof.push(token.value);
            if (token.value == '$=')
                hasProofBegun = true;
        });
        // const indexOfLastTokenBeforeProof = this.Content.indexOf('$=');
        // const proofTokens = this.Content.slice(indexOfLastTokenBeforeProof + 1);
        // const proof = MmToken.joinValues(proofTokens)
        return proof;
    }

    get compressedProofString(): string {
        const proof = this.Proof;
        const ep = proof.lastIndexOf(')');
        let compressedString = "";
        for (let index = ep + 1; index < proof.length; index++) {
            compressedString += proof[index];
        }
        return compressedString;
    }

    get CompressedProofLabels(): string[] {
        const proofStrings: string[] = this.Proof;
        if (proofStrings[0] != "(") {
            throw new Error("This method should be called for compressed proofs only!");
        }
        const closingParIndex = this.Proof.indexOf(')');
        const proofLabels = proofStrings.slice(1, closingParIndex);
        return proofLabels;
    }
}
