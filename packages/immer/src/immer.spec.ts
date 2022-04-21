import { newAtom } from '@frp-ts/core'
import { produceMany } from './immer'

describe('immer', () => {
	describe('produceMany', () => {
		it('updates nested values', () => {
			interface State {
				readonly foo: number
			}
			const state = newAtom<State>({ foo: 0 })
			const methods = produceMany(state, {
				inc: () => (state) => {
					state.foo += 1
				},
			})
			methods.inc()
			expect(state.get().foo).toEqual(1)
		})
	})
})
