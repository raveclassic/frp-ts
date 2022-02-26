import { AtomSelfBinded, createAtom, defaultStore } from '@reatom/core'
import { PushMeasurement } from './test-utils'

export const buildReatom = (): [
	input: AtomSelfBinded<
		number,
		{
			entry: (payload: number) => number
		}
	>,
	output: AtomSelfBinded<number, {}>,
] => {
	const _0 = createAtom(
		{ entry: (payload: number) => payload },
		({ onAction }, state = 0) => {
			// onAction(`entry`, (v) => (state = v % 2 ? state : v + 1))
			onAction(`entry`, (v) => (state = v))
			return state
		},
		{},
	)
	const _10 = createAtom({ _0 }, ({ get }) => get('_0') + 1)
	const _11 = createAtom({ _0 }, ({ get }) => get('_0') + 1)
	const _20 = createAtom({ _10 }, ({ get }) => get('_10') + 1)
	const _21 = createAtom({ _10, _11 }, ({ get }) => get('_10') + get('_11'))
	const _22 = createAtom({ _11 }, ({ get }) => get('_11') + 1)
	const _30 = createAtom({ _20 }, ({ get }) => get('_20') + 1)
	const _31 = createAtom({ _20, _21 }, ({ get }) => get('_20') + get('_21'))
	const _32 = createAtom({ _21, _22 }, ({ get }) => get('_21') + get('_22'))
	const _33 = createAtom({ _22 }, ({ get }) => get('_22') + 1)
	const _40 = createAtom({ _30, _31 }, ({ get }) => get('_30') + get('_31'))
	const _41 = createAtom({ _31, _32 }, ({ get }) => get('_31') + get('_32'))
	const _42 = createAtom({ _32, _33 }, ({ get }) => get('_32') + get('_33'))
	const _50 = createAtom({ _40, _41 }, ({ get }) => get('_40') + get('_41'))
	const _51 = createAtom({ _41, _42 }, ({ get }) => get('_41') + get('_42'))
	const _60 = createAtom({ _50, _51 }, ({ get }) => get('_50') + get('_51'))
	return [_0, _60]
}

export const measureReatomPush = (
	iteration: number,
	input: AtomSelfBinded<
		number,
		{
			entry: (payload: number) => number
		}
	>,
	output: AtomSelfBinded<number, {}>,
): Promise<PushMeasurement> =>
	new Promise((resolve) => {
		let hasValue = false
		const subscription = output.subscribe((value) => {
			if (hasValue) {
				const time = performance.now() - start
				subscription()
				resolve([value, time])
			}
			hasValue = true
		})
		const start = performance.now()
		defaultStore.dispatch(input.entry(iteration))
	})
