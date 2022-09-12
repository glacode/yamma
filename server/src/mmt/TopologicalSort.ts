/** this class performs Topological Sorting, using Kahn’s algorithm */
export class TopologicalSort<T>{

	graph: Map<T, Set<T>>;

	/** computes the topological sort of the given graph */
	constructor(graph: Map<T, Set<T>>) {
		this.graph = graph;
	}

	/** returns the topological sort of the given graph, if the the graph is acyclic; undefined otherwise */
	sort(): T[] | undefined {
		// list of in-degrees (for all vertices). Initialize all in-degrees at 0
		const inDegree: Map<T, number> = new Map<T, number>();
		for (const [key,] of this.graph)
			inDegree.set(key, 0);

		for (const [, value] of this.graph) {
			value.forEach((vertex: T) => {
				const newInDegree: number = <number>inDegree.get(vertex) + 1;
				inDegree.set(vertex, newInDegree);
			});
		}

		// Create an array of all vertices with in-degree 0
		const verticesWithInDegreeZero: T[] = [];
		for (const [key,] of this.graph)
			if (inDegree.get(key) == 0)
				verticesWithInDegreeZero.push(key);

		const topologicalOrder: T[] = [];
		while (verticesWithInDegreeZero.length > 0) {
			const vertex: T = <T>verticesWithInDegreeZero.shift();
			topologicalOrder.push(vertex);
			const adiacentVertices: Set<T> = <Set<T>>this.graph.get(vertex);
			adiacentVertices.forEach((vertex: T) => {
				const newInDegree: number = <number>inDegree.get(vertex) - 1;
				inDegree.set(vertex, newInDegree);
				if (newInDegree == 0)
					verticesWithInDegreeZero.unshift(vertex);
			});
		}
		let result: T[] | undefined;
		if (topologicalOrder.length == this.graph.size)
			// the graph is not acyclic; sort is succesfull
			result = topologicalOrder;
		return result;
	}
}