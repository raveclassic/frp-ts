import { Property, Env, clock, atom, property } from '@frp-ts/core'
import React from 'react'
import { useProperties } from './use-properties'
import { constVoid } from '@frp-ts/utils'
import { render } from '@testing-library/react'

interface TestProps<Properties extends readonly Property<unknown>[]> {
	readonly properties: Properties
	readonly onValue: (...properties: property.MapPropertiesToValues<Properties>) => void
}
function Test<Properties extends readonly Property<unknown>[]>(props: TestProps<Properties>) {
	props.onValue(...useProperties(...props.properties))
	return <></>
}

const e: Env = {
	clock: clock.newCounterClock(),
}
const newAtom = atom.newAtom(e)

describe('useProperties', () => {
	it('returns initial value', () => {
		const a = newAtom(1)
		const b = newAtom(2)
		const c = newAtom(3)

		const cb = jest.fn(constVoid)
		render(<Test properties={[a, b, c]} onValue={cb} />)
		expect(cb).toHaveBeenLastCalledWith(1, 2, 3)
	})
})
