// minimal required interface adhering https://github.com/tc39/proposal-observable

import { constVoid } from '@frp-ts/utils'
import { type InteropObservable, type InteropObservableHolder, observableSymbol } from './interop-observable'

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

export function fromInteropObservable<Value>(source: InteropObservableHolder<Value>): Observable<Value>
export function fromInteropObservable<Value>(source: Observable<Value>): Observable<Value>
export function fromInteropObservable<Value>(
	source: InteropObservableHolder<Value> | Observable<Value>,
): Observable<Value> {
	// eslint-disable-next-line no-restricted-syntax,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
	const interop: (() => InteropObservable<Value>) | undefined = (source as any)[observableSymbol]
	// eslint-disable-next-line no-restricted-syntax
	return interop ? interop() : (source as Observable<Value>)
}
