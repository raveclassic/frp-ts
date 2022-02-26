import { cellx, ICellx } from 'cellx'
import { PushMeasurement } from './test-utils'

export const buildCellX = (): [input: ICellx<number>, output: ICellx<number>] => {
	const _0 = cellx(0)
	const _10 = cellx(() => _0() + 1)
	const _11 = cellx(() => _0() + 1)
	const _20 = cellx(() => _10() + 1)
	const _21 = cellx(() => _10() + _11())
	const _22 = cellx(() => _11() + 1)
	const _30 = cellx(() => _20() + 1)
	const _31 = cellx(() => _20() + _21())
	const _32 = cellx(() => _21() + _22())
	const _33 = cellx(() => _22() + 1)
	const _40 = cellx(() => _30() + _31())
	const _41 = cellx(() => _31() + _32())
	const _42 = cellx(() => _32() + _33())
	const _50 = cellx(() => _40() + _41())
	const _51 = cellx(() => _41() + _42())
	const _60 = cellx(() => _50() + _51())
	return [_0, _60]
}

export const measureCellXPush = (
	iteration: number,
	input: ICellx<number>,
	output: ICellx<number>,
): Promise<PushMeasurement> =>
	new Promise((resolve) => {
		const listener = () => {
			const value = output()
			const time = performance.now() - start
			subscription.unsubscribe(listener)
			resolve([value, time])
		}
		const subscription = output.subscribe(listener)
		const start = performance.now()
		input(iteration)
	})
