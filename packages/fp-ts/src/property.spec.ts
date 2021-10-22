import { Observable, map } from 'rxjs'

import { Observer, observable, Property, atom, clock, Env } from '@frp-ts/core'
import { constVoid } from '@frp-ts/utils'
import { ap, instance, sample, sampleIO } from './property'
import { emitterUtils } from '@frp-ts/test-utils'

import { Functor1 } from 'fp-ts/lib/Functor'

const TEST_OBSERVABLE_URI = 'frp-ts/fp-ts/TestObservable'
type TEST_OBSERVABLE_URI = typeof TEST_OBSERVABLE_URI
declare module 'fp-ts/lib/HKT' {
	interface URItoKind<A> {
		readonly [TEST_OBSERVABLE_URI]: Observable<A>
	}
}

export const testObservable: Functor1<TEST_OBSERVABLE_URI> = {
	URI: TEST_OBSERVABLE_URI,
	map: (fa, f) => fa.pipe(map(f)),
}

const defaultEnv: Env = {
	clock: clock.newCounterClock(),
}

export const newAtom = atom.newAtom(defaultEnv)

describe('sample', () => {
	it('sample testObservable', () => {
		let observer: Observer<number>
		const disposeSampler = jest.fn()
		const sampler = new Observable<number>((obs) => {
			observer = obs
			return disposeSampler
		})
		const nextObserver = (n: number) => observer.next(n)
		const unsubscribe = jest.fn(constVoid)
		const source = emitterUtils.attachSubscription(newAtom(0), { unsubscribe })
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
})

describe('ap', () => {
	it('aps', () => {
		const f = (n: number) => n + 1
		const g = (n: number) => n / 2
		const fab = newAtom(f)
		const fa = newAtom(0)
		const b = ap(fa)(fab)
		expect(b.get()).toBe(f(0))
		fab.set(g)
		expect(b.get()).toBe(g(0))
		fa.set(1)
		expect(b.get()).toBe(g(1))
		fab.set(f)
		expect(b.get()).toBe(f(1))
	})
	it('multicasts', () => {
		const f = (n: number) => n + 1
		const fab = newAtom(f)
		const fa = newAtom(0)
		const spyFab = jest.fn(fab.subscribe)
		const spyFa = jest.fn(fa.subscribe)
		const fabSource: Property<typeof f> = { get: fab.get, subscribe: spyFab }
		const faSource: Property<number> = { get: fa.get, subscribe: spyFa }
		const b = ap(faSource)(fabSource)
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
	it('memoizes', () => {
		const f = jest.fn((n: number) => n + 1)
		const fab = instance.of(f)
		const fa = instance.of(0)
		const { get: getR } = ap(fa)(fab)
		getR()
		expect(f).toHaveBeenCalledTimes(1)
		getR()
		// should not call f again
		expect(f).toHaveBeenCalledTimes(1)
	})
})

describe('sample', () => {
	it('samples testObservable', () => {
		let observer: Observer<number>
		const disposeSampler = jest.fn()
		const sampler = new Observable<number>((obs) => {
			observer = obs
			return disposeSampler
		})
		const nextObserver = (n: number) => observer.next(n)
		const unsubscribe = jest.fn()
		const source = emitterUtils.attachSubscription(newAtom(0), { unsubscribe })
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
})

describe('of', () => {
	it('stores initial value and never notifies', () => {
		const { get, subscribe } = instance.of(0)
		const f = jest.fn()
		const s = subscribe({ next: f })
		expect(get()).toBe(0)
		expect(f).toHaveBeenCalledTimes(0)
		expect(subscribe).toBe(observable.never.subscribe)
		s.unsubscribe()
	})
})
