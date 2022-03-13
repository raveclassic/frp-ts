import { newAtom, newScope } from '@frp-ts/core'
import { useScoped } from './use-scoped'
import { render } from '@testing-library/react'
import React from 'react'

describe('useScoped', () => {
	it('renders', async () => {
		const input = newAtom(0)
		const output = newAtom(0)
		const newSyncer = () =>
			newScope(({ cleanup }) => {
				const subscription = input.subscribe({ next: () => output.set(input.get()) })
				cleanup(() => subscription.unsubscribe())
			})
		const Component = () => {
			useScoped(newSyncer)
			return null
		}
		const tree = render(<Component />)
		input.set(1)
		expect(output.get()).toEqual(1)
		input.set(2)
		expect(output.get()).toEqual(2)
		tree.unmount()
		input.set(3)
		expect(output.get()).toEqual(2)
	})
})
