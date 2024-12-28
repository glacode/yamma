import { MmParserEvents, MmParser, AssertionParsedArgs } from '../mm/MmParser';
import { TopologicalSort } from './TopologicalSort';
import url = require('url');
import * as path from "path";
import * as fs from 'fs';
import { ITheoremSignature, MmtParser } from './MmtParser';
import { ProvableStatement } from "../mm/ProvableStatement";
import { LabeledStatement } from "../mm/LabeledStatement";
import { TheoremCoherenceChecker } from './TeoremCoherenceChecker';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver';
import { dummyRange, oneCharacterRange } from '../mm/Utils';
import { MmStatistics } from '../mm/MmStatistics';
import { GlobalState } from '../general/GlobalState';

enum MmtLoaderErrorCode {
	ciclycMmtTheorems = 'ciclycMmtTheorems'
}

export class MmtLoader {
	textDocumentPath: string;
	mmParser: MmParser;

	diagnostics: Diagnostic[];

	/** maps every .mmt uri to its diagnostics */
	diagnosticsMap: Map<string, Diagnostic[]> = new Map<string, Diagnostic[]>();
	loadFailed: boolean;

	/** used to allow testing */
	mmStatistics: MmStatistics | undefined;

	private _dirname: string;

	constructor(textDocumentPath: string, mmParser: MmParser, private globalState?: GlobalState) {
		this.textDocumentPath = textDocumentPath;
		this.mmParser = mmParser;

		this.diagnostics = [];

		this.loadFailed = false;

		this._dirname = path.dirname(textDocumentPath);
	}

	//#region loadMmt

	//#region theoremLabelsInLoadOrder

	/** if the graph of dependencies is acyclic, it returns file names in topological order;
	 * if the graph is not acyclic, it returns undefined*/
	computeLoadOrder(dependencies: Map<string, Set<string>>): string[] | undefined {
		const topologicalSort: TopologicalSort<string> = new TopologicalSort<string>(dependencies);
		const result: string[] | undefined = topologicalSort.sort();
		return result;
	}

	//#region readDependencyGraph

	//#region readGlobalDependencies

	//#region addGlobalDependenciesForSingleFile
	protected addGlobalDependenciesForSingleTheorem(theorem: string, globalDependencies: Map<string, Set<string>>) {
		const theoremArray: string[] = theorem.split((/\s+/));
		const endOfCommentIndex: number = theoremArray.indexOf('$)');
		const indexOfPidentifier: number = theoremArray.indexOf('$p', endOfCommentIndex);
		if (indexOfPidentifier > 1) {
			// the $p statement has been found
			const theoremName: string = theoremArray[indexOfPidentifier - 1];
			const indexWhereProofBegins: number = theoremArray.indexOf('$=', endOfCommentIndex);
			// const indexForLeftParenthesisBeforeLabelList: number = theoremArray.indexOf('(', endOfCommentIndex);
			const indexForRightParenthesisAfterLabelList: number = theoremArray.indexOf(')', indexWhereProofBegins);
			// const labelList: string = theorem.substring(indexForLeftParenthesisBeforeLabelList + 1, indexForRightParenthesisAfterLabelList);
			const globalDependencyArray: string[] = theoremArray.slice(
				indexWhereProofBegins + 2, indexForRightParenthesisAfterLabelList);
			const globalDependencySet: Set<string> = new Set<string>(globalDependencyArray);
			globalDependencies.set(theoremName, globalDependencySet);
		}
	}
	private readMmtFile(fileName: string): string {
		const mmFilePath = path.join(this._dirname, fileName);
		const theorem: string = fs.readFileSync(mmFilePath, 'utf-8');
		return theorem;
	}

	private addGlobalDependenciesForSingleFile(fileName: string, globalDependencies: Map<string, Set<string>>) {
		// const mmFilePath = path.join(this._dirname, fileName + '.mmt');
		const theorem: string = this.readMmtFile(fileName);
		this.addGlobalDependenciesForSingleTheorem(theorem, globalDependencies);
	}
	//#endregion addGlobalDependenciesForSingleFile

	/** reads all dependencies in the .mmt files, even those w.r.t. theorems that are not proven
	 * in the .mmt files
	 */
	private readGlobalDependenciesInMustFollowForm(): Map<string, Set<string>> {
		const mustFollow: Map<string, Set<string>> = new Map<string, Set<string>>();
		const fileNames: string[] = fs.readdirSync(this._dirname);
		fileNames.forEach((fileName: string) => {
			if (path.extname(fileName) == '.mmt')
				this.addGlobalDependenciesForSingleFile(fileName, mustFollow);
		});
		return mustFollow;
	}
	//#region restrictToLocalMmtDependencies
	private addLocalMmtDependencyInMustPrecedeForm(mustPrecede: string, theorem: string, localDependenciesInMustFollowForm: Map<string, Set<string>>) {
		let mustFollow = localDependenciesInMustFollowForm.get(mustPrecede);
		if (mustFollow == undefined) {
			// this is the first dependency for mustPrecede
			mustFollow = new Set<string>();
			localDependenciesInMustFollowForm.set(mustPrecede, mustFollow);
		}
		mustFollow.add(theorem);
	}
	protected restrictToLocalMmtDependenciesInMustPrecedeForm(globalDependenciesInMustFollowForm: Map<string, Set<string>>): Map<string, Set<string>> {
		const localDependenciesInMustPrecedeForm: Map<string, Set<string>> = new Map<string, Set<string>>();
		for (const [mustFollow, mustpPrecede] of globalDependenciesInMustFollowForm) {
			if (localDependenciesInMustPrecedeForm.get(mustFollow) == undefined)
				// theorem has not yet been added to the theorems could be depended on; we add it here,
				// to add also those theorems that are not a prerequisite for any other theorem
				localDependenciesInMustPrecedeForm.set(mustFollow, new Set<string>());
			mustpPrecede.forEach((mustPrecede: string) => {
				if (globalDependenciesInMustFollowForm.get(mustPrecede) != undefined)
					// mustPrecede is a theorem proven in a .mmt file
					this.addLocalMmtDependencyInMustPrecedeForm(mustPrecede, mustFollow, localDependenciesInMustPrecedeForm);
			});
		}
		return localDependenciesInMustPrecedeForm;
	}
	//#endregion restrictToLocalMmtDependencies
	//#endregion readGlobalDependencies
	/**
	 * reads all .mmt file in the folder and build a dependency graph
	 */
	private readDependencyGraph(): Map<string, Set<string>> {
		const globalDependencies: Map<string, Set<string>> = this.readGlobalDependenciesInMustFollowForm();
		const dependencyGraph: Map<string, Set<string>> = this.restrictToLocalMmtDependenciesInMustPrecedeForm(globalDependencies);
		return dependencyGraph;
	}
	//#endregion readDependencyGraph


	private theoremLabelsInLoadOrder(): string[] | undefined {
		const dependencyGraph: Map<string, Set<string>> = this.readDependencyGraph();
		const loadOrder: string[] | undefined = this.computeLoadOrder(dependencyGraph);
		return loadOrder;
	}
	//#endregion theoremLabelsInLoadOrder

	//#region loadFiles
	addDiagnosticsForUri(fileUri: string, diagnostics: Diagnostic[]) {
		let diagnosticsForSingleFile: Diagnostic[] | undefined = this.diagnosticsMap.get(fileUri);
		if (diagnosticsForSingleFile == undefined) {
			// this is the first diagnostic, for this .mmt file
			diagnosticsForSingleFile = [];
			this.diagnosticsMap.set(fileUri, diagnosticsForSingleFile);
		}
		diagnosticsForSingleFile.push(...diagnostics);
	}
	private addDiagnostics(fileName: string, diagnostics: Diagnostic[]) {
		const filePath: string = path.join(this._dirname, fileName);
		const fileUri: string = url.pathToFileURL(filePath).href;
		this.addDiagnosticsForUri(fileUri, diagnostics);
	}
	protected tryToAddTheoremToTheory(fileName: string, fileContent: string) {
		this.mmParser.diagnostics = [];
		// the following line is used for cases when the MmParser was partially successful
		const isParseFailed = this.mmParser.parseFailed;
		this.mmParser.parseFailed = false;
		this.mmParser.ParseText(fileContent);
		if (this.mmParser.parseFailed) {
			// mmParser found errors, parsing fileContent
			this.loadFailed = true;
			this.diagnostics.push(...this.mmParser.diagnostics);
			this.addDiagnostics(fileName, this.mmParser.diagnostics);
		}
		this.mmParser.parseFailed = isParseFailed;
	}

	//#region canTheoremBeAdded
	getDefaultRangeForDiagnostic(theorem: ITheoremSignature): Range {
		let range: Range = oneCharacterRange({ line: 0, character: 0 });
		if (theorem.pStatement != undefined && theorem.pStatement.label != undefined)
			range = theorem.pStatement.label.range;
		return range;
	}
	isTheoremCoherent(theorem: ITheoremSignature, labeledStatement: ProvableStatement): boolean {
		const defaultRangeForDiagnostics: Range = this.getDefaultRangeForDiagnostic(theorem);
		const theoremCoherenceChecker: TheoremCoherenceChecker = new TheoremCoherenceChecker(
			theorem, labeledStatement, defaultRangeForDiagnostics, this.diagnostics);
		theoremCoherenceChecker.checkCoherence();
		const isCoherent: boolean = <boolean>theoremCoherenceChecker.isTheoremCoherent;
		return isCoherent;
	}
	canTheoremBeAdded(fileContent: string): boolean {
		let canBeAdded = false;
		const mmtParser: MmtParser = new MmtParser(fileContent);
		mmtParser.parse();
		if (!mmtParser.parseFailed && mmtParser.theorem != undefined &&
			mmtParser.theorem.pStatement?.label != undefined) {
			const labeledStatement: LabeledStatement | undefined =
				this.mmParser.labelToStatementMap.get(mmtParser.theorem.pStatement.label.value);
			if (labeledStatement == undefined)
				// the theorem is not in the theory
				canBeAdded = true;
			// the theorem is already in the theory
			else if (labeledStatement instanceof ProvableStatement)
				canBeAdded = this.isTheoremCoherent(mmtParser.theorem, labeledStatement);
			// else
			// 	// the label for the theorem is already present, but it is not a ProvableStatement
			// 	// TODO since this is an error, consider adding a Diagnostic
			// 	canBeAdded = false;
		}
		return canBeAdded;
	}
	//#endregion canTheoremBeAdded

	private loadFile(fileName: string) {
		const fileContent: string = this.readMmtFile(fileName);
		const canBeAdded: boolean = this.canTheoremBeAdded(fileContent);
		if (canBeAdded)
			this.tryToAddTheoremToTheory(fileName, fileContent);
	}
	private loadFiles(theoremLabelsInLoadOrder: string[]) {
		theoremLabelsInLoadOrder.forEach((theoremLabel: string) => {
			if (!this.loadFailed)
				// TODO we stop if a single file failed to be load, see
				// if it's better to load all those that can be loaded
				console.log(theoremLabel);
				this.loadFile(theoremLabel + '.mmt');
		});
	}
	//#endregion loadFiles

	private completeDataForStatement(newAssertionParams: AssertionParsedArgs): void {
		const labeledStatement: LabeledStatement = newAssertionParams.labeledStatement;
		const mmParser: MmParser = newAssertionParams.mmParser;
		const isNonSyntaxAssertion = mmParser.labelToNonSyntaxAssertionMap.
			get(labeledStatement.Label) != undefined;
		if (isNonSyntaxAssertion && !labeledStatement.isParseNodeDefined)
			labeledStatement.parseNode;
	}

	private addDiagnosticError(message: string, range: Range, code: MmtLoaderErrorCode, diagnostics: Diagnostic[]) {
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Error,
			message: message,
			range: range,
			code: code
		};
		diagnostics.push(diagnostic);
	}

	private updateStatistics() {
		if (this.globalState != undefined)
			MmStatistics.updateStatistics(this.mmParser, this.globalState);
	}

	/** loads all the .mmt file found in the current folder */
	loadMmt() {
		const theoremLabelsInLoadOrder: string[] | undefined = this.theoremLabelsInLoadOrder();
		if (theoremLabelsInLoadOrder != undefined) {
			this.mmParser.on(MmParserEvents.newAxiomStatement, this.completeDataForStatement);
			this.mmParser.on(MmParserEvents.newProvableStatement, this.completeDataForStatement);
			this.loadFiles(theoremLabelsInLoadOrder);
			this.mmParser.off(MmParserEvents.newAxiomStatement, this.completeDataForStatement);
			this.mmParser.off(MmParserEvents.newProvableStatement, this.completeDataForStatement);
			this.updateStatistics();
		}
		else {
			this.loadFailed;
			const message = 'There is a cycle in the .mmt theorems, thus the theory can not be updated';
			const range: Range = dummyRange;
			//TODO1 mar 11 add this to the diagnosticsMap, also
			this.addDiagnosticError(message, range, MmtLoaderErrorCode.ciclycMmtTheorems, this.diagnostics);
		}
		// if (this.loadFailed && this.diagnostics.length > 0)
		// 	notifyError();

	}
	//#endregion loadMmt
}

