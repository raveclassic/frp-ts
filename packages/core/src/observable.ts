// minimal required interface adhering https://github.com/tc39/proposal-observable

import { constVoid, memoMany } from '@frp-ts/utils'

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

export type ObservableValue<Target> = Target extends Observable<infer Value> ? Value : never
export type MapObservablesToValues<Target extends readonly Observable<unknown>[]> = {
	readonly [Index in keyof Target]: ObservableValue<Target[Index]>
}

export function combine<Observables extends readonly Observable<unknown>[], Result>(
	...args: readonly [...Observables, (...values: MapObservablesToValues<Observables>) => Result]
): Observable<Result> {
	const project: (...values: readonly unknown[]) => Result = args[args.length - 1] as never
	const observables: readonly Observable<unknown>[] = args.slice(0, args.length - 1) as never
	const memoProject = memoMany(project)
	const observablesLength = observables.length
	let valueDelay = observablesLength
	const values: unknown[] = Array(observablesLength)
	for (let i = 0; i < observablesLength; i++) {
		const observable = observables[i]
	}
	return {
		subscribe: (observer) => {
			const subscriptions: Subscription[] = Array(observablesLength)
			for (let i = 0; i < observablesLength; i++) {
				let hasValue = false
				subscriptions[i] = observables[i].subscribe({
					next: (value) => {
						if (!hasValue) {
							hasValue = true
							valueDelay--
						}
						values[i] = value
						if (valueDelay === 0) {
							observer.next(memoProject(...values))
						}
					},
				})
			}
			return {
				unsubscribe: () => {
					for (let i = 0; i < observablesLength; i++) {
						subscriptions[i].unsubscribe()
					}
					subscriptions.length = 0
				},
			}
		},
	}
}

export function multicast<Value>(source: Observable<Value>): Observable<Value> {
	let counter = 0
	let outer: Subscription | undefined
	const handlers = new Set<(value: Value) => void>()
	const observer: Observer<Value> = {
		next: (value) => {
			for (const handler of handlers) {
				handler(value)
			}
		},
	}
	return {
		subscribe: (observer) => {
			counter++
			handlers.add(observer.next)
			if (counter === 1) {
				outer = source.subscribe(observer)
			}
			return {
				unsubscribe: () => {
					counter--
					handlers.delete(observer.next)
					if (counter === 0 && outer) {
						outer.unsubscribe()
						outer = undefined
					}
				},
			}
		},
	}
}

export const map =
	<A, B>(f: (a: A) => B) =>
	(source: Observable<A>): Observable<B> =>
		combine(source, f)

export const chain =
	<A, B>(f: (a: A) => Observable<B>) =>
	(source: Observable<A>): Observable<B> => ({
		subscribe: (observer) => {
			let inner: Subscription
			const outer = source.subscribe({
				next: (a) => {
					inner?.unsubscribe()
					inner = f(a).subscribe(observer)
				},
			})
			return {
				unsubscribe: () => {
					outer.unsubscribe()
					inner?.unsubscribe()
				},
			}
		},
	})

export const of = <A>(a: A): Observable<A> => ({
	subscribe: (observer) => {
		observer.next(a)
		return subscriptionNone
	},
})

export function filter<A, B extends A>(refinement: (a: A) => a is B): (source: Observable<A>) => Observable<B>
export function filter<A>(predicate: (a: A) => boolean): (source: Observable<A>) => Observable<A>
export function filter<A>(predicate: (a: A) => boolean): (source: Observable<A>) => Observable<A> {
	return (source) => ({
		subscribe: (observer) => {
			return source.subscribe({
				next: (a) => {
					if (predicate(a)) {
						observer.next(a)
					}
				},
			})
		},
	})
}

export const debounceTime =
	(ms: number) =>
	<A>(source: Observable<A>): Observable<A> => ({
		subscribe: (observer) => {
			let timeout: number
			const subscription = source.subscribe({
				next: (a) => {
					clearTimeout(timeout)
					timeout = setTimeout(() => observer.next(a), ms)
				},
			})
			return {
				unsubscribe: () => {
					clearTimeout(timeout)
					subscription.unsubscribe()
				},
			}
		},
	})

export interface ThrottleTimeOptions {
	readonly emitLeading?: boolean
	readonly emitTrailing?: boolean
}
export const throttleTime =
	(ms: number, options: ThrottleTimeOptions) =>
	<A>(source: Observable<A>): Observable<A> => ({
		subscribe: (observer) => {
			return {
				unsubscribe: () => {},
			}
		},
	})
