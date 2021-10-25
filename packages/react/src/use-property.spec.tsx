import { Property, Env, clock, atom } from '@frp-ts/core'
import React from 'react'
import { useProperty } from './use-property'
import { constVoid } from '@frp-ts/utils'
import { render } from '@testing-library/react'

interface TestProps<A> {
	readonly property: Property<A>
	readonly onValue: (value: A) => void
}
function Test<A>(props: TestProps<A>) {
	props.onValue(useProperty(props.property))
	return <></>
}

const e: Env = {
	clock: clock.newCounterClock(),
}
const newAtom = atom.newAtom(e)

describe('useProperty', () => {
	it('returns initial value', () => {
		const a = newAtom(123)
		const cb = jest.fn(constVoid)
		render(<Test property={a} onValue={cb} />)
		expect(cb).toHaveBeenLastCalledWith(123)
	})
	it('subscribes to property', () => {
		const a = newAtom(123)
		const cb = jest.fn(constVoid)
		render(<Test property={a} onValue={cb} />)
		a.set(456)
		expect(cb).toHaveBeenLastCalledWith(456)
	})
})
