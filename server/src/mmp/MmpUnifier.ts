import { Grammar } from 'nearley';
import { Diagnostic, Position, TextEdit } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
import { MmpParser } from './MmpParser';
import { UProof } from './UProof';
import { WorkingVars } from './WorkingVars';
import { UProofTransformer } from './UProofTransformer';
import { UProofStatement, UProofStatementStep } from './UStatement';
import { ProofMode } from '../mm/ConfigurationManager';
import { UCompressedProofStatement } from './UCompressedProofStatement';

// export interface UnifyResult {
// 	diagnostics: Diagnostic[]
// 	textEditArray: TextEdit[]
// }

// Parser for .mmp files
export class MmpUnifier {
	// textDocument: TextDocument
	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	proofMode: ProofMode;
	private maxNumberOfHypothesisDispositionsForStepDerivation: number;

	/** the final proof produced with by the unify() method */
	uProof: UProof | undefined


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

	mmpParser: MmpParser;

	//#region constructor
	// constructor(labelToStatementMap: Map<string, LabeledStatement>, outermostBlock: BlockStatement,
	// 	grammar: Grammar, workingVars: WorkingVars, proofMode: ProofMode, mmpParser?: MmpParser) {
	constructor(mmpParser: MmpParser, proofMode: ProofMode, maxNumberOfHypothesisDispositionsForStepDerivation: number) {
		// this.textDocument = textDocument
		this.mmpParser = mmpParser;
		this.uProof = mmpParser.uProof;
		this.outermostBlock = mmpParser.outermostBlock;
		this.grammar = mmpParser.grammar;
		this.workingVars = mmpParser.workingVars;
		this.proofMode = proofMode;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = maxNumberOfHypothesisDispositionsForStepDerivation;

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


	buildTextEditArray(newUProof: UProof): TextEdit[] {
		const newText: string = newUProof.toText();
		const start: Position = { line: 0, character: 0 };
		// end just needs to be larger than the previous text
		const end: Position = { line: newText.length, character: newText.length };
		const textEdit: TextEdit = {
			newText: newText,
			range: { start: start, end: end }
		};
		const textEdits: TextEdit[] = [textEdit];
		return textEdits;
	}

	buildProofStatementIfProofIsComplete(uProof: UProof) {
		if (uProof.lastUProofStep?.stepRef == 'qed' && uProof.lastUProofStep.isProven) {
			if (this.proofMode == ProofMode.normal) {
				const proofArray: UProofStatementStep[] = <UProofStatementStep[]>uProof.lastUProofStep.proofArray(this.outermostBlock);
				const proofStatement: UProofStatement = new UProofStatement(proofArray);
				uProof.insertProofStatement(proofStatement);
			} else {
				// this.proofMode == ProofMode.compressed
				// const proofStatement: UCompressedProofStatement = new UCompressedProofStatement(uProof, this.outermostBlock);
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
		// unify(textToParse: string) {
		// if (this.uProof != undefined)
		// 	this.uProof = this.uProof;
		// else
		// 	this.uProof = this.buildUProof(textToParse);
		//TODO see if this can be faster if done in the MmpParser
		this.uProof!.updateAllWorkingVars();
		const uProofTransformer: UProofTransformer = new UProofTransformer(this.uProof!, this.mmpParser!.mmParser.labelToNonSyntaxAssertionMap,
			this.outermostBlock, this.grammar, this.workingVars,this.maxNumberOfHypothesisDispositionsForStepDerivation);
		// const newUProof: UProof = this.transformUProof(uProof);
		uProofTransformer.transformUProof();
		this.buildProofStatementIfProofIsComplete(this.uProof!);
		// this.textEditArray = this.buildTextEditArray(newUProof);
		this.textEditArray = this.buildTextEditArray(uProofTransformer.uProof);
	}
	//#endregion unify
}