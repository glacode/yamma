export interface WilsonScoreArgs {
	votes: number;
	averageRating: number;
}

export interface WilsonScoreInterval {
	leftSide: number,
	rightSide: number
}

export function calculateWilsonScore(wilsonScoreArgs: WilsonScoreArgs): WilsonScoreInterval {
	const z = 1.96; // 95% confidence interval
	const n = wilsonScoreArgs.votes;
	const p = wilsonScoreArgs.averageRating;

	const term1 = p + (z * z) / (2 * n);
	const term2 = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
	const denominator = 1 + (z * z) / n;

	// return (leftSide - rightSide) / denominator;
	const wilsonScoreInterval: WilsonScoreInterval = {
		leftSide: (term1 - term2) / denominator,
		rightSide: (term1 + term2) / denominator
	};
	return wilsonScoreInterval;
}