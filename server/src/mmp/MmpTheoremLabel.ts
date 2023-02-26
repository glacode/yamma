import { MmToken } from '../grammar/MmLexer';
import { IMmpStatement } from './MmpStatement';


export class MmpTheoremLabel implements IMmpStatement {

	static dollarTokenWidhDefaultRange: MmToken = new MmToken('$theorem', 0, 0);

	dollarStatementKeyword: MmToken;
	theoremLabel?: MmToken;

	constructor(dollarStatementKeyword: MmToken, theoremLabel?: MmToken) {
		this.dollarStatementKeyword = dollarStatementKeyword;
		this.theoremLabel = theoremLabel;
	}

	toText() {
		const label: string = (this.theoremLabel != undefined ? this.theoremLabel?.value : "example");
		const text: string = this.dollarStatementKeyword.value + " " + label;
		return text;
	}

	/** creates a MmpTheoremLabel from the given string, using dummy ranges */
	public static CreateMmpTheoremLabel(theoremLabel: string): MmpTheoremLabel {
		const theoremLabelToken: MmToken = new MmToken(theoremLabel, 0, 9);
		const mmpTheoremLabel: MmpTheoremLabel = new MmpTheoremLabel(
			MmpTheoremLabel.dollarTokenWidhDefaultRange, theoremLabelToken);
		return mmpTheoremLabel;
	}
}
