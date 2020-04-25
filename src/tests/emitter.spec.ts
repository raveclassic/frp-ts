import { Disposable, Listener, newEmitter } from '../emitter'
import { constVoid } from 'fp-ts/lib/function'

describe('Emitter', () => {
	it('should multicast', () => {
		const e = newEmitter()
		const f1 = jest.fn()
		const f2 = jest.fn()
		e.subscribe(f1)
		e.subscribe(f2)
		e.notify(0)
		expect(f1).toHaveBeenCalledWith(0)
		expect(f2).toHaveBeenCalledWith(0)
	})
	it('should not emit if notified within the same tick', () => {
		const e = newEmitter()
		const f = jest.fn()
		e.subscribe(f)
		e.notify(0)
		e.notify(0)
		e.notify(0)
		expect(f).toHaveBeenCalledTimes(1)
	})
	it('should remove subscriptions immediately even while notifying', () => {
		const e = newEmitter()
		const f1 = jest.fn()
		const s1 = jest.fn(e.subscribe(f1))
		// now we have child subscriptions, calling next will iterate over them
		// check if it's possible to unsubscribe immediately on notification
		const f2: Listener = jest.fn(() => s2())
		const s2 = jest.fn(e.subscribe(f2))
		// add more subscriptions
		const f3 = jest.fn()
		const s3 = jest.fn(e.subscribe(f3))
		// notify!
		e.notify(0)
		expect(f1).toHaveBeenCalledTimes(1)
		expect(s1).toHaveBeenCalledTimes(0)
		expect(f2).toHaveBeenCalledTimes(1)
		expect(s2).toHaveBeenCalledTimes(1)
		expect(f3).toHaveBeenCalledTimes(1)
		expect(s3).toHaveBeenCalledTimes(0)
	})
	it('should not notify new subscriptions added immediately while notifying', () => {
		const e = newEmitter()
		const f1 = jest.fn()
		const s1 = jest.fn(e.subscribe(f1))
		// now we have child subscriptions, calling next will iterate over them
		// check if it's possible to add new subscriptions immediately on notification
		const f2 = jest.fn()
		let s2: Disposable = constVoid
		const f3: Listener = jest.fn(() => {
			s2?.()
			s2 = jest.fn(e.subscribe(f2))
		})
		const s3 = jest.fn(e.subscribe(f3))
		// add some more
		const f4 = jest.fn()
		const s4 = jest.fn(e.subscribe(f4))
		// notify!
		e.notify(0)
		expect(f1).toHaveBeenCalledTimes(1)
		expect(s1).toHaveBeenCalledTimes(0)
		expect(f3).toHaveBeenCalledTimes(1)
		expect(s3).toHaveBeenCalledTimes(0)
		expect(f4).toHaveBeenCalledTimes(1)
		expect(s4).toHaveBeenCalledTimes(0)
		// new subscriptions added in the same tick should **NOT** be notified to avoid loops and races
		expect(f2).toHaveBeenCalledTimes(0)
		expect(s2).toHaveBeenCalledTimes(0)
	})
})
