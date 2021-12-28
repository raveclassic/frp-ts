// minimal required interface adhering https://github.com/tc39/proposal-observable

import { constVoid } from '@frp-ts/utils'

export interface Observer<A> {
	readonly next: (a: A) => void
}

export interface Subscription {
	readonly unsubscribe: () => void
}

export interface Observable<A> {
	readonly subscribe: (observer: Observer<A>) => Subscription
}

export const newObservable = <A>(f: (observer: Observer<A>) => () => void): Observable<A> => ({
	subscribe: (observer) => ({
		unsubscribe: f(observer),
	}),
})

export const subscriptionNone: Subscription = {
	unsubscribe: constVoid,
}

export const never: Observable<never> = {
	subscribe: () => subscriptionNone,
}
