import { Grammar } from 'nearley';
import { Diagnostic, Position, TextEdit } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
import { MmpParser } from './MmpParser';
import { MmpProof } from './MmpProof';
import { WorkingVars } from './WorkingVars';
import { MmpProofTransformer } from './MmpProofTransformer';
import { UProofStatementStep } from './MmpStatement';
import { UProofStatement } from "./UProofStatement";
import { ProofMode } from '../mm/ConfigurationManager';
import { UCompressedProofStatement } from './UCompressedProofStatement';

// export interface UnifyResult {
// 	diagnostics: Diagnostic[]
// 	textEditArray: TextEdit[]
// }

// Parser for .mmp files
export class MmpUnifier {
	mmpParser: MmpParser;

	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	proofMode: ProofMode;
	private maxNumberOfHypothesisDispositionsForStepDerivation: number;

	/** the final proof produced with by the unify() method */
	uProof: MmpProof | undefined

	protected textLastLine: number;


	// the list of statements, after createMmpStatements() has been invoked
	// mmpStatements: MmpStatement[] = []
	// maps each proof step id to the proof step,  after createMmpStatements() has been invoked
	// refToProofStepMap: Map<string, MmpProofStep>;
	// the list of diagnostics, after createMmpStatements() has been invoked
	diagnostics: Diagnostic[] = []
	// the list of TextEdit, after createMmpStatements() has been invoked
	textEditArray: TextEdit[] = []

	/** true iff the last unify() threw an exceptio*/
	thrownError: boolean;


	//#region constructor
	constructor(mmpParser: MmpParser, proofMode: ProofMode,
		maxNumberOfHypothesisDispositionsForStepDerivation: number,
		private renumber?: boolean) {
		// this.textDocument = textDocument
		this.mmpParser = mmpParser;
		this.uProof = mmpParser.mmpProof;
		this.outermostBlock = mmpParser.outermostBlock;
		this.grammar = mmpParser.grammar;
		this.workingVars = mmpParser.workingVars;
		this.proofMode = proofMode;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;

		//TODO use the range of the last actual statement (now I can't, because not all statements implement
		//the range property (see interface IMmpStatementWithRange and interface interface IUStatement)
		this.textLastLine = this.uProof!.lastMmpProofStep!.range.end.line + 3000;
		this.thrownError = false;
	}

	//#region buildUstatements
	// parse(textToParse: string): MmpParser {
	// 	const mmpParser: MmpParser = new MmpParser(textToParse, this.labelToStatementMap, this.outermostBlock,
	// 		this.grammar, this.workingVars);
	// 	mmpParser.parse();
	// 	return mmpParser;
	// }
	// protected buildUProof(textToParse: string): UProof {
	// 	const mmpParser: MmpParser = this.parse(textToParse);
	// 	const uProof: UProof = <UProof>mmpParser.uProof;
	// 	return uProof;
	// }
	//#endregion buildUstatements


	buildTextEditArray(newUProof: MmpProof): TextEdit[] {
		const newText: string = newUProof.toText();
		const start: Position = { line: 0, character: 0 };
		// end just needs to be larger than the previous text
		// const end: Position = { line: newText.length, character: newText.length };
		const end: Position = { line: this.textLastLine, character: 0 };
		const textEdit: TextEdit = {
			newText: newText,
			range: { start: start, end: end }
		};
		const textEdits: TextEdit[] = [textEdit];
		return textEdits;
	}

	buildProofStatementIfProofIsComplete(uProof: MmpProof) {
		if (uProof.lastMmpProofStep?.stepRef == 'qed' && uProof.lastMmpProofStep.isProven) {
			if (this.proofMode == ProofMode.normal) {
				const proofArray: UProofStatementStep[] = <UProofStatementStep[]>uProof.lastMmpProofStep.proofArray(this.outermostBlock);
				const proofStatement: UProofStatement = new UProofStatement(proofArray);
				uProof.insertProofStatement(proofStatement);
			} else {
				// this.proofMode == ProofMode.compressed
				const proofStatement: UCompressedProofStatement = new UCompressedProofStatement(uProof);
				uProof.insertProofStatement(proofStatement);
			}
		}
	}

	/**
	 * Unifies textToParse and builds a UProof and a single TextEdit to replace the whole
	 * current document
	 * @param textToParse 
	 */
	unify() {
		//TODO see if this can be faster if done in the MmpParser
		this.uProof!.updateAllWorkingVars();
		const uProofTransformer: MmpProofTransformer = new MmpProofTransformer(
			this.mmpParser, this.maxNumberOfHypothesisDispositionsForStepDerivation,
			this.renumber);
		uProofTransformer.transformUProof();
		this.buildProofStatementIfProofIsComplete(this.uProof!);
		this.textEditArray = this.buildTextEditArray(uProofTransformer.uProof);
	}
	//#endregion unify
}