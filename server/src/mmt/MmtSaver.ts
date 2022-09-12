import { ProofMode } from '../mm/ConfigurationManager';
import { MmParser } from '../mm/MmParser';
import { MmpUnifier } from '../mmp/MmpUnifier';
import { UProof } from '../mmp/UProof';
import * as FileSystem from 'fs';
import { DisjVarUStatement } from '../mm/Statements';
import { GrammarManager } from '../grammar/GrammarManager';
import { UProofStep } from '../mmp/UProofStep';
import { IUStatement } from '../mmp/UStatement';


//TODO I had to pass both uri and fsPath, because I've not been able to find a parser that switches
//from one format to the other; the only "place" where I've been able to cleanly get both
// is in the function storeMmtFileCommandHandler() where vscode.window.activeTextEditor.document.uri
// seems to be the only object able to provide both formats the way I need it;
// Furthermore, I had to define the interface PathAndUri both here (in the server) and in the
// client, because they are in different rootDir(s)
// It would be nice to find an object that transforms form uri to path and pass only one of the two,
// but the MmtSaver needs both formats
export interface PathAndUri  {
	uri: string;
	fsPath: string;
}

export class MmtSaver {
	// this is used just to compute the name of the new .mmt file name;
	private textDocumentPath: string;
	// the actual text to parse (it could be different fromt the text in the saved .mmp file, if
	// changes have been applied in the editor, but not saved yet)
	private documentContentInTheEditor: string;
	private mmParser: MmParser;
	// constructor(textDocumentUri: string, mmParser: MmParser) {
	constructor(textDocumentPath: string, documentContentInTheEditor: string, mmParser: MmParser) {
		this.textDocumentPath = textDocumentPath;
		this.documentContentInTheEditor = documentContentInTheEditor;
		this.mmParser = mmParser;
	}

	//#region saveMmt

	//#region tryToCreateTextToBeStored
	buildUProof(mmpContent: string): UProof {
		const mmpUnifier: MmpUnifier =
			new MmpUnifier(this.mmParser.labelToStatementMap, this.mmParser.outermostBlock,
				this.mmParser.grammar, this.mmParser.workingVars, ProofMode.compressed);
		// if (this.mmParser.grammar != undefined) {
		mmpUnifier.unify(mmpContent);
		return mmpUnifier.uProof!;
		// }
	}

	//#region createTextToBeStored

	//#region textForDjConstraints

	//TODO the compare() below assumes that the $d statements have exactly 2 vars. If you will
	// allow more than 2 vars, you will have to change this implementation (the signature is fine)
	/** compares two $d statements in lexical order */
	disjVarCompare(disjVarA: DisjVarUStatement, disjVarB: DisjVarUStatement): number {
		let result: number;
		const disjVarA1: string = disjVarA.disjointVars[0].value;
		const disjVarA2: string = disjVarA.disjointVars[1].value;
		const disjVarB1: string = disjVarB.disjointVars[0].value;
		const disjVarB2: string = disjVarB.disjointVars[1].value;

		// if (disjVarA.var1 < disjVarB.var1 || (disjVarA.var1 == disjVarB.var2 && disjVarA.var1 < disjVarB.var2))
		if (disjVarA1 < disjVarB1 || (disjVarA1 == disjVarB1 && disjVarA2 < disjVarB2))
			// disjVarA preceeds disjVarB
			result = 1;
		else if (disjVarA1 == disjVarB1 && disjVarA2 == disjVarB2)
			// disjVarA and disjVarB are equal
			result = 0;
		else
			// disjVarB preceeds disjVarA
			result = -1;
		return result;
	}
	orderDisjVarUStatements(disjVarUStatements: DisjVarUStatement[]): DisjVarUStatement[] {
		const orderedDisjVarUStatements: DisjVarUStatement[] = Array.from(disjVarUStatements);
		orderedDisjVarUStatements.sort(this.disjVarCompare);
		return orderedDisjVarUStatements;
	}
	/** returns the text for the $d statements in the .mmt file; the statements are produced in lexicographic order */
	private textForDjConstraints(uProof: UProof): string {
		let text = '';
		const orderedSisjVarUStatements: DisjVarUStatement[] = this.orderDisjVarUStatements(uProof.disjVarUStatements);
		if (orderedSisjVarUStatements.length > 0)
			text += "    ";
		orderedSisjVarUStatements.forEach((disjVarUStatement: DisjVarUStatement) => {
			// text += `$d ${disjVarUStatement.var1} ${disjVarUStatement.var2} $. `;
			text += disjVarUStatement.toText();
			text += ' $. ';
		});
		if (text != '') {
			// there is at least a disj var constraint
			text = text.slice(0, -1); // removes the last space
			text += "\n";
		}
		return text;
	}
	//#endregion textForDjConstraints

	//#region textForEStatements
	textForCurrentEHyp(uProofStep: UProofStep): string {
		const label: string = uProofStep.stepLabel!;
		const formula: string = GrammarManager.buildStringFormula(uProofStep.parseNode!);
		const text = `${label} $e ${formula} $.`;
		return text;
	}
	textForEStatements(uProof: UProof): string {
		let text = "";
		uProof.uStatements.forEach((ustatement: IUStatement) => {
			if (ustatement instanceof UProofStep && ustatement.isEHyp) {
				const textForCurrentEHyp: string = this.textForCurrentEHyp(ustatement);
				text += `    ${textForCurrentEHyp}\n`;
			}
		});
		return text;
	}
	//#endregion textForEStatements

	private textForPStatement(uProof: UProof): string {
		// "  test $p |- ( y e. A -> A. x y e. A ) $=\n"
		const theoremLabel: string | undefined = uProof.theoremLabel?.value;
		if (theoremLabel == undefined || theoremLabel == 'example')
			throw new Error("The MmtSaver should never be used if the theorem label is not well defined");
		const qedStatement: UProofStep | undefined = uProof.lastUProofStep;
		if (qedStatement == undefined)
			throw new Error("The MmtSaver should never be used if the qed statement is not present");
		const pFormula: string = GrammarManager.buildStringFormula(qedStatement!.parseNode!);
		const text = `    ${theoremLabel} $p ${pFormula}\n`;
		return text;
	}


	protected createTextToBeStored(uProof: UProof): string | undefined {
		let text = "  ${\n";
		const textForDjConstraints: string = this.textForDjConstraints(uProof);
		text += textForDjConstraints;
		const textForEStatements: string = this.textForEStatements(uProof);
		text += textForEStatements;
		if (uProof.mainComment != undefined) {
			const commentForMmt: string = uProof.mainComment.toText().substring(1).trimStart();
			text += `    $( ${commentForMmt} $)\n`;
		}
		const textForPStatement: string = this.textForPStatement(uProof);
		text += textForPStatement;
		text += "      " + uProof.proofStatement!.toText();
		text += "\n  $}\n";
		return text;
	}
	//#endregion createTextToBeStored

	protected tryToCreateTextToBeStored(mmpContent: string): string | undefined {
		const uProof: UProof = this.buildUProof(mmpContent);
		let textTobeStored: string | undefined;
		if (uProof.proofStatement != undefined)
			// the proof was successfully built
			textTobeStored = this.createTextToBeStored(uProof);
		return textTobeStored;
	}
	//#endregion tryToCreateTextToBeStored

	saveToFile(text: string) {
		// const directory: string = path.dirname(this.textDocumentUri);
		// const fileNameBeforeSuffix = path.basename(this.textDocumentUri);
		const newFileUri: string = this.textDocumentPath.replace('.mmp', '.mmt');

		FileSystem.writeFileSync(newFileUri, text);
	}
	saveMmt() {
		// const mmpContent: string = FileSystem.readFileSync(this.textDocumentUri, 'utf-8');
		// const textToBeStored: string | undefined = this.tryToCreateTextToBeStored(mmpContent);
		const textToBeStored: string | undefined = this.tryToCreateTextToBeStored(this.documentContentInTheEditor);
		if (textToBeStored != undefined)
			// the proof was succesfully built
			//TODO nofify success to the languageClient
			this.saveToFile(textToBeStored);
		//TODO else notify fail to the languageClient
	}
	//#endregion
}