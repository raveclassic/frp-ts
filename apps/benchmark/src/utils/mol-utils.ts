import { $mol_wire_fiber } from 'mol_wire_lib'
import { PushMeasurement } from './test-utils'

export const buildMolWireFiber = () => {
	const _0 = new $mol_wire_fiber('_0', (next: number = 0) => next)

	const _10 = new $mol_wire_fiber('_10', () => _0.sync() + 1)
	const _11 = new $mol_wire_fiber('_11', () => _0.sync() + 1)
	const _20 = new $mol_wire_fiber('_20', () => _10.sync() + 1)
	const _21 = new $mol_wire_fiber('_21', () => _10.sync() + _11.sync())
	const _22 = new $mol_wire_fiber('_22', () => _11.sync() + 1)
	const _30 = new $mol_wire_fiber('_30', () => _20.sync() + 1)
	const _31 = new $mol_wire_fiber('_31', () => _20.sync() + _21.sync())
	const _32 = new $mol_wire_fiber('_32', () => _21.sync() + _22.sync())
	const _33 = new $mol_wire_fiber('_33', () => _22.sync() + 1)
	const _40 = new $mol_wire_fiber('_40', () => _30.sync() + _31.sync())
	const _41 = new $mol_wire_fiber('_41', () => _31.sync() + _32.sync())
	const _42 = new $mol_wire_fiber('_42', () => _32.sync() + _33.sync())
	const _50 = new $mol_wire_fiber('_50', () => _40.sync() + _41.sync())
	const _51 = new $mol_wire_fiber('_51', () => _41.sync() + _42.sync())
	const _60 = new $mol_wire_fiber('_60', () => _50.sync() + _51.sync())
	return [_0, _60]
}

export const measureMolWireFiberPush = (
	iteration: number,
	input: $mol_wire_fiber<unknown, [], number>,
	output: $mol_wire_fiber<unknown, [], number>,
): Promise<PushMeasurement> =>
	new Promise((resolve) => {
		const start = performance.now()
		input.put(iteration)
		output.async().then((value) => {
			const time = performance.now() - start
			resolve([value, time])
		})
	})
