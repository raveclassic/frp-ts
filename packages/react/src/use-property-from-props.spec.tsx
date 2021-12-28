import { Env, clock, Property } from '@frp-ts/core'
import { usePropertyFromProps } from './use-property-from-props'
import React, { useMemo } from 'react'
import { render } from '@testing-library/react'
import { constVoid } from '@frp-ts/utils'

const env: Env = {
	clock: clock.newCounterClock(),
}

interface TestProps<T> {
	readonly value: T
	readonly onProperty: (property: Property<T>) => void
}
function Test<T>(props: TestProps<T>) {
	const property = usePropertyFromProps(env)(props.value)
	useMemo(() => props.onProperty(property), [property, props.onProperty])
	return <></>
}

describe('usePropertyFromProps', () => {
	it('returns new Property with initial value from props', () => {
		render(<Test value={1} onProperty={(property) => expect(property.get()).toBe(1)} />)
	})
	it('returns new Property that emits on new value in props', () => {
		const cb: (value: number) => void = jest.fn(constVoid)
		const onProperty = (property: Property<number>) => property.subscribe({ next: () => cb(property.get()) })
		const tree = render(<Test value={1} onProperty={onProperty} />)
		expect(cb).not.toHaveBeenCalled()
		tree.rerender(<Test value={2} onProperty={onProperty} />)
		expect(cb).toHaveBeenLastCalledWith(2)
		expect(cb).toHaveBeenCalledTimes(1)
		tree.rerender(<Test value={2} onProperty={onProperty} />)
		expect(cb).toHaveBeenCalledTimes(1)
	})
})
