// minimal required interface adhering https://github.com/tc39/proposal-observable

import { HKT, Kind, Kind2, Kind3, Kind4, URIS, URIS2, URIS3, URIS4 } from 'fp-ts/lib/HKT'
import { Functor, Functor1, Functor2, Functor3, Functor3C, Functor2C, Functor4 } from 'fp-ts/lib/Functor'

export interface Observer<A> {
	readonly next: (a: A) => void
}

export interface Subscription {
	readonly unsubscribe: () => void
}

export interface Observable<F> extends Functor<F> {
	readonly subscribe: <A>(ma: HKT<F, A>, observer: Observer<A>) => Subscription
}

export interface Observable1<F extends URIS> extends Functor1<F> {
	readonly subscribe: <A>(ma: Kind<F, A>, observer: Observer<A>) => Subscription
}

export interface Observable2<F extends URIS2> extends Functor2<F> {
	readonly subscribe: <E, A>(ma: Kind2<F, E, A>, observer: Observer<A>) => Subscription
}

export interface Observable2C<F extends URIS2, E> extends Functor2C<F, E> {
	readonly subscribe: <A>(ma: Kind2<F, E, A>, observer: Observer<A>) => Subscription
}

export interface Observable3<F extends URIS3> extends Functor3<F> {
	readonly subscribe: <R, E, A>(ma: Kind3<F, R, E, A>, observer: Observer<A>) => Subscription
}

export interface Observable3C<F extends URIS3, E> extends Functor3C<F, E> {
	readonly subscribe: <R, A>(ma: Kind3<F, R, E, A>, observer: Observer<A>) => Subscription
}

export interface Observable4<F extends URIS4> extends Functor4<F> {
	readonly subscribe: <S, R, E, A>(ma: Kind4<F, S, R, E, A>, observer: Observer<A>) => Subscription
}
