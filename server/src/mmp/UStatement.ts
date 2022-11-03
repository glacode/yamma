import { Range } from 'vscode-languageserver';
import { MmToken } from '../grammar/MmLexer';
import { InternalNode } from '../grammar/ParseNode';
import { concatWithSpaces, rebuildOriginalStringFromTokens } from '../mm/Utils';

export interface IUStatement {
	toText(): string
}

export interface IMmpStatementWithRange extends IUStatement {
	range: Range
}

export class UTheoremLabel implements IUStatement {
	dollarStatementKeyword: MmToken;
	theoremLabel?: MmToken;

	constructor(dollarStatementKeyword: MmToken, theoremLabel?: MmToken) {
		this.dollarStatementKeyword = dollarStatementKeyword;
		this.theoremLabel = theoremLabel;
	}

	toText() {
		const label: string = ( this.theoremLabel != undefined ? this.theoremLabel?.value : "example" );
		const text: string = this.dollarStatementKeyword.value + " " + label;
		return text;
	}
}

export class UComment implements IUStatement {
	/** comment tokens, exclued the startin '*' character */
	contentTokens: MmToken[]
	comment: string;

	constructor(contentTokens: MmToken[], comment: string) {
		this.contentTokens = contentTokens;
		this.comment = comment;
	}

	toText() {
		return this.comment;
	}
}


export type UProofStatementStep = {
	label: string,
	parseNode: InternalNode;
}



export class UProofStatement implements IUStatement {
	proof: UProofStatementStep[];
	constructor(proof: UProofStatementStep[]) {
		this.proof = proof;
	}

	//#region toText
	toText(): string {
		// let text: string;
		// if (this.proofMode == ProofMode.normal) {
		const labels: string[] = [];
		this.proof.forEach((uProofStatementStep: UProofStatementStep) => {
			labels.push(uProofStatementStep.label);
		});
		const labelsString = concatWithSpaces(labels);
		const text = "\n$=    " + labelsString + " $.";
		// } else {			// this.proofMode == ProofMode.compressed
		// 	text = "***???**";
		// 	throw new Error("Return compressed proof. Not implemented yet!");
		// }
		return text;
	}
	//#endregion toText
}

/**
 * a IUStatement that should be accepted without parsing and without unification; it has to be
 * left unchanged by a unification process
 */
export class UnmanagedStatement implements IUStatement {
	statementTokens: MmToken[];
	constructor(statementTokens: MmToken[]) {
		this.statementTokens = statementTokens;
	}

	//#region toText
	toText(): string {
		const text = rebuildOriginalStringFromTokens(this.statementTokens);
		return text;
	}
	//#endregion toText
}

// export type UStatement = UTheoremLabel | UProofStep | UComment | DisjVarUStatement | UProofStatement | UCompressedProofStatement