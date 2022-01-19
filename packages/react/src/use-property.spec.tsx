import { newAtom, newEmitter, newProperty, Property } from '@frp-ts/core'
import React, { useEffect } from 'react'
import { useProperty } from './use-property'
import { constVoid } from '@frp-ts/utils'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

interface TestProps<A> {
	readonly property: Property<A>
	readonly onValue: (value: A) => void
}
function Test<A>(props: TestProps<A>) {
	props.onValue(useProperty(props.property))
	return <></>
}

describe('useProperty', () => {
	it('returns initial value', () => {
		const a = newAtom(123)
		const cb = jest.fn(constVoid)
		render(<Test property={a} onValue={cb} />)
		expect(cb).toHaveBeenCalledTimes(1)
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
			useEffect(() => a.set(2), [])
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
		const e = newEmitter()
		const p = newProperty(() => 1, e.subscribe)
		const cb = jest.fn(constVoid)
		render(<Test property={p} onValue={cb} />)
		cb.mockClear()
		act(() => e.next(0))
		act(() => e.next(1))
		expect(cb).not.toHaveBeenCalled()
	})
	it('triggers rerender even if newValue is emitted on the same tick', () => {
		let counter = 0
		const e = newEmitter()
		const p: Property<number> = newProperty(() => counter++, e.subscribe)
		const cb = jest.fn(constVoid)
		render(<Test property={p} onValue={cb} />)
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
	it('subscribe in strict mode with nested components', () => {
		const a = newAtom(1)
		const cb = jest.fn()

		const InnerComponent = (props: { value: number }) => {
			cb(props.value)
			return <>Value {props.value}</>
		}
		const Component = () => {
			const value = useProperty(a)
			return <InnerComponent value={value} />
		}
		render(
			<React.StrictMode>
				<Component />
			</React.StrictMode>,
		)

		expect(screen.getByText('Value 1')).toBeDefined()
		expect(cb).toBeCalledTimes(2)
		expect(cb).toHaveBeenLastCalledWith(1)

		act(() => {
			a.set(2)
		})

		expect(screen.getByText('Value 2')).toBeDefined()
		expect(cb).toBeCalledTimes(4)
		expect(cb).toHaveBeenLastCalledWith(2)
	})
})
