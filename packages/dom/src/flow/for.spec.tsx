import { atom, clock } from '@frp-ts/core'
import { domUtils } from '@frp-ts/test-utils'
import { h } from '@frp-ts/dom'
import { constVoid } from '@frp-ts/utils'
import { For, indexKey } from './for'

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

describe('For', () => {
	describe('first render', () => {
		it('returns only boundaries for empty list', () => {
			const result = (
				<For getKey={indexKey} items={newAtom([])}>
					{constVoid}
				</For>
			)
			expect(domUtils.getChildNodes(result)).toEqual([document.createTextNode(''), document.createTextNode('')])
		})
	})
	describe('update', () => {
		it('if item returns DocumentFragment, correctly clears all its children', () => {
			const items = newAtom([1, 2, 3])
			const getKey = (item: number) => item
			const result = (
				<For getKey={getKey} items={items}>
					{(item) => {
						const fragment = document.createDocumentFragment()
						fragment.append(
							document.createTextNode('item start'),
							document.createTextNode(item.get().toString()),
							document.createTextNode('item end'),
						)
						return fragment
					}}
				</For>
			)

			const [
				item1wrapperStart,
				item1Start,
				item1,
				item1End,
				item1WrapperEnd,
				item2WrapperStart,
				item2Start,
				item2,
				item2End,
				item2WrapperEnd,
				item3WrapperStart,
				item3Start,
				item3,
				item3End,
				item3WrapperEnd,
				forEnd,
			] = domUtils.getChildNodes(result)

			// remove the second item
			items.set([1, 3])
			expect(domUtils.getChildNodes(result)).toStrictEqual([
				item1wrapperStart,
				item1Start,
				item1,
				item1End,
				item1WrapperEnd,
				item3WrapperStart,
				item3Start,
				item3,
				item3End,
				item3WrapperEnd,
				forEnd,
			])
		})
	})
})
