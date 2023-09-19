import { newAtom, newProperty, Property } from '@frp-ts/core'
import { screen, render } from 'solid-testing-library'
import { Component } from 'solid-js'

import { useProperty } from './use-property'

interface TestProps<A> {
	readonly property: Property<A>
}

const Test: Component<TestProps<number>> = (props) => {
	const value = useProperty(props.property)
	return <div data-testid={'value'}>{value()}</div>
}

describe('useProperty', () => {
	it('returns initial value', async () => {
		const a = newAtom(123)

		render(() => <Test property={a} />)
		const component = await screen.findByTestId('value')

		expect(component.textContent).toBe('123')
	})
	it('rerender if newValue is emitted', async () => {
		const a = newAtom(123)

		render(() => <Test property={a} />)
		const component = await screen.findByTestId('value')

		expect(component.textContent).toBe('123')

		a.set(321)

		expect(component.textContent).toBe('321')
	})
	it('unsubscribes from property on unmount', () => {
		const a = newAtom(1)

		const unsubscribeCallback = jest.fn()
		const subscribeCallback = jest.fn()

		const proxy = newProperty(a.get, (observer) => {
			subscribeCallback()
			const subscription = a.subscribe(observer)
			return {
				unsubscribe: () => {
					unsubscribeCallback()
					subscription.unsubscribe()
				},
			}
		})

		const result = render(() => <Test property={proxy} />)

		a.set(2)

		result.unmount()

		expect(subscribeCallback).toBeCalledTimes(1)
		expect(unsubscribeCallback).toBeCalledTimes(1)
	})
})
