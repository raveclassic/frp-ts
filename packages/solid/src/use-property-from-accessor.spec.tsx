import {Accessor, Component, createComputed, createSignal} from 'solid-js'
import { usePropertyFromAccessor } from './use-property-from-accessor'
import { useProperty } from './use-property'
import {newAtom, newProperty} from "@frp-ts/core";
import {render} from "solid-testing-library";

interface TestProps<A> {
	readonly accessor: Accessor<A>
	readonly onChange: (a: A) => void
}

const Test: Component<TestProps<number>> = (props) => {
	const property = usePropertyFromAccessor(props.accessor)
	const value = useProperty(property)
	createComputed(() => props.onChange(value()))
	return null
}

describe('usePropertyFromAccessor', () => {
	it('returns initial value', () => {
		const [get] = createSignal(1)

		const property = usePropertyFromAccessor(get)

		expect(property.get()).toBe(1)
	})
	it('return newValue after set', () => {
		const [get, set] = createSignal(1)

		const property = usePropertyFromAccessor(get)

		set(2)

		expect(property.get()).toBe(2)
	})
	it('emits notification after set', () => {
		const [get, set] = createSignal(1)

		const property = usePropertyFromAccessor(get)

		const cb1 = jest.fn()
		property.subscribe({
			next: cb1,
		})

		set(2)

		expect(cb1).toBeCalledTimes(1)
	})
	it('unsubscribes from accessor on unmount', () => {
		const [get, set] = createSignal(1)

		const cb1 = jest.fn<void, [number]>()
		const result = render(() => <Test accessor={get} onChange={cb1} />)

		expect(cb1).toBeCalledTimes(1)

		result.unmount()

		set(2)

		expect(cb1).toBeCalledTimes(1)
	})
})
