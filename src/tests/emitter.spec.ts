import { Disposable, EventTarget, AddEventListenerOptions, Listener, newEmitter, fromEvent } from '../emitter'
import { constVoid } from 'fp-ts/lib/function'
import { newVirtualClock } from './env'

interface Event {
	readonly type: string
}
interface TestEventTarget extends EventTarget {
	readonly dispatchEvent: (event: Event) => void
}
const newEventTarget = (): TestEventTarget => {
	const storage = new Map<string, Set<() => void>>()
	return {
		addEventListener: (event: string, listener: () => void) => {
			let stored = storage.get(event)
			if (!stored) {
				stored = new Set()
				storage.set(event, stored)
			}
			stored.add(listener)
		},
		removeEventListener: (event: string, listener: () => void) => {
			const stored = storage.get(event)
			if (stored) {
				stored.delete(listener)
			}
		},
		dispatchEvent(event: Event) {
			const stored = storage.get(event.type)
			if (stored) {
				stored.forEach((listener) => listener())
			}
		},
	}
}

describe('Emitter', () => {
	describe('newEmitter', () => {
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
	describe('fromEvent', () => {
		it('should subscribe', () => {
			const target = newEventTarget()
			const addEventListener = jest.spyOn(target, 'addEventListener')
			const removeEventListener = jest.spyOn(target, 'removeEventListener')
			const options: AddEventListenerOptions = {
				capture: true,
				once: true,
				passive: true,
			}
			const clock = newVirtualClock(0)
			const n = fromEvent({ clock })(target, 'click', options)
			// should subscribe
			expect(addEventListener).toHaveBeenCalledTimes(0)
			const cb = jest.fn()
			const d = n(cb)
			expect(addEventListener).toHaveBeenCalledTimes(1)
			expect(addEventListener).toHaveBeenCalledWith('click', jasmine.any(Function), options)
			// should also multicast
			const d2 = n(cb)
			expect(addEventListener).toHaveBeenCalledTimes(1)
			// should notify
			target.dispatchEvent({
				type: 'click',
			})
			expect(cb).toHaveBeenCalledWith(0)
			// should also multicast
			expect(cb).toHaveBeenCalledTimes(1)
			// next tick
			clock.next()
			target.dispatchEvent({
				type: 'click',
			})
			expect(cb).toHaveBeenCalledWith(1)
			// should also multicast
			expect(cb).toHaveBeenCalledTimes(2)
			// should unsubscribe
			expect(removeEventListener).toHaveBeenCalledTimes(0)
			d2()
			// should also multicast
			expect(removeEventListener).toHaveBeenCalledTimes(0)
			d()
			expect(removeEventListener).toHaveBeenCalledTimes(1)
		})
	})
})
