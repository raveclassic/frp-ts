import { memo } from 'react'
import { newAtom, Property } from '@frp-ts/core'
import React from 'react'
import { usePropertyFromProps } from './use-property-from-props'
import { useProperty } from './use-property'
import { act, render } from '@testing-library/react'

describe('integrations', () => {
	it('correctly supports properties with initial "undefined" value components wrapped in "memo" during conditional rendering', async () => {
		interface ChildProps {
			readonly value: Property<string | undefined>
		}
		const Child = memo((props: ChildProps) => {
			const value = useProperty(props.value)
			return <span data-testid={'output'}>{value}</span>
		})

		interface MediatorProps {
			readonly value: string | undefined
		}
		const Mediator = memo((props: MediatorProps) => {
			const value = usePropertyFromProps(props.value)
			if (props.value === undefined) {
				return <span data-testid={'output'}>INITIAL</span>
			} else {
				return <Child value={value} />
			}
		})

		const source = newAtom<string | undefined>(undefined)
		const Root = memo(() => {
			const value = useProperty(source)
			return <Mediator value={value} />
		})

		const tree = render(<Root />)
		expect(tree.getByTestId('output').textContent).toEqual('INITIAL')

		act(() => {
			source.set('1')
		})

		expect(tree.getByTestId('output').textContent).toEqual('1')

		act(() => {
			source.set('2')
		})
		expect(tree.getByTestId('output').textContent).toEqual('2')
	})
})
