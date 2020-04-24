import { Suite } from 'benchmark'

declare module 'benchmark' {
	export interface Suite {
		readonly name: string
	}
}

export const suite = (f: (suite: Suite) => Suite): Suite =>
	f(new Suite())
		.on('cycle', (e: Record<string, unknown>) => console.log(String(e.target)))
		.on('complete', function (this: Suite) {
			console.log('Fastest is', this.filter('fastest').name)
		})
