import { MmToken } from '../grammar/MmLexer';
import { MmpParser } from './MmpParser';
import { MmpProofStep } from "./MmpProofStep";
import { IUStatement } from './UStatement';

export class MmpStatistics {
	mmpParser: MmpParser;

	/** the set of symbols in the given MmpParser */
	symbols?: Set<string>;

	constructor(mmpParser: MmpParser) {
		this.mmpParser = mmpParser;
	}

	//#region buildStatistics
	addSymbolsForCurrentMmpProofStep(mmpProofStep: MmpProofStep) : void {
		if (mmpProofStep.formula != undefined)
			mmpProofStep.formula.forEach((mmToken: MmToken) => {
				this.symbols?.add(mmToken.value);
			});
	}
	/**
	 * builds the statistics for the given MmpParser
	 */
	public buildStatistics() {
		if (this.mmpParser.uProof != undefined) {
			this.symbols = new Set<string>();

			this.mmpParser.uProof?.uStatements.forEach((uStatement: IUStatement) => {
				if (uStatement instanceof MmpProofStep)
					this.addSymbolsForCurrentMmpProofStep(uStatement);
			});
		}
	}
	//#endregion buildStatistics
}