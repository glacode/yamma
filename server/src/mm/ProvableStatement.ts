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

    private _compressedProofString: string | undefined;

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
        if (this._compressedProofString == undefined) {
            const proof = this.Proof;
            const closeParenthesisIndex = proof.lastIndexOf(')');
            this._compressedProofString = "";
            if (closeParenthesisIndex != -1)
                for (let index = closeParenthesisIndex + 1; index < proof.length; index++) {
                    this._compressedProofString += proof[index];
                }
        }
        return this._compressedProofString;
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
