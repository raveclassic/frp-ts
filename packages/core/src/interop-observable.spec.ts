import { action, newEmitter } from './emitter'
import { now } from './clock'
import { newInteropObservable } from './interop-observable'
import { newAtom } from './atom'
import { combine } from './property'

describe('interop-observable', () => {
	describe('newInteropObservable', () => {
		it('does not call source get when observer is missing next method', () => {
			const emitter = newEmitter()
			const cb = jest.fn(now)
			const source = newInteropObservable(cb, emitter.subscribe)
			source.subscribe({ next: undefined })
			expect(cb).not.toHaveBeenCalled()
			emitter.next(now())
			expect(cb).not.toHaveBeenCalled()
		})
		it('distinct changes', () => {
			const a = newAtom(1)
			const b = newAtom(0)
			const c = combine(a, b, (a, b) => a + b)

			const source = newInteropObservable(c.get, c.subscribe)
			const cb = jest.fn()
			source.subscribe({
				next: cb,
			})

			// first emit on subscribe
			expect(cb).toBeCalledTimes(1)
			cb.mockClear()

			action(() => {
				a.set(0)
				b.set(1)
			})
			action(() => {
				a.set(1)
				b.set(0)
			})

			expect(cb).not.toHaveBeenCalled()
		})
		it('emit only value change notifications', () => {
			const a = newAtom(1)
			const b = newAtom(0)
			const c = combine(a, b, (a, b) => a + b)

			const source = newInteropObservable(c.get, c.subscribe)
			const cb = jest.fn()

			a.set(0)
			source.subscribe({
				next: cb,
			})
			a.set(1)

			expect(cb).toBeCalledTimes(2)
		})
		it('correctly caches undefined value', () => {
			const a = newAtom<number | undefined>(0)
			const b = combine(a, (a) => a)

			const source = newInteropObservable(b.get, b.subscribe)
			const cb = jest.fn()

			// subscribe to warm up the cache
			source.subscribe({ next: cb })
			expect(cb).toHaveBeenCalledTimes(1)
			a.set(undefined)
			expect(cb).toHaveBeenCalledTimes(2)
		})
	})
})
