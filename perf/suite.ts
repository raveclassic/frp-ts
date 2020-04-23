import { Suite } from 'benchmark';
// import { isNonEmpty } from 'fp-ts/lib/Array';
// import { last } from 'fp-ts/lib/NonEmptyArray';
//
// declare module 'benchmark' {
// 	export interface Suite {
// 		readonly name: string;
// 		readonly sort: (f: (a: Benchmark.Suite, b: Benchmark.Suite) => number) => Benchmark.Suite;
// 		readonly stats: Benchmark.Stats;
// 		readonly hz: number;
// 		readonly count: number;
// 	}
// }

// interface TestResult {
// 	readonly name: string;
// 	readonly hz: string;
// }
//
// const padRight = (input: string, fullLegth: number): string => {
// 	const diff = fullLegth - input.length;
// 	if (diff < 0) {
// 		return input.slice(0, fullLegth);
// 	}
// 	let result = input;
// };

export const suite = (f: (suite: Suite) => Suite): Suite =>
	f(new Suite())
		.on('cycle', (e: Record<string, unknown>) => console.log(String(e.target)))
		.on('complete', function (this: Suite) {
			// // https://github.com/bestiejs/benchmark.js/blob/master/benchmark.js#L772
			// const sorted: Suite[] = this.filter('successful')
			// 	.sort((a, b) => {
			// 		const aStats = a.stats;
			// 		const bStats = b.stats;
			// 		return aStats.mean + aStats.moe > bStats.mean + bStats.moe ? 1 : -1;
			// 	})
			// 	.reverse()
			// 	.reverse();
			// if (isNonEmpty(sorted)) {
			// 	const lastTest = last(sorted);
			// 	// const last = sorted[sorted.length - 1];
			// 	// const log = sorted.reduce((acc: Record<string, unknown>, s: Benchmark.Suite, i: number) => {
			// 	// 	acc[s.name] = {
			// 	// 		['ops/sec']: Number(s.hz.toFixed(s.hz < 100 ? 2 : 0)),
			// 	// 		absolute: (s.hz / last.hz) * 100,
			// 	// 		// sort: sorted
			// 	// 		// relative: i === this.length - 1 ? 0 : 'foo',
			// 	// 	};
			// 	// 	return acc;
			// 	// }, {});
			// }
			//
			// // const slowest = this.filter('slowest');
			//
			// // console.log(this, fastest, slowest);
			console.log('Fastest is', (this.filter('fastest') as any).map('name'));
		});
