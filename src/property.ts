import { sequenceS as sequenceSApply, sequenceT as sequenceTApply } from 'fp-ts/lib/Apply'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import { Observable, Subscription, subscriptionNone } from './observable'
import { array } from 'fp-ts/lib/Array'
import { Applicative1 } from 'fp-ts/lib/Applicative'
import { combineNotifier, newEmitter, Notifier } from './emitter'
import { newAtom } from './atom'
import { Env } from './clock'
import { Functor, Functor1, Functor2, Functor2C, Functor3, Functor3C, Functor4 } from 'fp-ts/lib/Functor'
import { HKT, Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from 'fp-ts/lib/HKT'
import { IO } from 'fp-ts/lib/IO'

export const URI = 'frp-ts//Property'
export type URI = typeof URI

export interface Getter<A> {
	(): A
}

export interface Property<A> {
	readonly get: Getter<A>
	readonly notifier: Notifier
}

declare module 'fp-ts/lib/HKT' {
	interface URItoKind<A> {
		readonly [URI]: Property<A>
	}
}

const memo2 = <A, B, C>(f: (a: A, b: B) => C): ((a: A, b: B) => C) => {
	let hasValue = false
	let lastA: A
	let lastB: B
	let lastC: C
	return (a, b) => {
		if (!hasValue || a !== lastA || b !== lastB) {
			hasValue = true
			lastA = a
			lastB = b
			lastC = f(a, b)
		}
		return lastC
	}
}
const memo1 = <A, B>(f: (a: A) => B): ((a: A) => B) => {
	let hasValue = false
	let lastA: A
	let lastB: B
	return (a) => {
		if (!hasValue || a !== lastA) {
			hasValue = true
			lastA = a
			lastB = f(a)
		}
		return lastB
	}
}

const memoApply = memo2(<A, B>(f: (a: A) => B, a: A): B => f(a))

export const instance: Applicative1<URI> = {
	URI,
	map: (fa, f) => {
		const memoF = memo1(f)
		return {
			get: () => memoF(fa.get()),
			notifier: fa.notifier,
		}
	},
	of: (a) => ({ get: () => a, notifier: never }),
	ap: (fab, fa) => ({
		get: () => memoApply(fab.get(), fa.get()),
		notifier: combineNotifier(fab.notifier, fa.notifier),
	}),
}

export const flatten = <A>(source: Property<Property<A>>): [Property<A>, Subscription] => {
	// store initial inner source in a mutable reference
	let inner: Property<A> = source.get()
	let innerDisposable: Subscription = subscriptionNone
	const emitter = newEmitter()

	const resubscribeToInner = () => {
		// dispose previous subscription
		innerDisposable.unsubscribe()
		// create new subscription
		innerDisposable = inner.notifier(emitter.notify)
	}

	const outerDisposable = source.notifier(() => {
		// update reference to new inner source
		inner = source.get()
		resubscribeToInner()
	})

	resubscribeToInner()

	return [
		{
			get: () => {
				// use extra thunk because reference to inner source changes
				return inner.get()
			},
			notifier: emitter.subscribe,
		},
		outerDisposable,
	]
}

export const tap = <A>(f: (a: A) => unknown) => (fa: Property<A>): Property<A> => ({
	get: fa.get,
	notifier: (listener) =>
		fa.notifier((t) => {
			f(fa.get())
			listener(t)
		}),
})

const { map, ap, apFirst, apSecond } = pipeable(instance)
export { map, ap, apFirst, apSecond }

export const sequenceS = sequenceSApply(instance)
export const sequenceT = sequenceTApply(instance)
export const sequence = <A>(sources: Property<A>[]): Property<A[]> => ({
	get: () => array.map(sources, (source) => source.get()),
	notifier: (listener) => {
		const subscriptions = array.map(sources, (source) => source.notifier(listener))
		return {
			unsubscribe: () => {
				for (let i = 0, l = subscriptions.length; i < l; i++) {
					subscriptions[i].unsubscribe()
				}
			},
		}
	},
})

export const never: Notifier = () => subscriptionNone

export function fromObservable(env: Env): <A>(initial: A, ma: Observable<A>) => [Property<A>, Subscription] {
	const s = scan(env)
	return (initial, ma) =>
		pipe(
			ma,
			s((_, a) => a, initial),
		)
}

export function scan<M>(
	env: Env,
): <A, B>(f: (acc: B, a: A) => B, initial: B) => (ma: Observable<A>) => [Property<B>, Subscription] {
	const producer = newAtom(env)
	return (f, initial) => (ma) => {
		const p = producer(initial)
		const s = ma.subscribe({
			next: (a) => p.set(f(p.get(), a)),
		})
		return [p, s]
	}
}

export function sample<F extends URIS4>(
	F: Functor4<F>,
): <S, R, E, A, B>(property: Property<A>, sampler: Kind4<F, S, R, E, B>) => Kind4<F, S, R, E, A>
export function sample<F extends URIS3>(
	F: Functor3<F>,
): <R, E, A, B>(property: Property<A>, sampler: Kind3<F, R, E, B>) => Kind3<F, R, E, A>
export function sample<F extends URIS3, E>(
	F: Functor3C<F, E>,
): <R, A, B>(property: Property<A>, sampler: Kind3<F, R, E, B>) => Kind3<F, R, E, A>
export function sample<F extends URIS2>(
	F: Functor2<F>,
): <E, A, B>(property: Property<A>, sampler: Kind2<F, E, B>) => Kind2<F, E, A>
export function sample<F extends URIS2, E>(
	F: Functor2C<F, E>,
): <A, B>(property: Property<A>, sampler: Kind2<F, E, B>) => Kind2<F, E, A>
export function sample<F extends URIS>(F: Functor1<F>): <A, B>(property: Property<A>, sampler: Kind<F, B>) => Kind<F, A>
export function sample<F>(F: Functor<F>): <A, B>(property: Property<A>, sampler: HKT<F, B>) => HKT<F, A>
export function sample<F>(F: Functor<F>): <A, B>(property: Property<A>, sampler: HKT<F, B>) => HKT<F, A> {
	return (property, sampler) => F.map(sampler, property.get)
}

export function sampleIO<F extends URIS4>(
	F: Functor4<F>,
): <S, R, E, A, B>(property: Property<A>, sampler: Kind4<F, S, R, E, B>) => Kind4<F, S, R, E, IO<A>>
export function sampleIO<F extends URIS3>(
	F: Functor3<F>,
): <R, E, A, B>(property: Property<A>, sampler: Kind3<F, R, E, B>) => Kind3<F, R, E, IO<A>>
export function sampleIO<F extends URIS3, E>(
	F: Functor3C<F, E>,
): <R, A, B>(property: Property<A>, sampler: Kind3<F, R, E, B>) => Kind3<F, R, E, IO<A>>
export function sampleIO<F extends URIS2>(
	F: Functor2<F>,
): <E, A, B>(property: Property<A>, sampler: Kind2<F, E, B>) => Kind2<F, E, IO<A>>
export function sampleIO<F extends URIS2, E>(
	F: Functor2C<F, E>,
): <A, B>(property: Property<A>, sampler: Kind2<F, E, B>) => Kind2<F, E, IO<A>>
export function sampleIO<F extends URIS>(
	F: Functor1<F>,
): <A, B>(property: Property<A>, sampler: Kind<F, B>) => Kind<F, IO<A>>
export function sampleIO<F>(F: Functor<F>): <A, B>(property: Property<A>, sampler: HKT<F, B>) => HKT<F, IO<A>>
export function sampleIO<F>(F: Functor<F>): <A, B>(property: Property<A>, sampler: HKT<F, B>) => HKT<F, IO<A>> {
	return (property, sampler) => F.map(sampler, () => property.get)
}
