import { newAtom } from '@frp-ts/core'
import { produceMany } from './immer'
import { produce } from 'immer'

describe('immer', () => {
	describe('direct integration', () => {
		it('updates the state with "produce"', () => {
			interface State {
				readonly foo: number
			}
			const state = newAtom<State>({ foo: 0 })
			state.modify(
				produce((state) => {
					state.foo++
				}),
			)
			expect(state.get()).toEqual<State>({ foo: 1 })
		})
	})
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
	describe('stress test', () => {
		it('runs', () => {
			interface Dog {
				name: string
			}
			interface House {
				dog: Dog
			}
			interface AppState {
				house: House
			}

			const initialState: AppState = { house: { dog: { name: 'Fido' } } }
			const storeState = newAtom(initialState)
			const storeMethods = produceMany(storeState, {
				renameTheDog: (newName: string) => (state) => {
					state.house.dog.name = newName
				},
			})

			const store = { ...storeState, ...storeMethods }

			store.renameTheDog('Odif')
			expect(store.get()).toEqual<AppState>({
				house: {
					dog: {
						name: 'Odif',
					},
				},
			})
		})
	})
})
