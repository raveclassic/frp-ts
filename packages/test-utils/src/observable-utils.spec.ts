import { newAdapter } from './observable-utils'
import { constVoid } from '@frp-ts/utils'

describe('observable-utils', () => {
	describe('newAdapter', () => {
		it('forwards next calls to subscribers', () => {
			const [source, next] = newAdapter<string>()
			const cb = jest.fn(constVoid)
			source.subscribe({ next: cb })
			next('foo')
			expect(cb).toHaveBeenLastCalledWith('foo')
		})
		it('resets observer on unsubscribe', () => {
			const [source, next] = newAdapter<string>()
			const cb = jest.fn(constVoid)
			const subscription = source.subscribe({ next: cb })
			subscription.unsubscribe()
			next('foo')
			expect(cb).not.toHaveBeenCalled()
		})
	})
})
