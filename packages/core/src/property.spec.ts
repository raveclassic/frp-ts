import { Atom, newAtom } from './atom'

import { never, newObservable } from './observable'
import { constVoid } from '@frp-ts/utils'
import { combine, flatten, fromObservable, newProperty, Property, scan, tap } from './property'
import { from, Observable, Subject } from 'rxjs'
import { action, newEmitter } from './emitter'
import { attachSubscription } from '@frp-ts/test-utils'
import { now } from './clock'

describe('combine', () => {
	it('combines', () => {
		const disposeA = jest.fn(constVoid)
		const disposeB = jest.fn(constVoid)
		const a = attachSubscription(newAtom(0), { unsubscribe: disposeA })
		const b = attachSubscription(newAtom(1), { unsubscribe: disposeB })
		const c = combine(a, b, (...args) => args)
		expect(c.get()).toEqual([0, 1])
		const listenerC = jest.fn()
		const disposableC = c.subscribe({ next: listenerC })

		expect(listenerC).toHaveBeenCalledTimes(0)

		a.set(1)
		expect(c.get()).toEqual([1, 1])
		expect(listenerC).toHaveBeenCalledTimes(1)

		b.set(2)
		expect(c.get()).toEqual([1, 2])
		expect(listenerC).toHaveBeenCalledTimes(2)

		expect(disposeA).toHaveBeenCalledTimes(0)
		expect(disposeB).toHaveBeenCalledTimes(0)
		disposableC.unsubscribe()
		expect(disposeA).toHaveBeenCalledTimes(1)
		expect(disposeB).toHaveBeenCalledTimes(1)
	})
	it('emits notifications of middle node when someone get value before proxy notification', () => {
		const a = newAtom(1)
		const b = combine(a, (a) => [a])

		const c = combine(a, b, (v1, v2) => [v1, v2])

		const cb1 = jest.fn()
		// subscribe and read value
		c.subscribe({
			next: () => c.get(),
		})

		b.subscribe({
			next: cb1,
		})

		a.set(2)
		expect(cb1).toBeCalledTimes(1)
	})
	it('maps', () => {
		const f = (n: number) => `value: ${n}`
		const a = newAtom(0)
		const b = combine(a, f)
		const cba = jest.fn()
		const cbb = jest.fn()
		const sa = a.subscribe({ next: cba })
		const sb = b.subscribe({ next: cbb })
		expect(a.get()).toBe(0)
		expect(b.get()).toBe(f(0))
		expect(cba).toHaveBeenCalledTimes(0)
		expect(cbb).toHaveBeenCalledTimes(0)
		a.set(10)
		expect(a.get()).toBe(10)
		expect(b.get()).toBe(f(10))
		expect(cba).toHaveBeenCalledTimes(1)
		expect(cbb).toHaveBeenCalledTimes(1)
		sa.unsubscribe()
		sb.unsubscribe()
	})
	describe('memoization', () => {
		it('memoizes 0 args', () => {
			const f = jest.fn(constVoid)
			const c = combine(f)
			c.get()
			c.get()
			expect(f).toHaveBeenLastCalledWith()
			expect(f).toHaveBeenCalledTimes(1)
		})
		it('memoizes 1 args', () => {
			const f = jest.fn(constVoid)
			const c = combine(newAtom(0), f)
			c.get()
			c.get()
			expect(f).toHaveBeenLastCalledWith(0)
			expect(f).toHaveBeenCalledTimes(1)
		})
		it('memoizes 2 args', () => {
			const f = jest.fn(constVoid)
			const c = combine(newAtom(0), newAtom(1), f)
			c.get()
			c.get()
			expect(f).toHaveBeenLastCalledWith(0, 1)
			expect(f).toHaveBeenCalledTimes(1)
		})
		it('memoizes 3 args', () => {
			const f = jest.fn(constVoid)
			const c = combine(newAtom(0), newAtom(1), newAtom(2), f)
			c.get()
			c.get()
			expect(f).toHaveBeenLastCalledWith(0, 1, 2)
			expect(f).toHaveBeenCalledTimes(1)
		})
		it('memoizes 4 args', () => {
			const f = jest.fn(constVoid)
			const c = combine(newAtom(0), newAtom(1), newAtom(2), newAtom(3), f)
			c.get()
			c.get()
			expect(f).toHaveBeenLastCalledWith(0, 1, 2, 3)
			expect(f).toHaveBeenCalledTimes(1)
		})
		it('memoizes 5 args', () => {
			const f = jest.fn(constVoid)
			const c = combine(newAtom(0), newAtom(1), newAtom(2), newAtom(3), newAtom(4), f)
			c.get()
			c.get()
			expect(f).toHaveBeenLastCalledWith(0, 1, 2, 3, 4)
			expect(f).toHaveBeenCalledTimes(1)
		})
		it('memoizes 6 args and more', () => {
			const f = jest.fn(constVoid)
			const c = combine(newAtom(0), newAtom(1), newAtom(2), newAtom(3), newAtom(4), newAtom(5), f)
			c.get()
			c.get()
			expect(f).toHaveBeenLastCalledWith(0, 1, 2, 3, 4, 5)
			expect(f).toHaveBeenCalledTimes(1)
		})
	})
	it('never emits if all arguments never emit', () => {
		const a: Property<boolean> = {
			...newAtom(true),
			subscribe: never.subscribe,
		}
		const b = combine(a, () => false)
		expect(b.subscribe).toBe(never.subscribe)
	})
	it('emits exactly the last value from several updates inside action', () => {
		const a = newAtom(0)
		const b = newAtom(0)
		const c = combine(a, b, (a, b) => a + b)
		const cb: (value: number) => void = jest.fn()
		c.subscribe({
			next: () => cb(c.get()),
		})

		action(() => {
			a.set(1)
			b.set(1)
		})
		expect(cb).toHaveBeenCalledTimes(1)
		expect(cb).toHaveBeenLastCalledWith(2)
	})
	it('does not emit if projected value did not change and combined property has at least one consumer', () => {
		const a = newAtom(0)
		const b = newAtom(1)
		const c = combine(a, b, (a, b) => a + b)
		const o = {
			next: jest.fn(),
		}
		c.subscribe(o)
		expect(o.next).toHaveBeenCalledTimes(0)

		action(() => {
			a.set(1)
			b.set(0)
		})
		action(() => {
			a.set(0)
			b.set(1)
		})
		expect(o.next).toHaveBeenCalledTimes(0)
	})
	it('emits notification if read new value after being set inside action', () => {
		const a = newAtom(1)
		const b = combine(a, (a) => [a])

		const cb1 = jest.fn()
		b.subscribe({
			next: cb1,
		})

		action(() => {
			a.set(2)
			b.get() // trigger shouldNotify
		})

		expect(cb1).toBeCalledTimes(1)
	})
	it('multicasts the result observable', () => {
		const emitter = newEmitter()
		// we need a property that always has a new value
		// so that projection function is not memoized by combine
		const a = newProperty(now, emitter.subscribe)
		const cb = jest.fn(now)
		const c = combine(a, cb)
		const cb1 = jest.fn(constVoid)
		const cb2 = jest.fn(constVoid)
		c.subscribe({ next: cb1 })
		c.subscribe({ next: cb2 })
		// imitate consumer to warm up the cache
		c.get()
		cb.mockClear()
		emitter.next(now())
		expect(cb).toHaveBeenCalledTimes(1)
	})
	it('correctly caches undefined value', () => {
		const a = newAtom<number | undefined>(0)
		const b = combine(a, (a) => a)
		// at this moment cache is not initialized
		const cb = jest.fn(constVoid)
		b.subscribe({ next: cb })
		expect(cb).toHaveBeenCalledTimes(0)
		a.set(undefined)
		expect(cb).toHaveBeenCalledTimes(1)
	})
})

describe('flatten', () => {
	const f = (n: number): string => `value: ${n}`
	it('chains get', () => {
		const a = newAtom(0)
		// don't destruct inner because reference is overwritten in chain
		let inner: Atom<string> = newAtom('')
		const [{ get: getB }] = flatten(
			combine(a, (a) => {
				inner = newAtom(f(a))
				return inner
			}),
		)
		const { get: getA } = a
		expect(getA()).toBe(0)
		expect(getB()).toBe(f(0))
		expect(inner.get()).toBe(f(0))
		a.set(1)
		expect(getA()).toBe(1)
		expect(getB()).toBe(f(1))
		expect(inner.get()).toBe(f(1))
	})
	it('ignores outlive last listener disposal', () => {
		const a = newAtom(0)
		const [{ get: getB, subscribe: b }] = flatten(combine(a, (a) => newAtom(f(a))))
		expect(getB()).toBe(f(0))
		const s = b({ next: constVoid })
		a.set(1)
		expect(getB()).toBe(f(1))
		// dispose
		s.unsubscribe()
		a.set(2)
		// should still propagate get to outer
		expect(getB()).toBe(f(2))
	})
	it('does not pass notifications from source', () => {
		const a = newAtom(0)
		const [{ subscribe: b }] = flatten(combine(a, (a) => newAtom(f(a))))
		const cb = jest.fn()
		const s = b({ next: cb })
		expect(cb).toHaveBeenCalledTimes(0)
		a.set(1)
		expect(cb).toHaveBeenCalledTimes(0)
		s.unsubscribe()
	})
	it('switches to notifications from inner source', () => {
		const a = newAtom(0)
		const inner = newAtom('')
		const [{ subscribe: b }] = flatten(combine(a, () => inner))
		const cb = jest.fn()
		expect(cb).toHaveBeenCalledTimes(0)
		const s = b({ next: cb })
		inner.set('foo')
		expect(cb).toHaveBeenCalledTimes(1)
		s.unsubscribe()
	})
	it('disposes previous subscription to inner source on passed source emit', () => {
		const a = newAtom(0)
		const inner1Dispose = jest.fn()
		const innerSource1 = attachSubscription(newAtom(''), { unsubscribe: inner1Dispose })
		const inner2 = newAtom('')
		const [{ subscribe: b }] = flatten(combine(a, (a) => (a === 0 ? innerSource1 : inner2)))
		const cb = jest.fn()
		const sb = b({ next: cb })
		expect(inner1Dispose).toHaveBeenCalledTimes(0)
		expect(cb).toHaveBeenCalledTimes(0)
		innerSource1.set('foo')
		expect(inner1Dispose).toHaveBeenCalledTimes(0)
		expect(cb).toHaveBeenCalledTimes(1)
		// switch b to inner2
		a.set(1)
		expect(inner1Dispose).toHaveBeenCalledTimes(1)
		expect(cb).toHaveBeenCalledTimes(1)
		innerSource1.set('bar')
		expect(inner1Dispose).toHaveBeenCalledTimes(1)
		// b should not be notified about inner1 because it's switched to inner2
		expect(cb).toHaveBeenCalledTimes(1)
		sb.unsubscribe()
	})
	it('unsubscribes from source by outer dispose', () => {
		const disposeA = jest.fn()
		const sourceA: Property<boolean> = {
			...newAtom(true),
			subscribe: () => ({
				unsubscribe: disposeA,
			}),
		}
		const inner = newAtom('')
		const [, subscriptionB] = flatten(combine(sourceA, () => inner))
		subscriptionB.unsubscribe()
		expect(disposeA).toHaveBeenCalledTimes(1)
	})
	it('multicasts', () => {
		const a = newAtom(0)
		const inner = newAtom('')
		const [{ subscribe: b }] = flatten(combine(a, () => inner))
		const cb1 = jest.fn()
		const s1 = b({ next: cb1 })
		const cb2 = jest.fn()
		const s2 = b({ next: cb2 })

		inner.set('foo')
		expect(cb1).toHaveBeenCalledTimes(1)
		expect(cb2).toHaveBeenCalledTimes(1)

		s1.unsubscribe()
		s2.unsubscribe()
	})
})

describe('tap', () => {
	it('taps', () => {
		const a = newAtom(0)
		const cb = jest.fn()
		const { subscribe: b } = tap(cb)(a)
		const s = b({ next: constVoid })
		expect(cb).toHaveBeenCalledTimes(0)
		a.set(1)
		expect(cb).toHaveBeenCalledWith(1)
		s.unsubscribe()
	})
})

describe('diamond flow', () => {
	it('notifies combined once on each source emit', () => {
		const a = newAtom(0)
		const b = combine(a, (n) => n + 1)
		const c = combine(a, (n) => n / 1)

		const d = combine(b, c, (...args) => args)
		const cb = jest.fn()
		d.subscribe({ next: cb })

		expect(cb).toHaveBeenCalledTimes(0)

		a.set(1)
		expect(cb).toHaveBeenCalledTimes(1)

		a.set(2)
		expect(cb).toHaveBeenCalledTimes(2)
	})
})
describe('interop observable', () => {
	it('single property', () => {
		const a = newAtom(1)

		const cb = jest.fn()
		const subs = from(a).subscribe(cb)

		// should replay current value
		expect(cb).toHaveBeenCalledTimes(1)
		expect(cb).toBeCalledWith(1)

		a.set(2)
		// should notify change
		expect(cb).toHaveBeenCalledTimes(2)
		expect(cb).toBeCalledWith(2)

		subs.unsubscribe()
		a.set(3)
		// should not notify after unsubscribe
		expect(cb).toHaveBeenCalledTimes(2)
	})
	it('combined properties', () => {
		const a = newAtom(10)
		const b = newAtom(20)
		const p = combine(a, b, (a, b) => a + b)

		const cb = jest.fn()
		const subs = from(p).subscribe(cb)

		// should replay current value
		expect(cb).toHaveBeenCalledTimes(1)
		expect(cb).toBeCalledWith(30)

		a.set(0)
		// should notify if single change
		expect(cb).toHaveBeenCalledTimes(2)
		expect(cb).toBeCalledWith(20)

		// should notify changes
		a.set(11)
		expect(cb).toHaveBeenCalledTimes(3)
		b.set(22)
		expect(cb).toHaveBeenCalledTimes(4)
		expect(cb).toBeCalledWith(33)

		subs.unsubscribe()
		b.set(0)

		// should not notify after unsubscribe
		expect(cb).toHaveBeenCalledTimes(4)
	})
	it('emits exactly the last value from several updates inside action', () => {
		const a = newAtom(0)
		const cb = jest.fn()
		from(a).subscribe(cb)
		cb.mockClear()

		action(() => {
			a.set(1)
			a.set(2)
		})
		expect(cb).toHaveBeenCalledTimes(1)
		expect(cb).toHaveBeenLastCalledWith(2)
	})
})
describe('fromObservable', () => {
	it('propagates changes', () => {
		const s = new Subject<number>()
		const dispose = jest.fn()
		const obs = new Observable<number>((observer) => {
			const sub = s.subscribe(observer)
			return {
				unsubscribe(): void {
					sub.unsubscribe()
					dispose()
				},
			}
		})

		const [{ get: getA, subscribe: a }, disposeA] = fromObservable(0, obs)
		expect(getA()).toBe(0)
		const cb = jest.fn()
		const sub = a({ next: cb })
		// check value
		s.next(1)
		expect(getA()).toBe(1)
		expect(cb).toHaveBeenCalledTimes(1)
		// check duplicates
		s.next(1)
		expect(cb).toHaveBeenCalledTimes(1)
		// check listener disposal
		sub.unsubscribe()
		// should keep subscription
		expect(dispose).toHaveBeenCalledTimes(0)
		s.next(2)
		// should not notify listener
		expect(cb).toHaveBeenCalledTimes(1)
		// but should update value
		expect(getA()).toBe(2)
		// check full dispose
		disposeA.unsubscribe()
		// should unsubscribe from source
		expect(dispose).toHaveBeenCalledTimes(1)
		// should not ignore any updates
		s.next(3)
		expect(cb).toHaveBeenCalledTimes(1)
		expect(getA()).toBe(2)
	})
	it('supports complete', () => {
		const s = new Subject<number>()
		const [{ get: getA, subscribe: a }] = fromObservable(0, s)
		const cb = jest.fn()
		const sub = a({ next: cb })
		s.next(1)
		expect(getA()).toBe(1)
		expect(cb).toHaveBeenCalledTimes(1)
		s.complete()
		// should ignore any updates
		s.next(2)
		expect(getA()).toBe(1)
		expect(cb).toHaveBeenCalledTimes(1)
		sub.unsubscribe()
	})
})
describe('scan', () => {
	it('scans', () => {
		const s = new Subject<number>()
		const dispose = jest.fn()
		const obs = newObservable<number>((observer) => {
			const sub = s.subscribe(observer)
			return () => {
				sub.unsubscribe()
				dispose()
			}
		})
		const [{ get: getA, subscribe: a }, subscriptionA] = scan((acc, n: number) => acc + n, 1)(obs)
		expect(getA()).toBe(1)
		const cb = jest.fn()
		const sub = a({ next: cb })
		// check value
		s.next(1)
		expect(getA()).toBe(2)
		expect(cb).toHaveBeenCalledTimes(1)
		// check duplicates
		s.next(0)
		expect(getA()).toBe(2)
		expect(cb).toHaveBeenCalledTimes(1)
		// check listener disposal
		sub.unsubscribe()
		// should keep subscription
		expect(dispose).toHaveBeenCalledTimes(0)
		s.next(1)
		// should not notify listener
		expect(cb).toHaveBeenCalledTimes(1)
		// but should update value
		expect(getA()).toBe(3)
		// check full dispose
		subscriptionA.unsubscribe()
		// should unsubscribe from source
		expect(dispose).toHaveBeenCalledTimes(1)
		// should not ignore any updates
		s.next(1)
		expect(cb).toHaveBeenCalledTimes(1)
		expect(getA()).toBe(3)
	})
})
