import { Applicative1 } from 'fp-ts/lib/Applicative'
import { memo1, memo2 } from '@frp-ts/utils'
import { pipeable } from 'fp-ts/lib/pipeable'
import { sequenceS as sequenceSApply, sequenceT as sequenceTApply } from 'fp-ts/lib/Apply'
import { Functor2C, Functor2, Functor3, Functor3C, Functor4, Functor1, Functor } from 'fp-ts/lib/Functor'
import { HKT, Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from 'fp-ts/lib/HKT'
import { Property, observable, emitter } from '@frp-ts/core'
import { IO } from 'fp-ts/lib/IO'

const URI = '@frp-ts/fp-ts/Property'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
	interface URItoKind<A> {
		readonly [URI]: Property<A>
	}
}

const memoApply = memo2(<A, B>(f: (a: A) => B, a: A): B => f(a))

export const instance: Applicative1<URI> = {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	URI: URI,
	map: (fa, f) => {
		const memoF = memo1(f)
		return {
			get: () => memoF(fa.get()),
			subscribe: fa.subscribe,
		}
	},
	of: (a) => ({ get: () => a, subscribe: observable.never.subscribe }),
	ap: (fab, fa) => ({
		get: () => memoApply(fab.get(), fa.get()),
		subscribe: emitter.mergeMany([fab, fa]).subscribe,
	}),
}

const { map, ap, apFirst, apSecond } = pipeable(instance)
export { map, ap, apFirst, apSecond }

export const sequenceS = sequenceSApply(instance)
export const sequenceT = sequenceTApply(instance)

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
