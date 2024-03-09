import { Grammar } from 'nearley';
import { Diagnostic, Position, TextEdit } from 'vscode-languageserver';
import { BlockStatement } from '../mm/BlockStatement';
import { MmpParser } from './MmpParser';
import { MmpProof } from './MmpProof';
import { WorkingVars } from './WorkingVars';
import { MmpProofTransformer } from './MmpProofTransformer';
import { IMmpStatement, UProofStatementStep } from './MmpStatement';
import { UProofStatement } from "./UProofStatement";
import { ProofMode } from '../mm/ConfigurationManager';
import { Parameters } from '../general/Parameters';
import { consoleLogWithTimestamp } from '../mm/Utils';
import { MmpPackedProofStatement } from './proofCompression/MmpPackedProofStatement';
import { IMmpCompressedProofCreator, MmpCompressedProofCreatorFromPackedProof } from './proofCompression/MmpCompressedProofCreator';
import { MmpSortedByReferenceWithKnapsackLabelMapCreator } from './proofCompression/MmpSortedByReferenceWithKnapsackLabelMapCreator';

interface MmpUnifierArgs {
	mmpParser: MmpParser;
	proofMode: ProofMode;
	maxNumberOfHypothesisDispositionsForStepDerivation: number;
	renumber?: boolean;
	expectedTheoremLabel?: string;
	leftMarginForCompressedProof?: number;
	characterPerLine?: number;
	mmpCompressedProofCreator?: IMmpCompressedProofCreator;
}

// Parser for .mmp files
export class MmpUnifier {
	mmpParser: MmpParser;

	outermostBlock: BlockStatement;
	grammar: Grammar;
	workingVars: WorkingVars;
	proofMode: ProofMode;
	private maxNumberOfHypothesisDispositionsForStepDerivation: number;

	private renumber?: boolean
	private expectedTheoremLabel?: string
	private leftMarginForCompressedProof?: number
	private characterPerLine?: number

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

	private _charactersPerLine: number;
	private _mmpCompressedProofCreator: IMmpCompressedProofCreator;


	//#region constructor
	// constructor(mmpParser: MmpParser, proofMode: ProofMode,
	// 	maxNumberOfHypothesisDispositionsForStepDerivation: number,
	// 	private renumber?: boolean, private expectedTheoremLabel?: string,
	// 	private leftMarginForCompressedProof?: number,
	// 	private characterPerLine?: number,
	// 	mmpCompressedProofCreator?: IMmpCompressedProofCreator) {
	constructor(args: MmpUnifierArgs) {
		this.mmpParser = args.mmpParser;
		this.uProof = args.mmpParser.mmpProof;
		this.outermostBlock = args.mmpParser.outermostBlock;
		this.grammar = args.mmpParser.grammar;
		this.workingVars = args.mmpParser.workingVars;
		this.proofMode = args.proofMode;
		this.maxNumberOfHypothesisDispositionsForStepDerivation = args.maxNumberOfHypothesisDispositionsForStepDerivation;
		this.renumber = args.renumber;
		this.expectedTheoremLabel = args.expectedTheoremLabel;
		this.leftMarginForCompressedProof = args.leftMarginForCompressedProof;
		this.characterPerLine = args.characterPerLine;

		this._charactersPerLine = args.characterPerLine == undefined ? Parameters.charactersPerLine : args.characterPerLine;
		this._mmpCompressedProofCreator = args.mmpCompressedProofCreator != undefined ? args.mmpCompressedProofCreator :
			// new MmpCompressedProofCreatorFromUncompressedProof();
			// new MmpCompressedProofCreatorFromPackedProof(new MmpSortedByReferenceLabelMapCreator());
			new MmpCompressedProofCreatorFromPackedProof(new MmpSortedByReferenceWithKnapsackLabelMapCreator(4, 79));
		// new MmpCompressedProofCreatorFromPackedProof();

		// this.textLastLine = this.uProof!.lastMmpProofStep != undefined ?
		// 	this.uProof!.lastMmpProofStep!.range.end.line + 3000 : 3000;
		this.textLastLine = 1000000;
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
			consoleLogWithTimestamp('buildProofStatementIfProofIsComplete begin');
			if (this.proofMode == ProofMode.normal) {
				const proofArray: UProofStatementStep[] = <UProofStatementStep[]>uProof.lastMmpProofStep.proofArray(this.outermostBlock);
				const proofStatement: UProofStatement = new UProofStatement(proofArray, this._charactersPerLine);
				uProof.insertProofStatement(proofStatement);
			} else if (this.proofMode == ProofMode.packed) {
				//TODO1 28 LUG 2023 use parameters in place of 3, 80
				const proofStatement: MmpPackedProofStatement = new MmpPackedProofStatement(uProof, 80);
				uProof.insertProofStatement(proofStatement);
			} else {
				// this.proofMode == ProofMode.compressed
				const proofStatement: IMmpStatement = this._mmpCompressedProofCreator.createMmpCompressedProof(
					uProof, this.leftMarginForCompressedProof, this.characterPerLine);
				// this.labelSequenceCreator);
				uProof.insertProofStatement(proofStatement);
			}
			consoleLogWithTimestamp('buildProofStatementIfProofIsComplete end');
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
			this.renumber, this.expectedTheoremLabel);
		uProofTransformer.transformUProof();
		this.buildProofStatementIfProofIsComplete(this.uProof!);
		this.textEditArray = this.buildTextEditArray(uProofTransformer.uProof);
	}
	//#endregion unify
}
