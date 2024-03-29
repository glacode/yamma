import { difference, intersection2, subset, union2 } from '../mm/Utils';

/** this is an edge of the undirected graph. v1 is assumed to be less than v2 */
export interface Edge {
	vertex1: number,
	vertex2: number
}

/** implements the Kellerman's algorithm for the minimum edge clique cover, see Pag. 3 of
 * https://epubs.siam.org/doi/pdf/10.1137/1.9781611972863.9
 * vertices are assumed to be an interval of integers starting from 0, i.e. in the form ( 0 ... n )
 */
export class EdgeCliqueCoverFinder {
	public cliqueCover: Set<Set<number>> | undefined;
	// private cliques: Set<number>[] = [];

	private numberOfVertices: number;

	/**
	 * 
	 * @param undirectedGraph 
	 */
	constructor(private undirectedGraph: Edge[]) {
		this.numberOfVertices = this.computeNumberOfVerticesAndCheckData(undirectedGraph);
	}

	/** builds an edge with vertices in the right order */
	static buildEdge(vertex1: number, vertex2: number): Edge | undefined {
		let edge: Edge | undefined;
		if (vertex1 < 0 || vertex2 < 0 || vertex1 == vertex2)
			throw new Error("vertex1 and vertex2 must be distinct nonnegative integers");
		else {
			const v1: number = Math.min(vertex1, vertex2);
			const v2: number = Math.max(vertex1, vertex2);
			edge = {
				vertex1: v1,
				vertex2: v2
			};
		}
		return edge;
	}

	//#region computeNumberOfVerticesAndCheckData
	// private oneIfVertexIsNew(vertex: number, vertices: Set<number>): number {
	// 	let result = 0;
	// 	if (!vertices.has(vertex)) {
	// 		vertices.add(vertex);
	// 		result = 1;
	// 	}
	// 	return result;
	// }
	private computeNumberOfVerticesAndCheckData(edges: Edge[]): number {
		// let numberOfVertices = 0;
		const vertices: Set<number> = new Set<number>();
		edges.forEach((edge: Edge) => {
			if (edge.vertex1 >= edge.vertex2)
				throw new Error("it must be edge.v1 < edge.v2");
			else {
				vertices.add(edge.vertex1);
				vertices.add(edge.vertex2);
			}
			// numberOfVertices += this.oneIfVertexIsNew(edge.v1, vertices);
			// numberOfVertices += this.oneIfVertexIsNew(edge.v2, vertices);
		});
		const vertexArray: number[] = Array.from(vertices).sort((a, b) => a - b);
		if (vertexArray[0] != 0)
			throw new Error("Vertexes must be numbered with nonnegative integers");
		else if (vertexArray[vertexArray.length - 1] != vertexArray.length - 1)
			throw new Error("vertices must be an interval of integers starting from 0");
		return vertices.size;
	}
	//#endregion computeNumberOfVerticesAndCheckData

	//#region findCliqueCover

	//#region handleVertex

	//#region tryToAddThisVertexToEachOfTheExistingCliques

	/** returns the first clique c such that the size of c i^i w is maximal  */
	private getCliqueWithMaximalIntersectionWithW(w: Set<number>): Set<number> {
		let candidate: Set<number> = new Set<number>();
		this.cliqueCover!.forEach((clique: Set<number>) => {
			if (candidate.size < intersection2(clique, w).size)
				candidate = clique;
		});
		return candidate;
	}
	private tryToAddThisVertexToEachOfTheExistingCliques(i: number, w: Set<number>) {
		let u: Set<number> = new Set<number>();  // set of neighbors j of i where { i , j } is already covered
		this.cliqueCover!.forEach((clique: Set<number>) => {
			if (subset(clique, w)) {
				clique.add(i);
				u = union2(u, clique);
			}
		});
		w = difference(w, u);
		while (w.size > 0) {
			// for the remaining edges, try to cover as many as possible at a time
			const cliqueL: Set<number> = this.getCliqueWithMaximalIntersectionWithW(w);
			const cliqueK: Set<number> = union2(intersection2(cliqueL, w), new Set<number>().add(i));
			this.cliqueCover!.add(cliqueK);
			w = difference(w, cliqueL);
		}
	}
	//#endregion tryToAddThisVertexToEachOfTheExistingCliques

	private handleVertex(i: number) {
		const w: number[] = this.undirectedGraph.filter((edge: Edge) => edge.vertex2 == i)
			.map((edge: Edge) => edge.vertex1);
		if (w.length == 0)
			// there is no vertex with index lower than i, connected to i
			// notice that when i == 0 , this will always be true
			this.cliqueCover!.add(new Set<number>().add(i));
		else
			// there is at least one vertex with index lower than i, connected to i
			this.tryToAddThisVertexToEachOfTheExistingCliques(i, new Set<number>(w));
	}
	//#endregion handleVertex

	public findEdgeCliqueCover(): Set<Set<number>> {
		this.cliqueCover = new Set<Set<number>>();
		// this.cliques = [];
		for (let i = 0; i < this.numberOfVertices; i++) {
			this.handleVertex(i);
		}
		return this.cliqueCover;
	}
	//#endregion findCliqueCover
}