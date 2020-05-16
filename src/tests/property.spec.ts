import { flatten, instance, sample, sequence, Property, sampleIO } from '../property'
import { pipe } from 'fp-ts/lib/pipeable'
import { constFalse, constTrue, constVoid } from 'fp-ts/lib/function'
import { Observable, Subject } from 'rxjs'
import { never, newObservable, Observer } from '../observable'
import { newAtom as getNewProducer, Atom } from '../atom'
import { property } from '..'
import { attachSubscription, fromObservable, newAtom, newVirtualClock, scan, testObservable } from './env'

describe('property', () => {
	it('sample testObservable', () => {
		let observer: Observer<number>
		const disposeSampler = jest.fn()
		const sampler = new Observable<number>((obs) => {
			observer = obs
			return disposeSampler
		})
		const nextObserver = (n: number) => observer.next(n)
		const unsubscribe = jest.fn()
		const source = attachSubscription(newAtom(0), { unsubscribe })
		const sampleObservable = sample(testObservable)
		const sampled = sampleObservable(source, sampler)
		const next = jest.fn()
		const complete = jest.fn()
		const subscription = sampled.subscribe({
			next,
			complete,
		})

		// initially should not notify
		expect(next).toHaveBeenCalledTimes(0)
		expect(complete).toHaveBeenCalledTimes(0)

		nextObserver(1)
		// should notify with initial value from source
		expect(next).toHaveBeenCalledTimes(1)
		expect(next).toHaveBeenCalledWith(0)

		source.set(23)
		// should not notify on source notification
		expect(next).toHaveBeenCalledTimes(1)

		nextObserver(2)
		// should notify from last value from source
		expect(next).toHaveBeenCalledTimes(2)
		expect(next).toHaveBeenCalledWith(23)

		subscription.unsubscribe()
		// should dispose sampler
		expect(disposeSampler).toHaveBeenCalledTimes(1)
		// should not dispose source
		expect(unsubscribe).toHaveBeenCalledTimes(0)
	})
	it('sample Property', () => {
		const sampleSource = sample(instance)
		const sampler = newAtom(0)
		const source = newAtom(1)
		const { get: getSampled, subscribe: sampled } = sampleSource(source, sampler)
		expect(getSampled()).toBe(1)
		const cb = jest.fn()
		const d = sampled({ next: cb })
		expect(cb).toHaveBeenCalledTimes(0)
		source.set(2)
		// notifications are not propagated from source
		expect(cb).toHaveBeenCalledTimes(0)
		// but value should be updated
		expect(getSampled()).toBe(1)

		d.unsubscribe()
	})
	it('sampleIO Property', () => {
		const sampleSource = sampleIO(instance)

		const sampler = newAtom(0)
		const source = newAtom(1)
		const sampled = sampleSource(source, sampler)
		expect(sampled.get()()).toBe(1)
		const cb = jest.fn()
		const d = sampled.subscribe({ next: cb })
		expect(cb).toHaveBeenCalledTimes(0)
		source.set(2)
		// notifications are not propagated from source
		expect(cb).toHaveBeenCalledTimes(0)
		// but value should be updated
		expect(sampled.get()()).toBe(2)

		// notifications are propagated from sampler
		sampler.set(1)
		expect(cb).toHaveBeenCalledTimes(1)
		expect(sampled.get()()).toBe(2)

		d.unsubscribe()
	})
	it('sequence', () => {
		const disposeA = jest.fn()
		const disposeB = jest.fn()
		const a = attachSubscription(newAtom(0), { unsubscribe: disposeA })
		const b = attachSubscription(newAtom(1), { unsubscribe: disposeB })
		const { get: getC, subscribe: c } = sequence([a, b])
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
	describe('map', () => {
		it('should map', () => {
			const f = (n: number) => `value: ${n}`
			const a = newAtom(0)
			const b = pipe(a, property.map(f))
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
		it('should memo', () => {
			const f = jest.fn((n: number) => `value: ${n}`)
			const a = newAtom(0)
			const { get: getB, subscribe: b } = pipe(a, property.map(f))
			const s = b({ next: constVoid })
			expect(f).toHaveBeenCalledTimes(0)
			getB()
			expect(f).toHaveBeenCalledTimes(1)
			getB()
			expect(f).toHaveBeenCalledTimes(1) // value didn't change, should not increase call amount
			s.unsubscribe()
		})
		it('should skip never', () => {
			const a: Property<boolean> = { get: constTrue, subscribe: never.subscribe }
			const b = pipe(a, property.map(constFalse))
			expect(b.subscribe).toBe(never.subscribe)
		})
	})
	describe('ap', () => {
		it('should ap', () => {
			const f = (n: number) => n + 1
			const g = (n: number) => n / 2
			const fab = newAtom(f)
			const fa = newAtom(0)
			const b = pipe(fab, property.ap(fa))
			expect(b.get()).toBe(f(0))
			fab.set(g)
			expect(b.get()).toBe(g(0))
			fa.set(1)
			expect(b.get()).toBe(g(1))
			fab.set(f)
			expect(b.get()).toBe(f(1))
		})
		it('should multicast', () => {
			const f = (n: number) => n + 1
			const fab = newAtom(f)
			const fa = newAtom(0)
			const spyFab = jest.fn(fab.subscribe)
			const spyFa = jest.fn(fa.subscribe)
			const fabSource: Property<typeof f> = { get: fab.get, subscribe: spyFab }
			const faSource: Property<number> = { get: fa.get, subscribe: spyFa }
			const b = pipe(fabSource, property.ap(faSource))
			const s1 = b.subscribe({
				next: constVoid,
			})
			expect(spyFab).toHaveBeenCalledTimes(1)
			expect(spyFa).toHaveBeenCalledTimes(1)
			const s2 = b.subscribe({
				next: constVoid,
			})
			expect(spyFab).toHaveBeenCalledTimes(1)
			expect(spyFa).toHaveBeenCalledTimes(1)
			s1.unsubscribe()
			s2.unsubscribe()
		})
		it('should memo', () => {
			const f = jest.fn((n: number) => n + 1)
			const fab = instance.of(f)
			const fa = instance.of(0)
			const { get: getR } = pipe(fab, property.ap(fa))
			getR()
			expect(f).toHaveBeenCalledTimes(1)
			getR()
			// should not call f again
			expect(f).toHaveBeenCalledTimes(1)
		})
	})
	describe('flatten', () => {
		const f = (n: number): string => `value: ${n}`
		it('should chain get', () => {
			const a = newAtom(0)
			// don't destruct inner because reference is overwritten in chain
			let inner: Atom<string> = newAtom('')
			const [{ get: getB }] = pipe(
				a,
				property.map((a) => {
					inner = newAtom(f(a))
					return inner
				}),
				flatten,
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
		it('should ignore outlive last listener disposal', () => {
			const a = newAtom(0)
			const [{ get: getB, subscribe: b }] = pipe(
				a,
				property.map((a) => newAtom(f(a))),
				flatten,
			)
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
		it('should not pass notifications from source', () => {
			const a = newAtom(0)
			const [{ subscribe: b }] = pipe(
				a,
				property.map((a) => newAtom(f(a))),
				flatten,
			)
			const cb = jest.fn()
			const s = b({ next: cb })
			expect(cb).toHaveBeenCalledTimes(0)
			a.set(1)
			expect(cb).toHaveBeenCalledTimes(0)
			s.unsubscribe()
		})
		it('should switch to notifications from inner source', () => {
			const a = newAtom(0)
			const inner = newAtom('')
			const [{ subscribe: b }] = pipe(
				a,
				property.map(() => inner),
				flatten,
			)
			const cb = jest.fn()
			expect(cb).toHaveBeenCalledTimes(0)
			const s = b({ next: cb })
			inner.set('foo')
			expect(cb).toHaveBeenCalledTimes(1)
			s.unsubscribe()
		})
		it('should dispose previous subscription to inner source on passed source emit', () => {
			const a = newAtom(0)
			const inner1Dispose = jest.fn()
			const innerSource1 = attachSubscription(newAtom(''), { unsubscribe: inner1Dispose })
			const inner2 = newAtom('')
			const [{ subscribe: b }] = pipe(
				a,
				property.map((a) => (a === 0 ? innerSource1 : inner2)),
				flatten,
			)
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
		it('outer dispose should unsubscribe from source', () => {
			const disposeA = jest.fn()
			const sourceA: Property<boolean> = {
				get: constTrue,
				subscribe: () => ({
					unsubscribe: disposeA,
				}),
			}
			const inner = newAtom('')
			const [, subscriptionB] = pipe(
				sourceA,
				property.map(() => inner),
				flatten,
			)
			subscriptionB.unsubscribe()
			expect(disposeA).toHaveBeenCalledTimes(1)
		})
		it('should multicast', () => {
			const a = newAtom(0)
			const inner = newAtom('')
			const [{ subscribe: b }] = pipe(
				a,
				property.map(() => inner),
				flatten,
			)
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
	describe('of', () => {
		it('should store initial value and never notify', () => {
			const { get, subscribe } = instance.of(0)
			const f = jest.fn()
			const s = subscribe({ next: f })
			expect(get()).toBe(0)
			expect(f).toHaveBeenCalledTimes(0)
			expect(subscribe).toBe(never.subscribe)
			s.unsubscribe()
		})
	})
	describe('tap', () => {
		it('should tap', () => {
			const a = newAtom(0)
			const cb = jest.fn()
			const { subscribe: b } = pipe(a, property.tap(cb))
			const s = b({ next: constVoid })
			expect(cb).toHaveBeenCalledTimes(0)
			a.set(1)
			expect(cb).toHaveBeenCalledWith(1)
			s.unsubscribe()
		})
	})
	describe('diamond flow', () => {
		it('should notify combined once on each source emit', () => {
			const a = newAtom(0)
			const b = pipe(
				a,
				property.map((n) => n + 1),
			)
			const c = pipe(
				a,
				property.map((n) => n / 1),
			)
			const { subscribe: d } = property.sequenceT(b, c)
			const cb = jest.fn()
			const sub = d({ next: cb })

			expect(cb).toHaveBeenCalledTimes(0)

			a.set(1)
			expect(cb).toHaveBeenCalledTimes(1)

			a.set(2)
			expect(cb).toHaveBeenCalledTimes(2)

			sub.unsubscribe()
		})
		it('should notify combined on each different source emit in different ticks', () => {
			const clock = newVirtualClock(0)
			const newProducer = getNewProducer({
				clock,
			})
			const a = newProducer(0)
			const b = newProducer(0)
			const { subscribe: c } = property.sequenceT(a, b)
			const cb = jest.fn()
			const sub = c({ next: cb })

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
		it('should propagate changes', () => {
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
		it('should support complete', () => {
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
		it('should scan', () => {
			const s = new Subject<number>()
			const dispose = jest.fn()
			const obs = newObservable<number>((observer) => {
				const sub = s.subscribe(observer)
				return () => {
					sub.unsubscribe()
					dispose()
				}
			})
			const [{ get: getA, subscribe: a }, subscriptionA] = pipe(
				obs,
				scan((acc, n) => acc + n, 1),
			)
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
})
