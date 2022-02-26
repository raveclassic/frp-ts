export const inc = (value: number): number => value + 1
export const sum = <Values extends readonly number[]>(...values: Values): number =>
	values.reduce((acc, value) => acc + value, 0)
export const ITERATIONS = 1_000_000

export type PushMeasurement = readonly [value: number, time: number]

interface LogValues {
	readonly med: number
	readonly min: number
	readonly max: number
}

export function printLogs(results: Record<string, LogValues>) {
	const medFastest = Math.min(...Object.values(results).map(({ med }) => med))

	const names = Object.keys(results).sort((a, b) => b.length - a.length)

	Object.entries(results)
		.sort(([, { med: a }], [, { med: b }]) => a - b)
		.forEach(([name, { min, med, max }]) => {
			console.log(
				name + ` `.repeat(names[0].length - name.length),
				formatPercent(medFastest / med),
				`   `,
				`(${med.toFixed(3)}ms)`,
				`   `,
				{ min: min.toFixed(5), med: med.toFixed(5), max: max.toFixed(5) },
			)
		})
}

function formatPercent(n = 0) {
	return `${n < 1 ? ` ` : ``}${(n * 100).toFixed(0)}%`
}

export function log(values: Array<number>) {
	return {
		min: min(values),
		med: med(values),
		max: max(values),
	}
}

function med(values: Array<number>) {
	if (values.length === 0) return 0

	values = values.map((v) => +v)

	values.sort((a, b) => (a - b < 0 ? 1 : -1))

	var half = Math.floor(values.length / 2)

	if (values.length % 2) return values[half]

	return (values[half - 1] + values[half]) / 2.0
}

function min(values: Array<number>) {
	if (values.length === 0) return 0

	values = values.map((v) => +v)

	values.sort((a, b) => (a - b < 0 ? -1 : 1))

	const limit = Math.floor(values.length / 20)

	return values[limit]
}

function max(values: Array<number>) {
	if (values.length === 0) return 0

	values = values.map((v) => +v)

	values.sort((a, b) => (a - b < 0 ? -1 : 1))

	const limit = values.length - 1 - Math.floor(values.length / 20)

	return values[limit]
}

export function validateResults(...results: readonly number[]) {
	if (new Set(results).size !== 1) {
		throw new Error('ERROR: Results are not equal: ' + results.toString())
	}
}
