import { DisjointVarMap } from '../mm/DisjointVarMap';
import { MmLexer, MmToken } from '../grammar/MmLexer';
import { WorkingVars } from '../mmp/WorkingVars';
import { Range } from 'vscode-languageserver';
import { MmpDisjVarStatement } from "../mmp/MmpDisjVarStatement";

export interface ILabeledStatementSignature {
	label: MmToken | undefined
	formula: MmToken[] | undefined
	rangeIfBothLabelAndFormulaAreEmpty?: Range;
}

/** this interface is used by the TheoremCoherenceChecker to check if the current theorem
 * is coherent w.r.t. the same theory already in the current theory. At the time of writing, it is used
 * both from the MmtSaver (reads a .mmt file and produces a ITheoremSignature that is then checked against the 
 * same theorem in the theory) and the MmpParser (to produce Diagnositcs if the current .mmp is not coherent with the
 * same theorem in the theory)
*/
export interface ITheoremSignature {
	disjVarMmpStatements: MmpDisjVarStatement[]  // used to produce located Diagnostics (because it contains MmToken's)
	disjVars: DisjointVarMap
	eHyps: ILabeledStatementSignature[]
	pStatement: ILabeledStatementSignature | undefined
}

/** parses a .mmt file, for the sole purpose of checking if a theorem with
 * the same label already exists in the theory (and then see if it is coherent).
 * Thus, the comment is read, but not returned
 */
export class MmtParser {
	// private mmParser: MmParser;

	// constructor(mmParser: MmParser) {
	// 	this.mmParser = mmParser;
	// }
	// addTheorem(fileContent: string) {
	// 	this.mmParser.ParseText(fileContent);
	// }

	/** parse result */
	theorem: ITheoremSignature | undefined;

	/** true iff the .mmt content was not parsable */
	parseFailed: boolean;


	private _text: string;
	private _previousCharMayBeLabel: MmToken | undefined;

	private mmLexer: MmLexer;

	private _disjVarUStatementTokens: MmpDisjVarStatement[]
	private _disjVars: DisjointVarMap;
	private _eHyps: ILabeledStatementSignature[];
	private _pStatement: ILabeledStatementSignature | undefined;


	constructor(text: string) {
		this.parseFailed = false;
		this._text = text;
		this.mmLexer = new MmLexer(new WorkingVars(new Map<string, string>()));
		this._disjVarUStatementTokens = [];
		this._disjVars = new DisjointVarMap();
		this._eHyps = [];
		// this._previousCharMayBeLabel = "";

		// this.theorem = {
		// 	disjVars: new Set<DisjVarUStatement>(),
		// 	eHyps: [],
		// 	pStatement: 
		// }
	}
	//#region parse
	//#region addStatement
	readStatement(lastChar: string): MmToken[] {
		const statement: MmToken[] = [];
		let token: MmToken | undefined = this.mmLexer.next();
		while (token?.value != lastChar && !this.parseFailed) {
			if (token == undefined) {
				this.parseFailed = true;
				// throw new Error("EOF before $.");
			}
			else
				statement.push(token);
			token = this.mmLexer.next();
		}
		return statement;
	}
	addDisjVarConstraint() {
		const statement: MmToken[] = this.readStatement('$.');
		// const disjVarUStatement: DisjVarUStatement = new DisjVarUStatement(statement[0], statement[1]);
		for (let i = 0; i < statement.length; i++) {
			for (let j = i + 1; j < statement.length; j++) {
				this._disjVars.add(statement[i].value, statement[j].value);
			}
		}
		const disjVarUStatement: MmpDisjVarStatement = new MmpDisjVarStatement(statement);
		this._disjVarUStatementTokens.push(disjVarUStatement);
	}
	private addEStatement() {
		const formula: MmToken[] = this.readStatement('$.');
		const eHyp: ILabeledStatementSignature = {
			label: this._previousCharMayBeLabel,
			formula: formula
		};
		this._eHyps.push(eHyp);
	}
	addPStatement() {
		const formula: MmToken[] = this.readStatement('$=');
		this._pStatement = {
			label: this._previousCharMayBeLabel,
			formula: formula
		};
	}
	//TODO this.readComment(); is probably not even needed
	//the comment is consumed, but it is not assigned, because
	readComment(): string[] {
		const statement: string[] = [];
		let token: MmToken | undefined = this.mmLexer.next();
		while (token?.value != '$)' && !this.parseFailed) {
			if (token == undefined) {
				this.parseFailed = true;
				// throw new Error("EOF before $.");
			}
			else
				statement.push(token?.value);
			token = this.mmLexer.next();
		}
		return statement;
	}
	addStatement() {
		const currentToken: MmToken | undefined = this.mmLexer.next();
		if (currentToken?.value == '$d')
			this.addDisjVarConstraint();
		else if (currentToken?.value == '$e')
			this.addEStatement();
		//TODO this.readComment(); is probably not even needed
		// else if (currentToken == '$(')
		// 	this.readComment();
		else if (currentToken?.value == '$p')
			this.addPStatement();
		else if (currentToken != undefined)
			this._previousCharMayBeLabel = currentToken;
	}
	//#endregion addStatement
	parse() {
		this.mmLexer.reset(this._text);
		while (this.mmLexer.current() != undefined)
			this.addStatement();
		if (!this.parseFailed)
			this.theorem = {
				disjVarMmpStatements: this._disjVarUStatementTokens,
				disjVars: this._disjVars,
				eHyps: this._eHyps,
				pStatement: <ILabeledStatementSignature>this._pStatement
			};
	}
	//#endregion parse
}