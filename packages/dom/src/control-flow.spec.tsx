/** @jsx h.createElement */
import { atom, clock, property } from '@frp-ts/core'
import { h, PrimitiveElementChild } from './h'
import { Bind, For } from './control-flow'
import { domUtils } from '@frp-ts/test-utils'
import { cleanup, CURRENT_CONTEXT, disposeContext } from './context'

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

describe('control-flow', () => {
	describe('Bind', () => {
		beforeEach(() => disposeContext(CURRENT_CONTEXT))
		it('renders primitive children', () => {
			const children = newAtom<PrimitiveElementChild>('foo')
			const result = <Bind>{children}</Bind>
			expect(domUtils.getChildNodes(result)).toEqual([
				document.createTextNode(''),
				document.createTextNode('foo'),
				document.createTextNode(''),
			])
		})
		it('renders Node child and disposes child context on new children', () => {
			const cb = jest.fn(function cleanChild() {
				return undefined
			})
			interface ChildProps {
				readonly value: PrimitiveElementChild
			}
			const Child = (props: ChildProps) => {
				cleanup(cb)
				return props.value
			}
			const source = newAtom<PrimitiveElementChild>('foo')
			const result = (
				<Bind name={'Test'}>
					{property.combine(source, (value) => (
						<Child value={value} />
					))}
				</Bind>
			)
			expect(domUtils.getChildNodes(result)).toEqual([
				document.createTextNode(''),
				document.createTextNode('foo'),
				document.createTextNode(''),
			])
			// cleanup should not be called on first render
			expect(cb).toHaveBeenCalledTimes(0)
			// update children
			source.set('bar')
			// cleanup should have been called because `Child` component is rerendered
			expect(cb).toHaveBeenCalledTimes(1)
			// dispose root
			disposeContext(CURRENT_CONTEXT)
			// cleanup should have been called because `Child` component is disposed
			expect(cb).toHaveBeenCalledTimes(2)
		})
	})

	describe('For', () => {
		it('runs', () => {
			const list = newAtom([1, 2, 3])
			const result = <For value={list} key={(item, index) => index} item={(item) => <div>Hey!, {item}</div>} />
		})
	})
})
