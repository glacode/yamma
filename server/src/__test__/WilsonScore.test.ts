import { calculateWilsonScore, WilsonScoreArgs as WilsonScoreArgs } from '../stepSuggestion/WilsonScore';

test('calculateWilsonScore', () => {
	const itemX: WilsonScoreArgs = { votes: 100, averageRating: 0.8 };
	const itemY: WilsonScoreArgs = { votes: 1000, averageRating: 0.77 };

	expect(calculateWilsonScore(itemX).leftSide).toBeCloseTo(0.7111708344, 5);
	expect(calculateWilsonScore(itemX).rightSide).toBeCloseTo(0.8666330667, 5);
	expect(calculateWilsonScore(itemY).leftSide).toBeCloseTo(0.7429132441, 5);
	expect(calculateWilsonScore(itemY).rightSide).toBeCloseTo(0.7950203063, 5);

	const sortedItems = [itemX, itemY].sort((a, b) => calculateWilsonScore(b).leftSide - calculateWilsonScore(a).leftSide);

	// The first item in the sorted array should have the highest Wilson Score
	expect(sortedItems[0]).toEqual(itemY);
	// The second item in the sorted array should have the second-highest Wilson Score
	expect(sortedItems[1]).toEqual(itemX);

});