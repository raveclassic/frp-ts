import { atom, clock } from '@frp-ts/core'
import { domUtils } from '@frp-ts/test-utils'
import { h } from '.'
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
})
