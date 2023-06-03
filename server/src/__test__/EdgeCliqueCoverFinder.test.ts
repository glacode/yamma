import { EdgeCliqueCoverFinder, Edge } from '../general/EdgeCliqueCoverFinder';

test("edge clique cover 1",
	() => {
		const edges: Edge[] = [
			{ vertex1: 0, vertex2: 1 },
			{ vertex1: 0, vertex2: 2 },
			{ vertex1: 1, vertex2: 2 },
			{ vertex1: 2, vertex2: 3 }
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();

		expect(cliqueCover.size).toBe(2);
	}
);

test("edge clique cover 2",
	() => {
		const edges: Edge[] = [
			{ vertex1: 1, vertex2: 3 },
			{ vertex1: 0, vertex2: 3 },
			{ vertex1: 0, vertex2: 1 },
			{ vertex1: 1, vertex2: 2 }
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();

		expect(cliqueCover.size).toBe(2);
	}
);

test("edge clique cover 3",
	() => {
		const edges: Edge[] = [
			{ vertex1: 0, vertex2: 2 },
			{ vertex1: 0, vertex2: 4 },
			{ vertex1: 1, vertex2: 2 },
			{ vertex1: 1, vertex2: 3 },
			{ vertex1: 2, vertex2: 3 },
			{ vertex1: 2, vertex2: 4 },
			{ vertex1: 2, vertex2: 5 },
			{ vertex1: 3, vertex2: 4 },
			{ vertex1: 3, vertex2: 5 },
			{ vertex1: 4, vertex2: 5 },
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();
		// this is a suboptimal example, but it is a valid clique cover
		expect(cliqueCover.size).toBe(4);
		const cliqueArrays: Set<number>[] = Array.from(cliqueCover);
		expect(Array.from(cliqueArrays[0])).toEqual([0, 2, 4]);
		expect(Array.from(cliqueArrays[1])).toEqual([1, 2, 3]);
		expect(Array.from(cliqueArrays[2])).toEqual([3, 4, 5]);
		expect(Array.from(cliqueArrays[3])).toEqual([2, 5]);
	}
);

test("edge clique cover 3",
	() => {
		const edges: Edge[] = [
			{ vertex1: 0, vertex2: 2 },
			{ vertex1: 0, vertex2: 4 },
			{ vertex1: 1, vertex2: 2 },
			{ vertex1: 1, vertex2: 3 },
			{ vertex1: 2, vertex2: 3 },
			{ vertex1: 2, vertex2: 4 },
			{ vertex1: 2, vertex2: 5 },
			{ vertex1: 3, vertex2: 4 },
			{ vertex1: 3, vertex2: 5 },
			{ vertex1: 4, vertex2: 5 },
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();
		// this is a suboptimal example, but it is a valid edge clique cover
		expect(cliqueCover.size).toBe(4);
		const cliqueArrays: Set<number>[] = Array.from(cliqueCover);
		expect(Array.from(cliqueArrays[0])).toEqual([0, 2, 4]);
		expect(Array.from(cliqueArrays[1])).toEqual([1, 2, 3]);
		expect(Array.from(cliqueArrays[2])).toEqual([3, 4, 5]);
		expect(Array.from(cliqueArrays[3])).toEqual([2, 5]);
	}
);

test("edge clique cover 4",
	() => {
		const edges: Edge[] = [
			{ vertex1: 0, vertex2: 1 },
			{ vertex1: 0, vertex2: 2 },
			{ vertex1: 1, vertex2: 2 },
			{ vertex1: 3, vertex2: 4 },
			{ vertex1: 3, vertex2: 5 },
			{ vertex1: 3, vertex2: 6 },
			{ vertex1: 4, vertex2: 5 },
			{ vertex1: 4, vertex2: 6 },
			{ vertex1: 5, vertex2: 6 }
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();
		// this is a minimal edge clique cover
		expect(cliqueCover.size).toBe(2);
		const cliqueArrays: Set<number>[] = Array.from(cliqueCover);
		expect(Array.from(cliqueArrays[0])).toEqual([0, 1, 2]);
		expect(Array.from(cliqueArrays[1])).toEqual([3, 4, 5, 6]);
	}
);

test("edge clique cover 5",
	() => {
		const edges: Edge[] = [
			{ vertex1: 0, vertex2: 1 },
			{ vertex1: 0, vertex2: 2 },
			{ vertex1: 1, vertex2: 2 },
			{ vertex1: 3, vertex2: 4 },
			{ vertex1: 3, vertex2: 5 },
			{ vertex1: 3, vertex2: 6 },
			{ vertex1: 4, vertex2: 5 },
			{ vertex1: 4, vertex2: 6 },
			{ vertex1: 5, vertex2: 6 },
			{ vertex1: 1, vertex2: 4 }
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();
		// this is a minimal edge clique cover
		expect(cliqueCover.size).toBe(3);
		const cliqueArrays: Set<number>[] = Array.from(cliqueCover);
		expect(Array.from(cliqueArrays[0])).toEqual([0, 1, 2]);
		expect(Array.from(cliqueArrays[1])).toEqual([3, 4, 5, 6]);
		expect(Array.from(cliqueArrays[2])).toEqual([1, 4]);
	}
);

test("edge clique cover 6 with more than 10 vertices",
	() => {
		// here I'm just checking that it does not throw an exception
		const edges: Edge[] = [
			{ vertex1: 0, vertex2: 1 },
			{ vertex1: 0, vertex2: 2 },
			{ vertex1: 0, vertex2: 3 },
			{ vertex1: 0, vertex2: 4 },
			{ vertex1: 0, vertex2: 5 },
			{ vertex1: 0, vertex2: 6 },
			{ vertex1: 0, vertex2: 7 },
			{ vertex1: 1, vertex2: 8 },
			{ vertex1: 1, vertex2: 9 },
			{ vertex1: 1, vertex2: 10 },
			{ vertex1: 1, vertex2: 11 }
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();
		// this is a minimal edge clique cover
		expect(cliqueCover.size).toBeGreaterThanOrEqual(1);
	}
);