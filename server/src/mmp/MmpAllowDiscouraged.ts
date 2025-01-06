import { MmToken } from '../grammar/MmLexer';
import { IMmpStatement } from './MmpStatement';


export class MmpAllowDiscouraged implements IMmpStatement {

	constructor(private dollarStatementKeyword: MmToken) {
	}

	toText() {
		const text: string = this.dollarStatementKeyword.value;
		return text;
	}
}
