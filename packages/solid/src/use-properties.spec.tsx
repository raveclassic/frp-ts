import { newAtom, Property } from '@frp-ts/core'
import { screen, render } from 'solid-testing-library'

import { useProperties } from './use-properties'

interface TestProps<Properties extends readonly Property<unknown>[]> {
	readonly properties: Properties
}

function Test<Properties extends readonly Property<unknown>[]>(props: TestProps<Properties>) {
	const values = useProperties(...props.properties)
	return <div data-testid={'value'}>{values.map((value) => value()).join(',')}</div>
}

describe('useProperties', () => {
	it('returns initial value', async () => {
		const a = newAtom(1)
		const b = newAtom(2)
		const c = newAtom(3)

		render(() => <Test properties={[a, b, c]} />)
		const component = await screen.findByTestId('value')

		expect(component.textContent).toBe('1,2,3')
	})
})
