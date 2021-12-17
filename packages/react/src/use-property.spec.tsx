import { Property, Env, clock, atom, emitter } from '@frp-ts/core'
import React, { useState } from 'react'
import { useProperty } from './use-property'
import { constVoid } from '@frp-ts/utils'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

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
	it('returns new value from new property', () => {
		const a = newAtom(1)
		const b = newAtom(2)
		const cb = jest.fn(constVoid)
		const tree = render(<Test onValue={cb} property={a} />)
		tree.rerender(<Test onValue={cb} property={b} />)
		expect(cb).toHaveBeenLastCalledWith(2)
	})
	it('subscribes to property immediately during rendering', () => {
		const a = newAtom(1)
		const cb = jest.fn()
		const Component = () => {
			const value = useProperty(a)
			cb(value)
			useState(() => a.set(2))
			return <></>
		}
		render(<Component />)
		expect(cb.mock.calls).toEqual([[1], [2]])
	})
	it('unsubscribes from the previous property and subscribes to the new one', () => {
		const a = newAtom(1)
		const b = newAtom(10)
		const cbA = jest.fn(constVoid)
		const cbB = jest.fn(constVoid)
		const tree = render(<Test onValue={cbA} property={a} />)
		tree.rerender(<Test onValue={cbB} property={b} />)
		cbA.mockClear()
		act(() => a.set(a.get() + 1))
		expect(cbA).not.toHaveBeenCalled()
		act(() => b.set(b.get() + 1))
		expect(cbB).toHaveBeenCalledTimes(2)
	})
	it('does not trigger rerender if value of the new property is the same as value of the previous', () => {
		const e = emitter.newEmitter()
		const property: Property<number> = {
			get: () => 1,
			subscribe: e.subscribe,
		}
		const cb = jest.fn(constVoid)
		render(<Test property={property} onValue={cb} />)
		cb.mockClear()
		act(() => e.next(0))
		act(() => e.next(1))
		expect(cb).not.toHaveBeenCalled()
	})
	it('triggers rerender even if newValue is emitted on the same tick', () => {
		let counter = 0
		const e = emitter.newEmitter()
		const property: Property<number> = {
			get: () => counter++,
			subscribe: e.subscribe,
		}
		const cb = jest.fn(constVoid)
		render(<Test property={property} onValue={cb} />)
		cb.mockClear()
		act(() => e.next(0))
		act(() => e.next(0))
		expect(cb).toHaveBeenCalledTimes(1)
	})
	it('unsubscribes from property on unmount', () => {
		const a = newAtom(1)
		const cb = jest.fn(constVoid)
		const tree = render(<Test onValue={cb} property={a} />)
		cb.mockClear()
		tree.unmount()
		a.set(a.get() + 1)
		expect(cb).not.toHaveBeenCalled()
	})
})
