import { newEmitter } from './emitter'
import { now } from './clock'
import { newInteropObservable } from './interop-observable'

describe('interop-observable', () => {
	it('does not call source get when observer is missing next method', () => {
		const emitter = newEmitter()
		const cb = jest.fn(now)
		const source = newInteropObservable(cb, emitter.subscribe)
		source.subscribe({ next: undefined })
		expect(cb).not.toHaveBeenCalled()
		emitter.next(now())
		expect(cb).not.toHaveBeenCalled()
	})
})
