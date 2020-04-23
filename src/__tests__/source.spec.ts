import {
	Disposable,
	flatten,
	fromObservable as getFromObservable,
	instance,
	never,
	sample,
	sampleIO,
	scan as getScan,
	sequence,
	Source,
} from '../source'
import { pipe } from 'fp-ts/lib/pipeable'
import { constFalse, constTrue, constVoid } from 'fp-ts/lib/function'
import { Observable, Subject } from 'rxjs'
import { Observable1, Observer } from '../observable'
import { map } from 'rxjs/operators'
import { newProducer as getNewProducer, Producer } from '../producer'
import { source } from '..'
import { Clock, Env, newCounterClock } from '../clock'

const TEST_OBSERVABLE_URI = 'frp-ts//TestObservable'
type TEST_OBSERVABLE_URI = typeof TEST_OBSERVABLE_URI
declare module 'fp-ts/lib/HKT' {
	interface URItoKind<A> {
		readonly [TEST_OBSERVABLE_URI]: Observable<A>
	}
}

interface VirtualClock extends Clock {
	readonly next: () => void
}
const newVirtualClock = (initialTime: number): VirtualClock => {
	let time = initialTime
	return {
		now: () => time,
		next: () => ++time,
	}
}

const defaultEnv: Env = {
	clock: newCounterClock(),
}
const newProducer = getNewProducer(defaultEnv)

const testObservable: Observable1<TEST_OBSERVABLE_URI> = {
	URI: TEST_OBSERVABLE_URI,
	map: (fa, f) => fa.pipe(map(f)),
	subscribe: (ma, observer) => ma.subscribe(observer),
}
const scan = getScan(testObservable)(defaultEnv)
const fromObservable = getFromObservable(testObservable)(defaultEnv)

const attachDisposable = <A>(source: Source<A>, disposable: Disposable): Source<A> => ({
	getter: source.getter,
	notifier: (l) => {
		const d = source.notifier(l)
		return () => {
			d()
			disposable()
		}
	},
})

describe('frp', () => {
	describe('instance', () => {
		it('subscribe', () => {
			const { next, source: a } = newProducer(0)
			const dispose = jest.fn()
			const s = attachDisposable(a, dispose)
			const observer: Observer<number> = {
				next: jest.fn(),
				complete: jest.fn(),
			}
			const d = instance.subscribe(s, observer)
			expect(observer.next).toHaveBeenCalledTimes(0)
			expect(observer.complete).toHaveBeenCalledTimes(0)
			next(1)
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
		const { next: nextSource, source: source_ } = newProducer(0)
		const disposeSource = jest.fn()
		const source = attachDisposable(source_, disposeSource)
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

		nextSource(23)
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
	it('sample Source', () => {
		const sampleSource = sample(instance)
		const { source: sampler_ } = newProducer(0)
		const disposeSampler = jest.fn()
		const sampler = attachDisposable(sampler_, disposeSampler)
		const { next: nextSource, source } = newProducer(1)
		const { getter: getSampled, notifier: sampled } = sampleSource(sampler)(source)
		expect(getSampled()).toBe(1)
		const cb = jest.fn()
		const d = sampled(cb)
		expect(cb).toHaveBeenCalledTimes(0)
		nextSource(2)
		// notifications are not propagated from source
		expect(cb).toHaveBeenCalledTimes(0)
		// but value should be updated
		expect(getSampled()).toBe(1)

		d()
	})
	it('sampleIO Source', () => {
		const sampleSource = sampleIO(instance)

		const { next: nextSampler, source: sampler_ } = newProducer(0)
		const disposeSampler = jest.fn()
		const sampler = attachDisposable(sampler_, disposeSampler)
		const { next: nextSource, source } = newProducer(1)
		const { getter: getSampled, notifier: sampled } = sampleSource(sampler)(source)
		expect(getSampled()()).toBe(1)
		const cb = jest.fn()
		const d = sampled(cb)
		expect(cb).toHaveBeenCalledTimes(0)
		nextSource(2)
		// notifications are not propagated from source
		expect(cb).toHaveBeenCalledTimes(0)
		// but value should be updated
		expect(getSampled()()).toBe(2)

		// notifications are propagated from sampler
		nextSampler(1)
		expect(cb).toHaveBeenCalledTimes(1)
		expect(getSampled()()).toBe(2)

		d()
	})
	it('sequence', () => {
		const { next: nextA, source: a_ } = newProducer(0)
		const { next: nextB, source: b_ } = newProducer(1)
		const disposeA = jest.fn()
		const disposeB = jest.fn()
		const a = attachDisposable(a_, disposeA)
		const b = attachDisposable(b_, disposeB)
		const { getter: getC, notifier: c } = sequence([a, b])
		expect(getC()).toEqual([0, 1])
		const listenerC = jest.fn()
		const disposableC = c(listenerC)

		expect(listenerC).toHaveBeenCalledTimes(0)

		nextA(1)
		expect(getC()).toEqual([1, 1])
		expect(listenerC).toHaveBeenCalledTimes(1)

		nextB(2)
		expect(getC()).toEqual([1, 2])
		expect(listenerC).toHaveBeenCalledTimes(2)

		expect(disposeA).toHaveBeenCalledTimes(0)
		expect(disposeB).toHaveBeenCalledTimes(0)
		disposableC()
		expect(disposeA).toHaveBeenCalledTimes(1)
		expect(disposeB).toHaveBeenCalledTimes(1)
	})
	describe('producer', () => {
		it('should store initial value', () => {
			const p = newProducer(0)
			expect(p.source.getter()).toBe(0)
		})
		it('should update value', () => {
			const p = newProducer(0)
			expect(p.source.getter()).toBe(0)
			p.next(1)
			expect(p.source.getter()).toBe(1)
		})
		it('should notify about changes', () => {
			const {
				next,
				source: { notifier },
			} = newProducer(0)
			const f = jest.fn()
			const s = notifier(f)
			expect(f).toHaveBeenCalledTimes(0)
			next(1)
			expect(f).toHaveBeenCalledTimes(1)
			s()
		})
		it('should skip duplicates', () => {
			const {
				next,
				source: { notifier },
			} = newProducer(0)
			const f = jest.fn()
			const s = notifier(f)
			expect(f).toHaveBeenCalledTimes(0)
			next(0)
			expect(f).toHaveBeenCalledTimes(0)
			s()
		})
	})
	describe('map', () => {
		it('should map', () => {
			const f = (n: number) => `value: ${n}`
			const { next, source: sourceA } = newProducer(0)
			const { getter: getB, notifier: b } = pipe(sourceA, source.map(f))
			const cba = jest.fn()
			const cbb = jest.fn()
			const { getter: getA, notifier: a } = sourceA
			const sa = a(cba)
			const sb = b(cbb)
			expect(getA()).toBe(0)
			expect(getB()).toBe(f(0))
			expect(cba).toHaveBeenCalledTimes(0)
			expect(cbb).toHaveBeenCalledTimes(0)
			next(10)
			expect(getA()).toBe(10)
			expect(getB()).toBe(f(10))
			expect(cba).toHaveBeenCalledTimes(1)
			expect(cbb).toHaveBeenCalledTimes(1)
			sa()
			sb()
		})
		it('should memo', () => {
			const f = jest.fn((n: number) => `value: ${n}`)
			const { source: a } = newProducer(0)
			const { getter: getB, notifier: b } = pipe(a, source.map(f))
			const s = b(constVoid)
			expect(f).toHaveBeenCalledTimes(0)
			getB()
			expect(f).toHaveBeenCalledTimes(1)
			getB()
			expect(f).toHaveBeenCalledTimes(1) // value didn't change, should not increase call amount
			s()
		})
		it('should skip never', () => {
			const a: Source<boolean> = { getter: constTrue, notifier: never }
			const b = pipe(a, source.map(constFalse))
			expect(b.notifier).toBe(never)
		})
	})
	describe('ap', () => {
		it('should ap', () => {
			const f = (n: number) => n + 1
			const g = (n: number) => n / 2
			const { next: nextAB, source: fab } = newProducer(f)
			const { next: nextA, source: fa } = newProducer(0)
			const { getter: getR } = pipe(fab, source.ap(fa))
			expect(getR()).toBe(f(0))
			nextAB(g)
			expect(getR()).toBe(g(0))
			nextA(1)
			expect(getR()).toBe(g(1))
			nextAB(f)
			expect(getR()).toBe(f(1))
		})
		it('should multicast', () => {
			const f = (n: number) => n + 1
			const {
				source: { getter: getFab, notifier: fab },
			} = newProducer(f)
			const {
				source: { getter: getFa, notifier: a },
			} = newProducer(0)
			const spyFab = jest.fn(fab)
			const spyFa = jest.fn(a)
			const fabSource: Source<typeof f> = { getter: getFab, notifier: spyFab }
			const faSource: Source<number> = { getter: getFa, notifier: spyFa }
			const { notifier: r } = pipe(fabSource, source.ap(faSource))
			const s1 = r(constVoid)
			expect(spyFab).toHaveBeenCalledTimes(1)
			expect(spyFa).toHaveBeenCalledTimes(1)
			const s2 = r(constVoid)
			expect(spyFab).toHaveBeenCalledTimes(1)
			expect(spyFa).toHaveBeenCalledTimes(1)
			s1()
			s2()
		})
		it('should memo', () => {
			const f = jest.fn((n: number) => n + 1)
			const fab = instance.of(f)
			const fa = instance.of(0)
			const { getter: getR } = pipe(fab, source.ap(fa))
			getR()
			expect(f).toHaveBeenCalledTimes(1)
			getR()
			// should not call f again
			expect(f).toHaveBeenCalledTimes(1)
		})
	})
	describe('flatten', () => {
		const f = (n: number): string => `value: ${n}`
		it('should chain getter', () => {
			const { next: nextA, source: a } = newProducer(0)
			// don't destruct inner because reference is overwritten in chain
			let inner: Producer<string> = newProducer('')
			const [{ getter: getB }] = pipe(
				a,
				source.map((a) => {
					inner = newProducer(f(a))
					return inner.source
				}),
				flatten,
			)
			const { getter: getA } = a
			expect(getA()).toBe(0)
			expect(getB()).toBe(f(0))
			expect(inner.source.getter()).toBe(f(0))
			nextA(1)
			expect(getA()).toBe(1)
			expect(getB()).toBe(f(1))
			expect(inner.source.getter()).toBe(f(1))
		})
		it('should ignore outlive last listener disposal', () => {
			const { next: nextA, source: a } = newProducer(0)
			const [{ getter: getB, notifier: b }] = pipe(
				a,
				source.map((a) => newProducer(f(a)).source),
				flatten,
			)
			expect(getB()).toBe(f(0))
			const s = b(constVoid)
			nextA(1)
			expect(getB()).toBe(f(1))
			// dispose
			s()
			nextA(2)
			// should still propagate getter to outer
			expect(getB()).toBe(f(2))
		})
		it('should not pass notifications from source', () => {
			const { next: nextA, source: a } = newProducer(0)
			const [{ notifier: b }] = pipe(
				a,
				source.map((a) => newProducer(f(a)).source),
				flatten,
			)
			const cb = jest.fn()
			const s = b(cb)
			expect(cb).toHaveBeenCalledTimes(0)
			nextA(1)
			expect(cb).toHaveBeenCalledTimes(0)
			s()
		})
		it('should switch to notifications from inner source', () => {
			const { source: a } = newProducer(0)
			const { next: nextInner, source: inner } = newProducer('')
			const [{ notifier: b }] = pipe(
				a,
				source.map(() => inner),
				flatten,
			)
			const cb = jest.fn()
			expect(cb).toHaveBeenCalledTimes(0)
			const s = b(cb)
			nextInner('foo')
			expect(cb).toHaveBeenCalledTimes(1)
			s()
		})
		it('should dispose previous subscription to inner source on passed source emit', () => {
			const { next: nextA, source: a } = newProducer(0)
			const {
				next: nextInner1,
				source: { getter: getInner1, notifier: inner1 },
			} = newProducer('')
			const inner1Dispose = jest.fn()
			const innerSource1: Source<string> = {
				getter: getInner1,
				notifier: (listener) => {
					const d = inner1(listener)
					return () => {
						d()
						inner1Dispose()
					}
				},
			}
			const { source: inner2 } = newProducer('')
			const [{ notifier: b }] = pipe(
				a,
				source.map((a) => (a === 0 ? innerSource1 : inner2)),
				flatten,
			)
			const cb = jest.fn()
			const sb = b(cb)
			expect(inner1Dispose).toHaveBeenCalledTimes(0)
			expect(cb).toHaveBeenCalledTimes(0)
			nextInner1('foo')
			expect(inner1Dispose).toHaveBeenCalledTimes(0)
			expect(cb).toHaveBeenCalledTimes(1)
			// switch b to inner2
			nextA(1)
			expect(inner1Dispose).toHaveBeenCalledTimes(1)
			expect(cb).toHaveBeenCalledTimes(1)
			nextInner1('bar')
			expect(inner1Dispose).toHaveBeenCalledTimes(1)
			// b should not be notified about inner1 because it's switched to inner2
			expect(cb).toHaveBeenCalledTimes(1)
			sb()
		})
		it('outer dispose should unsubscribe from source', () => {
			const disposeA = jest.fn()
			const sourceA: Source<boolean> = { getter: constTrue, notifier: () => disposeA }
			const { source: inner } = newProducer('')
			const [, disposeB] = pipe(
				sourceA,
				source.map(() => inner),
				flatten,
			)
			disposeB()
			expect(disposeA).toHaveBeenCalledTimes(1)
		})
		it('should multicast', () => {
			const { source: a } = newProducer(0)
			const { next: nextInner, source: inner } = newProducer('')
			const [{ notifier: b }] = pipe(
				a,
				source.map(() => inner),
				flatten,
			)
			const cb1 = jest.fn()
			const s1 = b(cb1)
			const cb2 = jest.fn()
			const s2 = b(cb2)

			nextInner('foo')
			expect(cb1).toHaveBeenCalledTimes(1)
			expect(cb2).toHaveBeenCalledTimes(1)

			s1()
			s2()
		})
	})
	describe('of', () => {
		it('should store initial value and never notify', () => {
			const { getter, notifier } = instance.of(0)
			const f = jest.fn()
			const s = notifier(f)
			expect(getter()).toBe(0)
			expect(f).toHaveBeenCalledTimes(0)
			expect(notifier).toBe(never)
			s()
		})
	})
	describe('tap', () => {
		it('should tap', () => {
			const { next, source: a } = newProducer(0)
			const cb = jest.fn()
			const { notifier: b } = pipe(a, source.tap(cb))
			const s = b(constVoid)
			expect(cb).toHaveBeenCalledTimes(0)
			next(1)
			expect(cb).toHaveBeenCalledWith(1)
			s()
		})
	})
	describe('diamond flow', () => {
		it('should notify combined once on each source emit', () => {
			const { next, source: a } = newProducer(0)
			const b = pipe(
				a,
				source.map((n) => n + 1),
			)
			const c = pipe(
				a,
				source.map((n) => n / 1),
			)
			const { notifier: d } = source.sequenceT(b, c)
			const cb = jest.fn()
			const sub = d(cb)

			expect(cb).toHaveBeenCalledTimes(0)

			next(1)
			expect(cb).toHaveBeenCalledTimes(1)

			next(2)
			expect(cb).toHaveBeenCalledTimes(2)

			sub()
		})
		it('should notify combined on each different source emit in different ticks', () => {
			const clock = newVirtualClock(0)
			const newProducer = getNewProducer({
				clock,
			})
			const { next: nextA, source: a } = newProducer(0)
			const { next: nextB, source: b } = newProducer(0)
			const { notifier: c } = source.sequenceT(a, b)
			const cb = jest.fn()
			const sub = c(cb)

			expect(cb).toHaveBeenCalledTimes(0)
			// first a notification
			nextA(1)
			// next a notification in the same tick
			nextB(2)
			expect(cb).toHaveBeenCalledTimes(1)
			// next tick
			clock.next()
			// first b notification
			nextB(1)
			expect(cb).toHaveBeenCalledTimes(2)
			// next b notification in the same tick
			nextA(2)
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

			const [{ getter: getA, notifier: a }, disposeA] = fromObservable(0, obs)
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
			const [{ getter: getA, notifier: a }] = fromObservable(0, s)
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
			const [{ getter: getA, notifier: a }, disposeA] = pipe(
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
			const [{ getter: getA, notifier: a }] = pipe(
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
