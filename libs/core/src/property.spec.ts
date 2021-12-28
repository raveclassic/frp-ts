import { Atom } from './atom'

import { never, newObservable } from './observable'
import { constVoid } from '@frp-ts/utils'
import { combine, flatten, Property, tap } from './property'
import { Observable, Subject } from 'rxjs'
import { Env, newCounterClock } from './clock'
import { atom, property } from '.'
import { clockUtils, emitterUtils } from '@frp-ts/test-utils'

const env: Env = {
	clock: newCounterClock(),
}

const newAtom = atom.newAtom(env)
const scan = property.scan(env)
const fromObservable = property.fromObservable(env)

describe('combine', () => {
	it('combines', () => {
		const disposeA = jest.fn(constVoid)
		const disposeB = jest.fn(constVoid)
		const a = emitterUtils.attachSubscription(newAtom(0), { unsubscribe: disposeA })
		const b = emitterUtils.attachSubscription(newAtom(1), { unsubscribe: disposeB })
		const { get: getC, subscribe: c } = combine(a, b, (...args) => args)
		expect(getC()).toEqual([0, 1])
		const listenerC = jest.fn()
		const disposableC = c({ next: listenerC })

		expect(listenerC).toHaveBeenCalledTimes(0)

		a.set(1)
		expect(getC()).toEqual([1, 1])
		expect(listenerC).toHaveBeenCalledTimes(1)

		b.set(2)
		expect(getC()).toEqual([1, 2])
		expect(listenerC).toHaveBeenCalledTimes(2)

		expect(disposeA).toHaveBeenCalledTimes(0)
		expect(disposeB).toHaveBeenCalledTimes(0)
		disposableC.unsubscribe()
		expect(disposeA).toHaveBeenCalledTimes(1)
		expect(disposeB).toHaveBeenCalledTimes(1)
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
	it('memoizes', () => {
		const f = jest.fn((n: number) => `value: ${n}`)
		const a = newAtom(0)
		const { get: getB, subscribe: b } = combine(a, f)
		const s = b({ next: constVoid })
		expect(f).toHaveBeenCalledTimes(0)
		getB()
		expect(f).toHaveBeenCalledTimes(1)
		getB()
		expect(f).toHaveBeenCalledTimes(1) // value didn't change, should not increase call amount
		s.unsubscribe()
	})
	it('never emits if all arguments never emit', () => {
		const a: Property<boolean> = { get: () => true, subscribe: never.subscribe }
		const b = combine(a, () => false)
		expect(b.subscribe).toBe(never.subscribe)
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
		const innerSource1 = emitterUtils.attachSubscription(newAtom(''), { unsubscribe: inner1Dispose })
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
			get: () => true,
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

		const { subscribe: d } = combine(b, c, (...args) => args)
		const cb = jest.fn()
		const sub = d({ next: cb })

		expect(cb).toHaveBeenCalledTimes(0)

		a.set(1)
		expect(cb).toHaveBeenCalledTimes(1)

		a.set(2)
		expect(cb).toHaveBeenCalledTimes(2)

		sub.unsubscribe()
	})
	it('notifies combined on each different source emit in different ticks', () => {
		const clock = clockUtils.newVirtualClock(0)
		const newProducer = atom.newAtom({
			clock,
		})
		const a = newProducer(0)
		const b = newProducer(0)
		const c = combine(a, b, (...args) => args)
		const cb = jest.fn()
		const sub = c.subscribe({ next: cb })

		expect(cb).toHaveBeenCalledTimes(0)
		// first a notification
		a.set(1)
		// next a notification in the same tick
		b.set(2)
		expect(cb).toHaveBeenCalledTimes(1)
		// next tick
		clock.next()
		// first b notification
		b.set(1)
		expect(cb).toHaveBeenCalledTimes(2)
		// next b notification in the same tick
		a.set(2)
		expect(cb).toHaveBeenCalledTimes(2)

		sub.unsubscribe()
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
