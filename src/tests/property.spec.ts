import { flatten, instance, never, sample, sampleIO, sequence, Property } from '../property'
import { pipe } from 'fp-ts/lib/pipeable'
import { constFalse, constTrue, constVoid } from 'fp-ts/lib/function'
import { Observable, Subject } from 'rxjs'
import { Observer } from '../observable'
import { newAtom as getNewProducer, Atom } from '../atom'
import { property } from '..'
import { attachDisposable, fromObservable, newProducer, newVirtualClock, scan, testObservable } from './env'

describe('source', () => {
	describe('instance', () => {
		it('subscribe', () => {
			const dispose = jest.fn()
			const p = attachDisposable(newProducer(0), dispose)
			const observer: Observer<number> = {
				next: jest.fn(),
				complete: jest.fn(),
			}
			const d = instance.subscribe(p, observer)
			expect(observer.next).toHaveBeenCalledTimes(0)
			expect(observer.complete).toHaveBeenCalledTimes(0)
			p.set(1)
			expect(observer.next).toHaveBeenCalledWith(1)
			expect(observer.complete).toHaveBeenCalledTimes(0)
			d.unsubscribe()
			expect(observer.complete).toHaveBeenCalledTimes(0)
			expect(dispose).toHaveBeenCalledTimes(1)
		})
	})
	it('sample testObservable', () => {
		let observer: Observer<number>
		const disposeSampler = jest.fn()
		const sampler = new Observable<number>((obs) => {
			observer = obs
			return disposeSampler
		})
		const nextObserver = (n: number) => observer.next(n)
		const disposeSource = jest.fn()
		const source = attachDisposable(newProducer(0), disposeSource)
		const sampleObservable = sample(testObservable)
		const sampled = sampleObservable(sampler)(source)
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
		expect(disposeSource).toHaveBeenCalledTimes(0)
	})
	it('sample Property', () => {
		const sampleSource = sample(instance)
		// const { source: sampler_ } = newAtom(0)
		const disposeSampler = jest.fn()
		const sampler = attachDisposable(newProducer(0), disposeSampler)
		const source = newProducer(1)
		const { get: getSampled, notifier: sampled } = sampleSource(sampler)(source)
		expect(getSampled()).toBe(1)
		const cb = jest.fn()
		const d = sampled(cb)
		expect(cb).toHaveBeenCalledTimes(0)
		source.set(2)
		// notifications are not propagated from source
		expect(cb).toHaveBeenCalledTimes(0)
		// but value should be updated
		expect(getSampled()).toBe(1)

		d()
	})
	it('sampleIO Property', () => {
		const sampleSource = sampleIO(instance)

		const disposeSampler = jest.fn()
		const sampler = attachDisposable(newProducer(0), disposeSampler)
		const source = newProducer(1)
		const sampled = sampleSource(sampler)(source)
		expect(sampled.get()()).toBe(1)
		const cb = jest.fn()
		const d = sampled.notifier(cb)
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

		d()
	})
	it('sequence', () => {
		const disposeA = jest.fn()
		const disposeB = jest.fn()
		const a = attachDisposable(newProducer(0), disposeA)
		const b = attachDisposable(newProducer(1), disposeB)
		const { get: getC, notifier: c } = sequence([a, b])
		expect(getC()).toEqual([0, 1])
		const listenerC = jest.fn()
		const disposableC = c(listenerC)

		expect(listenerC).toHaveBeenCalledTimes(0)

		a.set(1)
		expect(getC()).toEqual([1, 1])
		expect(listenerC).toHaveBeenCalledTimes(1)

		b.set(2)
		expect(getC()).toEqual([1, 2])
		expect(listenerC).toHaveBeenCalledTimes(2)

		expect(disposeA).toHaveBeenCalledTimes(0)
		expect(disposeB).toHaveBeenCalledTimes(0)
		disposableC()
		expect(disposeA).toHaveBeenCalledTimes(1)
		expect(disposeB).toHaveBeenCalledTimes(1)
	})
	describe('map', () => {
		it('should map', () => {
			const f = (n: number) => `value: ${n}`
			const a = newProducer(0)
			const b = pipe(a, property.map(f))
			const cba = jest.fn()
			const cbb = jest.fn()
			const sa = a.notifier(cba)
			const sb = b.notifier(cbb)
			expect(a.get()).toBe(0)
			expect(b.get()).toBe(f(0))
			expect(cba).toHaveBeenCalledTimes(0)
			expect(cbb).toHaveBeenCalledTimes(0)
			a.set(10)
			expect(a.get()).toBe(10)
			expect(b.get()).toBe(f(10))
			expect(cba).toHaveBeenCalledTimes(1)
			expect(cbb).toHaveBeenCalledTimes(1)
			sa()
			sb()
		})
		it('should memo', () => {
			const f = jest.fn((n: number) => `value: ${n}`)
			const a = newProducer(0)
			const { get: getB, notifier: b } = pipe(a, property.map(f))
			const s = b(constVoid)
			expect(f).toHaveBeenCalledTimes(0)
			getB()
			expect(f).toHaveBeenCalledTimes(1)
			getB()
			expect(f).toHaveBeenCalledTimes(1) // value didn't change, should not increase call amount
			s()
		})
		it('should skip never', () => {
			const a: Property<boolean> = { get: constTrue, notifier: never }
			const b = pipe(a, property.map(constFalse))
			expect(b.notifier).toBe(never)
		})
	})
	describe('ap', () => {
		it('should ap', () => {
			const f = (n: number) => n + 1
			const g = (n: number) => n / 2
			const fab = newProducer(f)
			const fa = newProducer(0)
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
			const fab = newProducer(f)
			const fa = newProducer(0)
			const spyFab = jest.fn(fab.notifier)
			const spyFa = jest.fn(fa.notifier)
			const fabSource: Property<typeof f> = { get: fab.get, notifier: spyFab }
			const faSource: Property<number> = { get: fa.get, notifier: spyFa }
			const b = pipe(fabSource, property.ap(faSource))
			const s1 = b.notifier(constVoid)
			expect(spyFab).toHaveBeenCalledTimes(1)
			expect(spyFa).toHaveBeenCalledTimes(1)
			const s2 = b.notifier(constVoid)
			expect(spyFab).toHaveBeenCalledTimes(1)
			expect(spyFa).toHaveBeenCalledTimes(1)
			s1()
			s2()
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
			const a = newProducer(0)
			// don't destruct inner because reference is overwritten in chain
			let inner: Atom<string> = newProducer('')
			const [{ get: getB }] = pipe(
				a,
				property.map((a) => {
					inner = newProducer(f(a))
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
			const a = newProducer(0)
			const [{ get: getB, notifier: b }] = pipe(
				a,
				property.map((a) => newProducer(f(a))),
				flatten,
			)
			expect(getB()).toBe(f(0))
			const s = b(constVoid)
			a.set(1)
			expect(getB()).toBe(f(1))
			// dispose
			s()
			a.set(2)
			// should still propagate get to outer
			expect(getB()).toBe(f(2))
		})
		it('should not pass notifications from source', () => {
			const a = newProducer(0)
			const [{ notifier: b }] = pipe(
				a,
				property.map((a) => newProducer(f(a))),
				flatten,
			)
			const cb = jest.fn()
			const s = b(cb)
			expect(cb).toHaveBeenCalledTimes(0)
			a.set(1)
			expect(cb).toHaveBeenCalledTimes(0)
			s()
		})
		it('should switch to notifications from inner source', () => {
			const a = newProducer(0)
			const inner = newProducer('')
			const [{ notifier: b }] = pipe(
				a,
				property.map(() => inner),
				flatten,
			)
			const cb = jest.fn()
			expect(cb).toHaveBeenCalledTimes(0)
			const s = b(cb)
			inner.set('foo')
			expect(cb).toHaveBeenCalledTimes(1)
			s()
		})
		it('should dispose previous subscription to inner source on passed source emit', () => {
			const a = newProducer(0)
			const inner1Dispose = jest.fn()
			const innerSource1 = attachDisposable(newProducer(''), inner1Dispose)
			const inner2 = newProducer('')
			const [{ notifier: b }] = pipe(
				a,
				property.map((a) => (a === 0 ? innerSource1 : inner2)),
				flatten,
			)
			const cb = jest.fn()
			const sb = b(cb)
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
			sb()
		})
		it('outer dispose should unsubscribe from source', () => {
			const disposeA = jest.fn()
			const sourceA: Property<boolean> = { get: constTrue, notifier: () => disposeA }
			const inner = newProducer('')
			const [, disposeB] = pipe(
				sourceA,
				property.map(() => inner),
				flatten,
			)
			disposeB()
			expect(disposeA).toHaveBeenCalledTimes(1)
		})
		it('should multicast', () => {
			const a = newProducer(0)
			const inner = newProducer('')
			const [{ notifier: b }] = pipe(
				a,
				property.map(() => inner),
				flatten,
			)
			const cb1 = jest.fn()
			const s1 = b(cb1)
			const cb2 = jest.fn()
			const s2 = b(cb2)

			inner.set('foo')
			expect(cb1).toHaveBeenCalledTimes(1)
			expect(cb2).toHaveBeenCalledTimes(1)

			s1()
			s2()
		})
	})
	describe('of', () => {
		it('should store initial value and never notify', () => {
			const { get, notifier } = instance.of(0)
			const f = jest.fn()
			const s = notifier(f)
			expect(get()).toBe(0)
			expect(f).toHaveBeenCalledTimes(0)
			expect(notifier).toBe(never)
			s()
		})
	})
	describe('tap', () => {
		it('should tap', () => {
			const a = newProducer(0)
			const cb = jest.fn()
			const { notifier: b } = pipe(a, property.tap(cb))
			const s = b(constVoid)
			expect(cb).toHaveBeenCalledTimes(0)
			a.set(1)
			expect(cb).toHaveBeenCalledWith(1)
			s()
		})
	})
	describe('diamond flow', () => {
		it('should notify combined once on each source emit', () => {
			const a = newProducer(0)
			const b = pipe(
				a,
				property.map((n) => n + 1),
			)
			const c = pipe(
				a,
				property.map((n) => n / 1),
			)
			const { notifier: d } = property.sequenceT(b, c)
			const cb = jest.fn()
			const sub = d(cb)

			expect(cb).toHaveBeenCalledTimes(0)

			a.set(1)
			expect(cb).toHaveBeenCalledTimes(1)

			a.set(2)
			expect(cb).toHaveBeenCalledTimes(2)

			sub()
		})
		it('should notify combined on each different source emit in different ticks', () => {
			const clock = newVirtualClock(0)
			const newProducer = getNewProducer({
				clock,
			})
			const a = newProducer(0)
			const b = newProducer(0)
			const { notifier: c } = property.sequenceT(a, b)
			const cb = jest.fn()
			const sub = c(cb)

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

			sub()
		})
	})
	describe('fromObservable', () => {
		it('should propagate changes', () => {
			const s = new Subject<number>()
			const dispose = jest.fn()
			const obs = new Observable((observer) => {
				const sub = s.subscribe(observer)
				return {
					unsubscribe(): void {
						sub.unsubscribe()
						dispose()
					},
				}
			})

			const [{ get: getA, notifier: a }, disposeA] = fromObservable(0, obs)
			expect(getA()).toBe(0)
			const cb = jest.fn()
			const sub = a(cb)
			// check value
			s.next(1)
			expect(getA()).toBe(1)
			expect(cb).toHaveBeenCalledTimes(1)
			// check duplicates
			s.next(1)
			expect(cb).toHaveBeenCalledTimes(1)
			// check listener disposal
			sub()
			// should keep subscription
			expect(dispose).toHaveBeenCalledTimes(0)
			s.next(2)
			// should not notify listener
			expect(cb).toHaveBeenCalledTimes(1)
			// but should update value
			expect(getA()).toBe(2)
			// check full dispose
			disposeA()
			// should unsubscribe from source
			expect(dispose).toHaveBeenCalledTimes(1)
			// should not ignore any updates
			s.next(3)
			expect(cb).toHaveBeenCalledTimes(1)
			expect(getA()).toBe(2)
		})
		it('should support complete', () => {
			const s = new Subject<number>()
			const [{ get: getA, notifier: a }] = fromObservable(0, s)
			const cb = jest.fn()
			const sub = a(cb)
			s.next(1)
			expect(getA()).toBe(1)
			expect(cb).toHaveBeenCalledTimes(1)
			s.complete()
			// should ignore any updates
			s.next(2)
			expect(getA()).toBe(1)
			expect(cb).toHaveBeenCalledTimes(1)
			sub()
		})
	})
	describe('scan', () => {
		it('should scan', () => {
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
			const [{ get: getA, notifier: a }, disposeA] = pipe(
				obs,
				scan((acc, n) => acc + n, 1),
			)
			expect(getA()).toBe(1)
			const cb = jest.fn()
			const sub = a(cb)
			// check value
			s.next(1)
			expect(getA()).toBe(2)
			expect(cb).toHaveBeenCalledTimes(1)
			// check duplicates
			s.next(0)
			expect(getA()).toBe(2)
			expect(cb).toHaveBeenCalledTimes(1)
			// check listener disposal
			sub()
			// should keep subscription
			expect(dispose).toHaveBeenCalledTimes(0)
			s.next(1)
			// should not notify listener
			expect(cb).toHaveBeenCalledTimes(1)
			// but should update value
			expect(getA()).toBe(3)
			// check full dispose
			disposeA()
			// should unsubscribe from source
			expect(dispose).toHaveBeenCalledTimes(1)
			// should not ignore any updates
			s.next(1)
			expect(cb).toHaveBeenCalledTimes(1)
			expect(getA()).toBe(3)
		})
		it('should support complete', () => {
			const s = new Subject<number>()
			const [{ get: getA, notifier: a }] = pipe(
				s,
				scan((acc, n) => acc + n, 1),
			)
			const cb = jest.fn()
			const sub = a(cb)
			s.next(1)
			expect(getA()).toBe(2)
			expect(cb).toHaveBeenCalledTimes(1)
			s.complete()
			// should ignore any updates
			s.next(1)
			expect(getA()).toBe(2)
			expect(cb).toHaveBeenCalledTimes(1)
			sub()
		})
	})
})
