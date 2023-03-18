import { Diagnostic } from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-textdocument';
import { BlockStatement } from './BlockStatement';
import { Frame } from "./Frame";
import { MmParserErrorCode } from './MmParser';
import { ParseError } from '../grammar/ParseErrors';
import { ProofCompressor } from "../mmp/ProofCompressor";
import { Statement, ZIStatement, ZRStatement } from "./Statements";
import { ProvableStatement } from "./ProvableStatement";
import { LabeledStatement } from "./LabeledStatement";
import { AssertionStatement } from "./AssertionStatement";
import { AreArrayTheSame, concatWithSpaces, oneCharacterRange } from "./Utils";
import { FHyp } from './FHyp';
import { EHyp } from './EHyp';
import { MmToken } from '../grammar/MmLexer';

export class Verifier {
    diagnostics: Diagnostic[];
    /** true iff the verify() method fails */
    verificationFailed: boolean;

    constructor(diagnostics: Diagnostic[]) {
        this.diagnostics = diagnostics;
        this.verificationFailed = false;
    }

    private addDiagnosticError(message: string, range: Range, code: MmParserErrorCode) {
        const diagnostic: Diagnostic = {
            message: message,
            range: range,
            code: code
        };
        this.diagnostics.push(diagnostic);
        this.verificationFailed = true;
    }

    //#region verifyDecompressedProof

    //#region verifyAxiomStatement
    fHypsStack(frame: Frame, stack: string[][]): string[][] {
        const stackFHyps: string[][] = [];
        const fHypsCount: number = frame.fHyps.length;
        const eHypsCount: number = frame.eHyps.length;
        //        for (let i = stack.length - fHypsCount; i < stack.length; i++)
        for (let i = stack.length - eHypsCount - fHypsCount;
            i < stack.length - eHypsCount; i++)
            stackFHyps.push(stack[i]);
        return stackFHyps;
    }
    eHypsStack(frame: Frame, stack: string[][]): string[][] {
        const stackEHyps: string[][] = [];
        const eHypsCount: number = frame.eHyps.length;
        // for (let i = stack.length - fHypsCount - eHypsCount;
        //     i < stack.length - fHypsCount; i++)
        for (let i = stack.length - eHypsCount; i < stack.length; i++)
            stackEHyps.push(stack[i]);
        return stackEHyps;
    }
    buildSubstitution(frameFHyps: FHyp[],
        fHypsStack: string[][]): Map<string, string[]> {
        const substitution: Map<string, string[]> = new Map<string, string[]>();
        for (let i = 0; i < frameFHyps.length; i++) {
            if (frameFHyps[i].Kind != fHypsStack[i][0]) {
                const message = `Stack entry doesn't match the kind of the mandatory var number ${i}. The current value on ` +
                    `the stack is '${fHypsStack[i][0]} . The $f hyp variable is ${frameFHyps[i].Variable} and the expected kind is ` +
                    `${frameFHyps[i].Kind} .`;
                const range: Range = oneCharacterRange({ line: 0, character: 0 });
                const code = MmParserErrorCode.eHypDoesntMatchTheStackEntry;
                this.addDiagnosticError(message, range, code);
                // throw new Error("Stack entry doesn't match mandatory var hyp");
            } else
                // fHypsStack[i].shift()
                substitution.set(frameFHyps[i].Variable, fHypsStack[i].slice(1));
        }
        // frameFHyps.forEach(frameFHyp => {
        //     const fHypStackTop: string[] = <string[]>fHypsStack.pop()
        //     if (fHypStackTop[0] != frameFHyp.Content[0]) {
        //         throw new Error("Stack entry doesn't match mandatory var hyp");
        //     }
        //     fHypStackTop.shift()
        //     substitution.set(frameFHyp.Content[1], fHypStackTop)
        // });
        return substitution;
    }

    //#region checkDisjointViolation

    //returns 
    //  varsInMandatoryDHyp(statementContent: string[], frameFHyps: FHyp[]): Set<string> {
    //     const vars: Set<string> = new Set<string>();
    //     statementContent.forEach((symbol: string) => {
    //         frameFHyps.forEach(frameFHyp => {
    //             if (frameFHyp.Content[1] === symbol)
    //                 vars.add(symbol);
    //         });
    //     });
    //     return vars;
    // }
    selectVars(statementContent: string[], parentBlock: BlockStatement): Set<string> {
        const vars: Set<string> = new Set<string>();
        statementContent.forEach((symbol: string) => {
            const isVar: boolean = parentBlock.lookup_v(symbol);
            if (isVar)
                vars.add(symbol);
        });
        return vars;
    }
    checkDisjointViolation1(provableStatement: AssertionStatement,
        frameProofStep: Frame,
        // substitution: Map<string, string[]>,
        // disjvar: DisjVarUStatement) {
        disjVar1: string, disjVar2: string, substitution1: string[], substitution2: string[]) {
        // const xVars: Set<string> = Verifier.varsInMandatoryDHyp(<string[]>substitution.get(disjvar.var1), frameProofStep.fHyps);
        // const yVars: Set<string> = Verifier.varsInMandatoryDHyp(<string[]>substitution.get(disjvar.var2), frameProofStep.fHyps);
        const parentBlock: BlockStatement = <BlockStatement>provableStatement.ParentBlock;
        // const xVars: Set<string> = this.selectVars(<string[]>substitution.get(disjvar.var1), parentBlock);
        // const yVars: Set<string> = this.selectVars(<string[]>substitution.get(disjvar.var2), parentBlock);
        const xVars: Set<string> = this.selectVars(substitution1, parentBlock);
        const yVars: Set<string> = this.selectVars(substitution2, parentBlock);
        xVars.forEach((x: string) => {
            if (yVars.has(x))
                throw new Error("Disjoint violation for " + disjVar1 + ", " + disjVar2 + "(" + x + ")");
        });
        //(from the Metamath book)
        //"Second, each possible pair of variables,
        //one from each expression, must exist in an active $d statement of the $p
        //statement containing the proof"
        xVars.forEach(xVar => {
            yVars.forEach(yVar => {
                if (!parentBlock.lookup_d(xVar, yVar)) {
                    const message: string = `There is a disjoint variable ($d) violation at proof step <TODO>.  ` +
                        `Assertion ${frameProofStep.assertionStatement.Label} requires that variables ` +
                        ` ${disjVar1} and ${disjVar2} be disjoint.  ` +
                        // `But ${disjVar1} was substituted with ${concatWithSpaces(<string[]>substitution.get(disjVar1))} and ` +
                        // `${disjVar2} was substituted with ${concatWithSpaces(<string[]>substitution.get(disjVar2))}. ` +
                        `But ${disjVar1} was substituted with ${concatWithSpaces(substitution1)} and ` +
                        `${disjVar2} was substituted with ${concatWithSpaces(substitution2)}. ` +
                        `Variables ${xVar} and ${yVar} do not have a disjoint variable requirement in the ` +
                        `assertion being proved, ${provableStatement.Label}`;
                    const range: Range = oneCharacterRange({ line: 0, character: 0 });
                    const code = MmParserErrorCode.missingDjVarsStatement;
                    this.addDiagnosticError(message, range, code);
                    // throw new Error(message);
                }
            }
            );
        }
        );
    }
    checkDisjointViolation(provableStatement: AssertionStatement,
        frameProofStep: Frame, substitution: Map<string, string[]>) {
        // frameProofStep.disjVars.forEach((disjvar: DisjVarUStatement) => {
        //     this.checkDisjointViolation1(provableStatement, frameProofStep, substitution, disjvar);
        // });
        frameProofStep.disjVars.map.forEach((vars2: Set<string>, var1: string) => {
            vars2.forEach((var2: string) => {
                const substitution1: string[] | undefined = substitution.get(var1);
                const substitution2: string[] | undefined = substitution.get(var2);
                if (substitution1 != undefined && substitution2 != undefined)
                    // var1 and var2 are mandatory variables
                    this.checkDisjointViolation1(provableStatement, frameProofStep, var1, var2, substitution1, substitution2);
            });
        });
    }
    //#endregion checkDisjointViolation

    applySubstitution(symbolList: string[], substitution: Map<string, string[]>):
        string[] {
        const result: string[] = [];
        symbolList.forEach((symbol: string) => {
            const symbolSubstitution: string[] | undefined =
                substitution.get(symbol);
            if (symbolSubstitution === undefined)
                result.push(symbol);
            else
                result.push(...symbolSubstitution);
        });
        return result;
    }

    //#region checkSubstitutionForStakEHyps
    checkSubstitutionForStakEHyps1(currentEHypInTheStack: string[],
        frameEHyp: string[], substitution: Map<string, string[]>): boolean {
        //const currentEHypInTheStack: string[] = eHypsStack[index]
        const frameEHypWithSubstitution = this.applySubstitution(
            frameEHyp, substitution);
        const areTheSame = AreArrayTheSame(currentEHypInTheStack, frameEHypWithSubstitution);
        if (!areTheSame) {
            //TODO see
            // https://github.com/metamath/metamath-exe/blob/master/tests/big-unifier-bad1.expected
            // for the metamath.exe detailed error message, if you want to improve
            // your error message and Diagnostic's range
            const message = `$e hypothesis doesn't match stack entry. The current hypothesis on ` +
                `the stack is '${concatWithSpaces(currentEHypInTheStack)} . The $e hyp with substitution is ` +
                `${concatWithSpaces(frameEHypWithSubstitution)} .`;
            const range: Range = oneCharacterRange({ line: 0, character: 0 });
            const code = MmParserErrorCode.eHypDoesntMatchTheStackEntry;
            this.addDiagnosticError(message, range, code);
            //    throw new Error("$e hypothesis doesn't match stack.");
        }
        return areTheSame;
    }
    checkSubstitutionForStakEHyps(eHypsStack: string[][],
        frameEHyps: EHyp[], substitution: Map<string, string[]>) {
        for (let i = 0; i < frameEHyps.length; i++)
            this.checkSubstitutionForStakEHyps1(eHypsStack[i],
                frameEHyps[i].formula, substitution);
        // frameEHyps.forEach(eHyp => {
        //     Verifier.checkSubstitutionForStakEHyps1(eHypsStack, eHyp,
        //         substitution)
    }
    //#endregion

    //TODO ParseError is not used anymore, remove it; now Diagnostic(s) are used
    verifyAssertionStatement(provableStatement: AssertionStatement,
        assertionStatementProofStep: AssertionStatement,
        stack: string[][]): ParseError[] {
        const parseErrors: ParseError[] = [];
        const frameProofStep: Frame = <Frame>assertionStatementProofStep.frame;
        const popCount: number = frameProofStep.fHyps.length + frameProofStep.eHyps.length;
        if (popCount > stack.length) {
            //throw new Error("Stack underflow");
            // const parseError: StackUnderflow = {
            //     description: "Stack underflow", numFHyps: frameProofStep.fHyps.length,
            //     numEHyps: frameProofStep.eHyps.length, stackLength: stack.length
            // };
            parseErrors.push({ description: "Stack underflow", });
        }
        const fHypsStack: string[][] = this.fHypsStack(frameProofStep, stack);
        const eHypsStack: string[][] = this.eHypsStack(frameProofStep, stack);

        const substitution: Map<string, string[]> =
            this.buildSubstitution(frameProofStep.fHyps, fHypsStack);
        this.checkDisjointViolation(provableStatement, frameProofStep, substitution);
        this.checkSubstitutionForStakEHyps(eHypsStack, frameProofStep.eHyps, substitution);

        for (let i = 0; i < popCount; i++)
            stack.pop();

        // const assertionContentToBeSubstituted = (assertionStatementProofStep instanceof AxiomStatement ? assertionStatementProofStep.Content :
        //     (<ProvableStatement>assertionStatementProofStep).ContentBeforeProof);
        const assertionStatementWithSubstitution =
            this.applySubstitution(assertionStatementProofStep.formula,
                substitution);
        stack.push(assertionStatementWithSubstitution);
        return parseErrors;
    }
    //#endregion verifyAxiomStatement

    verifyDecompressedProof(provableStatement: ProvableStatement, proof: Statement[]) {
        const stack: string[][] = [];
        const stored: string[][] = [];

        proof.forEach(statement => {
            if (statement instanceof FHyp) {
                stack.push(statement.formula);
            } else if (statement instanceof EHyp) {
                //TODO see if you can use a single if for FHyp and EHyp
                stack.push(statement.formula);
            } else if (statement instanceof ZIStatement) {
                stored.push(stack[stack.length - 1]);
            } else if (statement instanceof ZRStatement) {
                stack.push(stored[(<ZRStatement>statement).referencedZ]);
            } else if (statement instanceof AssertionStatement)
                this.verifyAssertionStatement(provableStatement,
                    <AssertionStatement>statement, stack);
        });

        if (stack.length === 0)
            throw new Error("Stack is empty at end of proof.");
        else if (stack.length > 1) {
            //TODO see the error in 'Test anatomy-bad1 , expect error' if
            //you want to have a better error message and Diagnostic's range
            const message = `Stack has more than one item at end of proof.`;
            const range: Range = oneCharacterRange({ line: 0, character: 0 });
            const code = MmParserErrorCode.stackHasMoreThanOneItemAtEndOfProof;
            this.addDiagnosticError(message, range, code);
            // throw new Error("Stack has more than one item at end of proof.");
        }
        const stackOnlyElement: string[] = <string[]>stack.pop();
        const contentBeforeTheProof = provableStatement.formula;
        // const areEqual = (stackOnlyElement.length == contentBeforeProof.length) && stackOnlyElement.every(function (element, index) {
        //     return element === contentBeforeProof[index];
        // });
        const areEqual = AreArrayTheSame(stackOnlyElement, contentBeforeTheProof);
        if (!areEqual) {
            const message = `Assertion proven doesn't match. Expected: ` +
                `${concatWithSpaces(contentBeforeTheProof)} , proven: ${concatWithSpaces(stackOnlyElement)} `;
            const range: Range = oneCharacterRange({ line: 0, character: 0 });
            const code = MmParserErrorCode.assertionProvenDoesntMatch;
            this.addDiagnosticError(message, range, code);
            // throw new Error("Assertion proved doesn't match.");
            //TODO check what you wanted to do, below with AssertionProvenDoesntMatch
            // const parseError: AssertionProvenDoesntMatch = {
            //     description: "Assertion proven doesn't match.",
            //     expected: stackOnlyElement.toString(), proven: stackOnlyElement.toString()
            // };
        }
        //#endregion verifyDecompressedProof
        //console.log( "verifying : " + provableStatement.Label )
        //throw new Error('Method not implemented.');
    }

    //#region GetProofStatements
    static getProofStatement(label: string, labelToStatementMap: Map<string, LabeledStatement>,
        currentBlock: BlockStatement): LabeledStatement | undefined {
        let labeledStatement: LabeledStatement | undefined = labelToStatementMap.get(label);
        if (labeledStatement === undefined)
            labeledStatement = currentBlock.getLabeledStatement(label);
        return labeledStatement;
    }

    static GetProofStatements(proofStrings: string[], labelToStatementMap: Map<string, LabeledStatement>,
        currentBlock: BlockStatement, _verifier: Verifier): Statement[] {
        const proofStatements: Statement[] = [];
        proofStrings.forEach(label => {
            const labeledStatement: LabeledStatement | undefined = this.getProofStatement(
                label, labelToStatementMap, currentBlock);
            if (labeledStatement === undefined) {
                //TODO1 mar 18
                // verifier.addDiagnosticError(`${label} is not the label of an assertion or optional hypothesis`,);
                throw new Error("no previous statement has label " + label);
            } else {
                proofStatements.push(<LabeledStatement>labeledStatement);
            }
        });
        return proofStatements;
    }
    //#endregion GetProofStatements

    //#region getDecompressedProof
    addDiagnosticForMissingCompressedProofString(provableStatement: ProvableStatement, proofStrings: string[]) {
        const lastToken: MmToken = provableStatement.Content[provableStatement.Content.length - 1];
        const range: Range = lastToken.range;
        if (proofStrings.indexOf(')') == -1) {
            const message = `The $p statement ${provableStatement.Label} does not contain a '(' character`;
            const code: MmParserErrorCode = MmParserErrorCode.missingCloseParenthesisInPStatement;
            this.addDiagnosticError(message, range, code);
        } else {
            // between ')' and '$.' there is not a sequence of characters
            const message = `The $p statement ${provableStatement.Label} does not contain a ` +
                `compressed proof string between ')' and '$.'`;
            const code = MmParserErrorCode.assertionProvenDoesntMatch;
            this.addDiagnosticError(message, range, code);
        }
    }
    decompressExistingProofString(provableStatement: ProvableStatement, labelToStatementMap: Map<string, LabeledStatement>): Statement[] | undefined {
        const proofCompressor: ProofCompressor = new ProofCompressor(this.diagnostics);
        const proof: Statement[] | undefined = proofCompressor.DecompressProof(provableStatement, labelToStatementMap);
        if (proofCompressor.failed) {
            const message = `The proof of ${provableStatement.Label} , cannot be uncompressed`;
            const range: Range = oneCharacterRange({ line: 0, character: 0 });
            const code = MmParserErrorCode.assertionProvenDoesntMatch;
            this.addDiagnosticError(message, range, code);
        }
        return proof;
    }
    getDecompressedProof(provableStatement: ProvableStatement, proofStrings: string[],
        labelToStatementMap: Map<string, LabeledStatement>): Statement[] | undefined {
        let proof: Statement[] | undefined;
        if (provableStatement.compressedProofString == "")
            // either ')' is missing, or '$.' immediately follows ')'
            this.addDiagnosticForMissingCompressedProofString(provableStatement, proofStrings);
        else
            proof = this.decompressExistingProofString(provableStatement, labelToStatementMap);

        return proof;
    }
    //#endregion getDecompressedProof

    verify(provableStatement: ProvableStatement, proofStrings: string[],
        labelToStatementMap: Map<string, LabeledStatement>) {
        if (labelToStatementMap.size % 1000 === 0) {
            console.log("verifying : " + labelToStatementMap.size + " : " + provableStatement.Label);
        }

        let proof: Statement[] | undefined;
        if (proofStrings[0] === '(')
            // the proof is compressed
            proof = this.getDecompressedProof(provableStatement, proofStrings, labelToStatementMap);
        else
            // the proof is not compressed
            proof = Verifier.GetProofStatements(proofStrings, labelToStatementMap,
                <BlockStatement>provableStatement.ParentBlock, this);
        if (!this.verificationFailed)
            // either the proof was not compressed or the decompression was successful
            this.verifyDecompressedProof(provableStatement, proof!);
    }
}