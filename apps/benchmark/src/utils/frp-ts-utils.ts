import { Atom, combine, newAtom, Property } from '@frp-ts/core'
import { PushMeasurement } from './test-utils'

export const buildFRPTS = (): [input: Atom<number>, output: Property<number>] => {
	const _0 = newAtom(0)
	const _10 = combine(_0, (v) => v + 1)
	const _11 = combine(_0, (v) => v + 1)
	const _20 = combine(_10, (v) => v + 1)
	const _21 = combine(_10, _11, (a, b) => a + b)
	const _22 = combine(_11, (v) => v + 1)
	const _30 = combine(_20, (v) => v + 1)
	const _31 = combine(_20, _21, (a, b) => a + b)
	const _32 = combine(_21, _22, (a, b) => a + b)
	const _33 = combine(_22, (v) => v + 1)
	const _40 = combine(_30, _31, (a, b) => a + b)
	const _41 = combine(_31, _32, (a, b) => a + b)
	const _42 = combine(_32, _33, (a, b) => a + b)
	const _50 = combine(_40, _41, (a, b) => a + b)
	const _51 = combine(_41, _42, (a, b) => a + b)
	const _60 = combine(_50, _51, (a, b) => a + b)
	return [_0, _60]
}

export const measureFRPTSPush = (
	iteration: number,
	input: Atom<number>,
	output: Property<number>,
): Promise<PushMeasurement> =>
	new Promise((resolve) => {
		const subscription = output.subscribe({
			next: () => {
				const value = output.get()
				const time = performance.now() - start
				subscription.unsubscribe()
				resolve([value, time])
			},
		})
		const start = performance.now()
		input.set(iteration)
	})
