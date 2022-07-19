import { constVoid } from '@frp-ts/utils'
import { fromInteropObservable, never, Observable, subscriptionNone } from './observable'
import { newAtom } from './atom'
import { newAdapter } from '@frp-ts/test-utils'

describe('observable', () => {
	describe('never', () => {
		it('returns subscriptionNever', () => {
			expect(
				never.subscribe({
					next: constVoid,
				}),
			).toBe(subscriptionNone)
		})
	})
	describe('fromInteropObservable', () => {
		it('returns underlying observable stored under Symbol.observable key', () => {
			const source = newAtom('foo')
			// check the type as well
			const result: Observable<string> = fromInteropObservable(source)
			const cb = jest.fn(constVoid)
			result.subscribe({ next: cb })
			source.set('bar')
			expect(cb).toHaveBeenLastCalledWith('bar')
		})
		it('returns self if Symbol.observable is not found', () => {
			const [source, next] = newAdapter<string>()
			const result = fromInteropObservable(source)
			const cb = jest.fn(constVoid)
			result.subscribe({ next: cb })
			next('bar')
			expect(cb).toHaveBeenLastCalledWith('bar')
		})
	})
})
