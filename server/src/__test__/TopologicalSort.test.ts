import { TopologicalSort } from '../mmt/TopologicalSort';

test("expect th2 th3 th1 th4 th5 or th3 th2 th1 th4 th5", () => {
	const mustPreceed: Map<string, Set<string>> = new Map<string, Set<string>>();
	mustPreceed.set('th4', new Set<string>(['th5']));
	mustPreceed.set('th3', new Set<string>(['th4']));
	mustPreceed.set('th1', new Set<string>(['th4']));
	mustPreceed.set('th2', new Set<string>(['th4','th1']));
	mustPreceed.set('th5', new Set<string>());

	const topologicalSort: TopologicalSort<string> = new TopologicalSort<string>(mustPreceed);
	const result: string[] = <string[]>topologicalSort.sort();
	expect(result.length).toBe(5);
	expect(result[2]).toEqual('th1');
	expect(result[3]).toEqual('th4');
	expect(result[4]).toEqual('th5');
});

test("expect undefined for non acyclic graph", () => {
	const mustPreceed: Map<string, Set<string>> = new Map<string, Set<string>>();
	mustPreceed.set('th4', new Set<string>(['th5']));
	mustPreceed.set('th3', new Set<string>(['th4']));
	mustPreceed.set('th1', new Set<string>(['th4']));
	mustPreceed.set('th2', new Set<string>(['th4','th1']));
	mustPreceed.set('th5', new Set<string>(['th2']));

	const topologicalSort: TopologicalSort<string> = new TopologicalSort<string>(mustPreceed);
	const result: string[] = <string[]>topologicalSort.sort();
	expect(result).toBeUndefined();
});

test("expect 1 2 3 4 5 6 or 1 2 3 4 6 5 or 1 3 2 4 5 6 or 1 3 2 4 5 6", () => {
	const mustPreceed: Map<number, Set<number>> = new Map<number, Set<number>>();
	mustPreceed.set(1, new Set<number>([2,3]));
	mustPreceed.set(2, new Set<number>([4,5]));
	mustPreceed.set(3, new Set<number>([4,6]));
	mustPreceed.set(4, new Set<number>([5,6]));
	mustPreceed.set(5, new Set<number>());
	mustPreceed.set(6, new Set<number>());

	const topologicalSort: TopologicalSort<number> = new TopologicalSort<number>(mustPreceed);
	const result: number[] = <number[]>topologicalSort.sort();
	expect(result[0]).toEqual(1);
	expect(result[3]).toEqual(4);
	expect(result[1]).toBeLessThanOrEqual(3);
	expect(result[1]).toBeGreaterThanOrEqual(2);
	expect(result[2]).toBeLessThanOrEqual(3);
	expect(result[2]).toBeGreaterThanOrEqual(2);
	expect(result[4]).toBeLessThanOrEqual(6);
	expect(result[4]).toBeGreaterThanOrEqual(5);
	expect(result[5]).toBeLessThanOrEqual(6);
	expect(result[5]).toBeGreaterThanOrEqual(5);
});

test("expect another undefined for non acyclic graph", () => {
	const mustPreceed: Map<number, Set<number>> = new Map<number, Set<number>>();
	mustPreceed.set(1, new Set<number>([2,3]));
	mustPreceed.set(2, new Set<number>([4,5]));
	mustPreceed.set(3, new Set<number>([4,6]));
	mustPreceed.set(4, new Set<number>([1,6]));
	mustPreceed.set(5, new Set<number>());
	mustPreceed.set(6, new Set<number>());

	const topologicalSort: TopologicalSort<number> = new TopologicalSort<number>(mustPreceed);
	const result: number[] = <number[]>topologicalSort.sort();
	expect(result).toBeUndefined();
});