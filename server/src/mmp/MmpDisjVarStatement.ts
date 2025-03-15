import { Edge, EdgeCliqueCoverFinder } from '../general/EdgeCliqueCoverFinder';
import { MmToken } from '../grammar/MmLexer';
import { IMmpStatementWithRange } from './MmpStatement';
import { arrayRange, concatTokenValuesWithSpaces } from '../mm/Utils';
import { Range } from 'vscode-languageserver';


/** represents a Disjoint Var constraint statement in the current proof */
export class MmpDisjVarStatement implements IMmpStatementWithRange {

    private _toText: string | undefined;

    /** tokens of the disjoint vars */
    disjointVars: MmToken[];

    // constructor(var1: string, var2: string) {
    constructor(disjointVars: MmToken[]) {
        this.disjointVars = disjointVars;
    }

    get range(): Range {
        const range: Range = arrayRange(this.disjointVars);
        return range;
    }

    /** creates a MmpDisjVarStatement with dummy ranges */
    static CreateMmpDisjVarStatement(var1: string, var2: string): MmpDisjVarStatement {
        const disjVarStatement: MmpDisjVarStatement = new MmpDisjVarStatement([new MmToken(var1, 0, 0), new MmToken(var2, 0, 0)]);
        return disjVarStatement;
    }

    toText() {
        if (this._toText == undefined) {
            const statementContent: string = concatTokenValuesWithSpaces(this.disjointVars);
            this._toText = `$d ${statementContent}`;
        }
        return this._toText;
    }

    /** returns the text for a $d statement for two vars*/
    static textForTwoVars(var1: string, var2: string): string {
        const statementText = `$d ${var1} ${var2}`;
        return statementText;
    }

    //#region buildEdgeCliqueCover

    //#region buildEdgeCliqueCoverFromNumbers
    private static buildEdgeCliqueCoverSet(undirectedGraph: Edge[]): Set<Set<number>> {
        const edgeCliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(undirectedGraph);
        const edgeCliqueCover: Set<Set<number>> = edgeCliqueCoverFinder.findEdgeCliqueCover();
        return edgeCliqueCover;
    }
    //#region produceDisjVarMmpStatements

    //#region produceDisjVarMmpStatement
    //#region getDisjVarMmpStatementContent
    private static getStrDisjVarMmpStatementContent(clique: Set<number>, numberToVarMap: string[]): string[] {
        const strStatementContent: string[] = [];
        clique.forEach((vertex: number) => {
            const logicalVariable: string = numberToVarMap[vertex];
            strStatementContent.push(logicalVariable);
        });
        strStatementContent.sort();
        return strStatementContent;
    }
    private static getDisjVarMmpStatementContentFromStrings(strStatementContent: string[]): MmToken[] {
        const disjVarMmpStatementContent: MmToken[] = [];
        strStatementContent.forEach((logicalVariable: string) => {
            const token: MmToken = new MmToken(logicalVariable, 0, 0);
            disjVarMmpStatementContent.push(token);
        });
        return disjVarMmpStatementContent;
    }
    private static getDisjVarMmpStatementContent(clique: Set<number>, numberToVarMap: string[]): MmToken[] {
        const strStatementContent: string[] = MmpDisjVarStatement.getStrDisjVarMmpStatementContent(clique, numberToVarMap);
        const statementContent: MmToken[] = MmpDisjVarStatement.getDisjVarMmpStatementContentFromStrings(strStatementContent);
        return statementContent;
    }
    //#endregion getDisjVarMmpStatementContent
    private static produceDisjVarMmpStatement(clique: Set<number>, numberToVarMap: string[]): MmpDisjVarStatement {
        const statementContent: MmToken[] = MmpDisjVarStatement.getDisjVarMmpStatementContent(clique, numberToVarMap);
        const mmpDisjVarStatement: MmpDisjVarStatement = new MmpDisjVarStatement(statementContent);
        return mmpDisjVarStatement;
    }
    //#endregion produceDisjVarMmpStatement
    private static produceUnsortedDisjVarMmpStatements(edgeCliqueCoverSet: Set<Set<number>>,
        numberToVarMap: string[]): MmpDisjVarStatement[] {
        const mmpDisjVarStatements: MmpDisjVarStatement[] = [];
        edgeCliqueCoverSet.forEach((clique: Set<number>) => {
            const mmpDisjVarStatement: MmpDisjVarStatement = MmpDisjVarStatement.produceDisjVarMmpStatement(
                clique, numberToVarMap);
            mmpDisjVarStatements.push(mmpDisjVarStatement);
        });
        return mmpDisjVarStatements;
    }
    private static compare(mmpDisjVarStatement1: MmpDisjVarStatement, mmpDisjVarStatement2: MmpDisjVarStatement) {
        const output: number = (mmpDisjVarStatement1.toText() <= mmpDisjVarStatement2.toText() ? -1 : 1);
        return output;
    }
    private static produceDisjVarMmpStatements(edgeCliqueCoverSet: Set<Set<number>>,
        numberToVarMap: string[]): MmpDisjVarStatement[] {
        const mmpDisjVarStatements: MmpDisjVarStatement[] =
            MmpDisjVarStatement.produceUnsortedDisjVarMmpStatements(edgeCliqueCoverSet, numberToVarMap);
        MmpDisjVarStatement.produceUnsortedDisjVarMmpStatements(edgeCliqueCoverSet, numberToVarMap);
        mmpDisjVarStatements.sort(MmpDisjVarStatement.compare);
        return mmpDisjVarStatements;
    }
    //#endregion produceDisjVarMmpStatements
    private static buildEdgeCliqueCoverFromNumbers(undirectedGraph: Edge[], numberToVarMap: string[]): MmpDisjVarStatement[] {
        const edgeCliqueCoverSet: Set<Set<number>> = MmpDisjVarStatement.buildEdgeCliqueCoverSet(undirectedGraph);
        const edgeCliqueCover: MmpDisjVarStatement[] =
            MmpDisjVarStatement.produceDisjVarMmpStatements(edgeCliqueCoverSet, numberToVarMap);
        return edgeCliqueCover;
    }
    //#endregion buildEdgeCliqueCoverFromNumbers

    /**
     * receives an array of disjoint var statements and builds a heuristic edge clique cover
     * of the represented undirected graph (for a compact representation of the graph)
     * @param mmpDisjVarStatements array of MmpDisjVarStatement representing the undirected graph
     * @returns 
     */
    private static buildNumberToVarMap(mmpDisjVarStatements: MmpDisjVarStatement[]): string[] {
        const numberToVarMap: string[] = [];
        mmpDisjVarStatements.forEach((mmpDisjVarStatement: MmpDisjVarStatement) =>
            mmpDisjVarStatement.disjointVars.forEach((logicalVariable: MmToken) => {
                if (!numberToVarMap.includes(logicalVariable.value))
                    numberToVarMap.push(logicalVariable.value);
            }
            ));
        return numberToVarMap;
    }
    private static buildVarToNumberMap(numberToVarMap: string[]): Map<string, number> {
        const varToNumberMap: Map<string, number> = new Map<string, number>();
        for (let i = 0; i < numberToVarMap.length; i++) {
            const logicalVariable: string = numberToVarMap[i];
            varToNumberMap.set(logicalVariable, i);
        }
        return varToNumberMap;
    }
    //#region buildUndirectedGraph
    //#region addEdgesForSingleMmpDisjVarStatement
    private static buildEdge(i: number, j: number, logicalVars: MmToken[],
        varToNumberMap: Map<string, number>): Edge | undefined {
        let edge: Edge | undefined;
        const vertex1: number | undefined = varToNumberMap.get(logicalVars[i].value);
        const vertex2: number | undefined = varToNumberMap.get(logicalVars[j].value);
        if (vertex1 != undefined && vertex2 != undefined)
            edge = EdgeCliqueCoverFinder.buildEdge(vertex1, vertex2);
        return edge;
    }
    private static addEdgesForSingleMmpDisjVarStatement(logicalVars: MmToken[], varToNumberMap: Map<string, number>,
        undirectedGraph: Edge[]) {
        for (let j = 0; j < logicalVars.length; j++)
            for (let i = 0; i < j; i++) {
                const edge: Edge | undefined = this.buildEdge(i, j, logicalVars, varToNumberMap);
                if (edge != undefined && !undirectedGraph.includes(edge))
                    undirectedGraph.push(edge);
            }
    }
    //#endregion addEdgesForSingleMmpDisjVarStatement
    private static buildUndirectedGraph(mmpDisjVarStatements: MmpDisjVarStatement[], varToNumberMap: Map<string, number>): Edge[] {
        const undirectedGraph: Edge[] = [];
        mmpDisjVarStatements.forEach((mmpDisjVarStatement: MmpDisjVarStatement) => {
            this.addEdgesForSingleMmpDisjVarStatement(
                mmpDisjVarStatement.disjointVars, varToNumberMap, undirectedGraph);
        });
        return undirectedGraph;
    }
    //#endregion buildUndirectedGraph
    /**
     * Given an array of disj var statements produces a heuristic edge clique cover,
     * and then a compact representation of the (pair of) constraints
     * @param mmpDisjVarStatements an array of disj var statements
     * @returns 
     */
    public static buildEdgeCliqueCover(mmpDisjVarStatements: MmpDisjVarStatement[]): MmpDisjVarStatement[] {
        const numberToVarMap: string[] = MmpDisjVarStatement.buildNumberToVarMap(mmpDisjVarStatements);
        const varToNumberMap: Map<string, number> = MmpDisjVarStatement.buildVarToNumberMap(numberToVarMap);
        const undirectedGraph: Edge[] = MmpDisjVarStatement.buildUndirectedGraph(mmpDisjVarStatements,
            varToNumberMap);
        const edgeCliqueCover: MmpDisjVarStatement[] = this.buildEdgeCliqueCoverFromNumbers(
            undirectedGraph, numberToVarMap);
        return edgeCliqueCover;
    }
    //#endregion buildEdgeCliqueCover

}
