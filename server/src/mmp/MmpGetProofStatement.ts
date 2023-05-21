import { MmToken } from '../grammar/MmLexer';
import { IMmpStatement } from './MmpStatement';

export class MmpGetProofStatement implements IMmpStatement {

	constructor(private getProofKeyword: MmToken, public theoremLabel?: MmToken) {
	}

	toText() {
		let text: string = this.getProofKeyword.value;
		if (this.theoremLabel != undefined)
			text += ' ' + this.theoremLabel.value;
		return text;
	}
}