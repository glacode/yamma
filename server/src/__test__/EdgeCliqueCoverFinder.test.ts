import { EdgeCliqueCoverFinder, Edge } from '../general/EdgeCliqueCoverFinder';

test("edge clique cover 1",
	() => {
		const edges: Edge[] = [
			{ v1: 0, v2: 1 },
			{ v1: 0, v2: 2 },
			{ v1: 1, v2: 2 },
			{ v1: 2, v2: 3 }
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();

		expect(cliqueCover.size).toBe(2);
	}
);

test("edge clique cover 2",
	() => {
		const edges: Edge[] = [
			{ v1: 1, v2: 3 },
			{ v1: 0, v2: 3 },
			{ v1: 0, v2: 1 },
			{ v1: 1, v2: 2 }
		];
		const cliqueCoverFinder: EdgeCliqueCoverFinder = new EdgeCliqueCoverFinder(edges);
		const cliqueCover: Set<Set<number>> = cliqueCoverFinder.findEdgeCliqueCover();

		expect(cliqueCover.size).toBe(2);
	}
);

test("edge clique cover 3",
	() => {
		const edges: Edge[] = [
			{ v1: 0, v2: 2 },
			{ v1: 0, v2: 4 },
			{ v1: 1, v2: 2 },
			{ v1: 1, v2: 3 },
			{ v1: 2, v2: 3 },
			{ v1: 2, v2: 4 },
			{ v1: 2, v2: 5 },
			{ v1: 3, v2: 4 },
			{ v1: 3, v2: 5 },
			{ v1: 4, v2: 5 },
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
			{ v1: 0, v2: 2 },
			{ v1: 0, v2: 4 },
			{ v1: 1, v2: 2 },
			{ v1: 1, v2: 3 },
			{ v1: 2, v2: 3 },
			{ v1: 2, v2: 4 },
			{ v1: 2, v2: 5 },
			{ v1: 3, v2: 4 },
			{ v1: 3, v2: 5 },
			{ v1: 4, v2: 5 },
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
			{ v1: 0, v2: 1 },
			{ v1: 0, v2: 2 },
			{ v1: 1, v2: 2 },
			{ v1: 3, v2: 4 },
			{ v1: 3, v2: 5 },
			{ v1: 3, v2: 6 },
			{ v1: 4, v2: 5 },
			{ v1: 4, v2: 6 },
			{ v1: 5, v2: 6 }
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
			{ v1: 0, v2: 1 },
			{ v1: 0, v2: 2 },
			{ v1: 1, v2: 2 },
			{ v1: 3, v2: 4 },
			{ v1: 3, v2: 5 },
			{ v1: 3, v2: 6 },
			{ v1: 4, v2: 5 },
			{ v1: 4, v2: 6 },
			{ v1: 5, v2: 6 },
			{ v1: 1, v2: 4 }
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