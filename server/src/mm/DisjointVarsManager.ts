import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { BlockStatement } from './BlockStatement';
import { DisjointVarMap } from './DisjointVarMap';
import { GrammarManager } from '../grammar/GrammarManager';
import { MmToken } from '../grammar/MmLexer';
import { MmpParserErrorCode, MmpParserWarningCode } from '../mmp/MmpParser';
import { MmpValidator } from '../mmp/MmpValidator';
import { InternalNode } from '../grammar/ParseNode';
import { AssertionStatement } from "./AssertionStatement";
import { UProof } from '../mmp/UProof';

export interface DataFieldForMissingDjVarConstraintsDiagnostic {
	missingDisjVar1: string
	missingDisjVar2: string
	// missingDjVarConstraints: DisjVarUStatement,

}

// export interface DiagnosticFormissingDjVarConstraints extends Diagnostic {
// missingDjVarConstraints: DisjVar,
// uProof: UProof
// }



export class DisjointVarsManager {
	assertion: AssertionStatement;
	substitution: Map<string, InternalNode>;
	outermostBlock: BlockStatement;
	produceDiagnostics: boolean;
	stepLabelToken?: MmToken;
	stepRef?: string;
	uProof?: UProof;


	diagnostics: Diagnostic[];

	/** true iff the last checkSingleDisjVarsPair() found a disj var constraint violation */
	foundDisjVarsConstraintViolation: boolean;

	/** the missing disjoint constraints, computed by the last call to
	 *  checkMissingDisjVarsConstraints() */
	missingDisjVarConstraints: DisjointVarMap | undefined;

	constructor(assertion: AssertionStatement, substitution: Map<string, InternalNode>,
		outermostBlock: BlockStatement, produceDiagnostics: boolean,
		stepLabelToken?: MmToken, stepRef?: string, uProof?: UProof) {
		this.assertion = assertion;
		this.substitution = substitution;
		this.outermostBlock = outermostBlock;
		this.produceDiagnostics = produceDiagnostics;
		this.stepLabelToken = stepLabelToken;
		this.stepRef = stepRef;
		this.uProof = uProof;

		this.foundDisjVarsConstraintViolation = false;
		this.diagnostics = [];
	}

	//#region checkDisjVarsConstraintsViolation

	//#region checkSingleDisjVarsPair

	//#region checkDisjVarsForTwoNodes
	// private addDiagnosticForCommonVariable(disjVar: DisjVarUStatement, var1: MmToken, var2: MmToken,
	private addDiagnosticForCommonVariable(var1: string, var2: string, token1: MmToken, token2: MmToken,
		strSubstitution1: string, strSubstitution2: string) {
		if (this.stepLabelToken != undefined) {
			// the method has been called by the MmpParser; only in this case
			// Diagnostics have to be computed
			const stepRefForErrorMessage: string = (this.stepRef != undefined ? this.stepRef : "with empty ref");
			const errorMessage = `Step ${stepRefForErrorMessage}: Label ax-5: DjVars restriction violated: \n` +
				`the step lists <${var1} ${var2}> as a DjVars restriction, but ` +
				`the substitution for ${var1} is '${strSubstitution1}' and ` +
				`the substitution for ${var2} is '${strSubstitution2}': thus, ` +
				`the two substitutions share the variable ${token1.value}`;
			MmpValidator.addDiagnosticError(errorMessage, this.stepLabelToken.range,
				MmpParserErrorCode.djVarsRestrictionViolated, this.diagnostics);
			MmpValidator.addDiagnosticError(errorMessage, token1.range,
				MmpParserErrorCode.djVarsRestrictionViolated, this.diagnostics);
			MmpValidator.addDiagnosticError(errorMessage, token2.range,
				MmpParserErrorCode.djVarsRestrictionViolated, this.diagnostics);
		}
	}
	// private checkDisjVarsForTwoNodes(disjVar: DisjVarUStatement, substitution1: InternalNode, substitution2: InternalNode) {
	private checkDisjVarsForTwoNodes(var1: string, var2: string, substitution1: InternalNode, substitution2: InternalNode) {
		const logicalVariables = this.outermostBlock.v;
		const varsInSubstitution1: Set<MmToken> = substitution1.mmTokensContaining(logicalVariables);
		const varsInSubstitution2: Set<MmToken> = substitution2.mmTokensContaining(logicalVariables);
		const strSubstitution1: string = GrammarManager.buildStringFormula(substitution1);
		const strSubstitution2: string = GrammarManager.buildStringFormula(substitution2);
		varsInSubstitution1.forEach((token1: MmToken) => {
			varsInSubstitution2.forEach((token2: MmToken) => {
				if (token1.value == token2.value) {
					this.foundDisjVarsConstraintViolation = true;
					// this.addDiagnosticForCommonVariable(disjVar, token1, token2, strSubstitution1, strSubstitution2);
					this.addDiagnosticForCommonVariable(var1, var2, token1, token2, strSubstitution1, strSubstitution2);
				}
			});
		});
		// //TODO check performance for this statement
		// const commonVars: Set<string> =
		// 	new Set([...varsInSubstitution1].filter(x => varsInSubstitution2.has(x)));
		// this.addDiagnosticForEachCommonVar(commonVars);
	}
	//#endregion checkDisjVarsForTwoNodes

	// private checkSingleDisjVarsPair(disjVar: DisjVarUStatement) {
	private checkSingleDisjVarsPair(var1: string, var2: string) {
		const substitution1: InternalNode | undefined = this.substitution.get(var1);
		const substitution2: InternalNode | undefined = this.substitution.get(var2);
		if (substitution1 != undefined && substitution2 != undefined)
			// the two vars (required to be disjoint) both have a valid substitution
			// this.checkDisjVarsForTwoNodes(disjVar, substitution1, substitution2);
			this.checkDisjVarsForTwoNodes(var1, var2, substitution1, substitution2);
	}
	//#endregion checkSingleDisjVarsPair

	checkDisjVarsConstraintsViolation() {
		this.foundDisjVarsConstraintViolation = false;
		// this.assertion.frame?.disjVars.forEach((disjVar: DisjVarUStatement) => {
		// 	this.checkSingleDisjVarsPair(disjVar);
		// });
		this.assertion.frame?.disjVars.map.forEach((vars2: Set<string>, var1: string) => {
			vars2.forEach((var2: string) => {
				this.checkSingleDisjVarsPair(var1, var2);
			});
		});
	}
	//#endregion checkDisjVarsConstraintsViolation


	//#region checkMissingDisjVarsConstraints

	//#region getMissingDisjVarConstraints
	addDisjVarsConstraintForCurrentNodes(parseNode1: InternalNode, parseNode2: InternalNode,
		uProof: UProof, missingDisjVarConstraints: DisjointVarMap) {
		const varsInNode1: Set<string> = parseNode1.symbolsSubsetOf(this.outermostBlock.v);
		const varsInNode2: Set<string> = parseNode2.symbolsSubsetOf(this.outermostBlock.v);
		varsInNode1.forEach((var1: string) =>
			varsInNode2.forEach((var2: string) => {
				if (var1 != var2 && !uProof.containsDjVarStatement(var1, var2))
					missingDisjVarConstraints.add(var1, var2);
			}));
	}
	private getMissingDisjVarConstraints(uProof: UProof): DisjointVarMap {
		const missingDisjVarConstraints: DisjointVarMap = new DisjointVarMap();
		// this.assertion.frame?.disjVars.forEach((disjVar: DisjVarUStatement) => {
		// 	const parseNode1: InternalNode | undefined = this.substitution.get(disjVar.var1);
		// 	const parseNode2: InternalNode | undefined = this.substitution.get(disjVar.var2);
		// 	if (parseNode1 != undefined && parseNode2 != undefined)
		// 		this.addDisjVarsConstraintForCurrentNodes(parseNode1, parseNode2, uProof, missingDisjVarConstraints);

		// });
		this.assertion.frame?.disjVars.map.forEach((vars2: Set<string>, var1: string) => {
			vars2.forEach((var2: string) => {
				const parseNode1: InternalNode | undefined = this.substitution.get(var1);
				const parseNode2: InternalNode | undefined = this.substitution.get(var2);
				if (parseNode1 != undefined && parseNode2 != undefined)
						this.addDisjVarsConstraintForCurrentNodes(parseNode1, parseNode2, uProof, missingDisjVarConstraints);
			});
		});
		return missingDisjVarConstraints;
	}
	//#endregion getMissingDisjVarConstraints

	//#region addDiagnosticsForMissingDjVarConstraints
	addMissingDjVarConstraint(var1: string, var2: string) {
		//Step 59: Substitution (to) vars subject to DjVars restriction by proof step but
		//not listed as DjVars in theorem to be proved: [<j,ph>, <M,j>, <Z,j>]
		//TODO you can add a more detailed message if you use the original logical vars and the
		//substitution
		const message = `Substitution (to) vars subject to DjVars restriction by proof step but ` +
			`not listed as DjVars in theorem to be proved: <${var1},${var2}>`;
		const dataFieldForMissingDjVarConstraintsDiagnostic: DataFieldForMissingDjVarConstraintsDiagnostic = {
			// missingDjVarConstraints: new DisjVarUStatement(var1, var2),
			missingDisjVar1: var1,
			missingDisjVar2: var2
		};
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			message: message,
			range: this.stepLabelToken!.range,
			code: MmpParserWarningCode.missingDjVarsStatement,
			data: dataFieldForMissingDjVarConstraintsDiagnostic
		};
		this.diagnostics.push(diagnostic);
	}
	private addDiagnosticsForMissingDjVarConstraints(missingDisjVarConstraints: DisjointVarMap) {
		missingDisjVarConstraints.map.forEach((vars2: Set<string>, var1: string) => {
			vars2.forEach((var2: string) => {
				this.addMissingDjVarConstraint(var1, var2);
			});
		});
	}
	//#endregion addDiagnosticsForMissingDjVarConstraints

	/** a Diagnostic is added when two vars are in the respective substitution of two
	 * mandatory vars (for the assertion in the constructor)
	 */
	checkMissingDisjVarsConstraints(uProof: UProof) {
		// const mandatoryVars: Set<string> = this.assertion.mandatoryVars(this.outermostBlock);
		// const missingDisjVarConstraints: DisjointVarMap = this.getMissingDisjVarConstraints(uProof);
		this.missingDisjVarConstraints = this.getMissingDisjVarConstraints(uProof);
		if (this.stepLabelToken != undefined)
			// the method has been called by the MmpParser; only in this case
			// Diagnostics have to be computed
			this.addDiagnosticsForMissingDjVarConstraints(this.missingDisjVarConstraints);

	}
	//#endregion checkMissingDisjVarsConstraints

}