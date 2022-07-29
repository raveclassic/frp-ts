import { never, Observable, Observer, Subscription, subscriptionNone } from './observable'
import { mergeMany, multicast, newEmitter } from './emitter'
import { newAtom } from './atom'
import { Time } from './clock'
import { memo0, memo1, memo2, memo3, memo4, memo5, memoMany } from '@frp-ts/utils'
import { InteropObservableHolder, newInteropObservable, observableSymbol } from './interop-observable'

export interface Property<A> extends Observable<Time>, InteropObservableHolder<A> {
	readonly get: () => A
}

export const newProperty = <A>(get: () => A, subscribe: (observer: Observer<Time>) => Subscription): Property<A> => ({
	get,
	subscribe,
	[observableSymbol]: () => newInteropObservable(get, subscribe),
})

export const flatten = <A>(source: Property<Property<A>>): [Property<A>, Subscription] => {
	// store initial inner source in a mutable reference
	let inner: Property<A> = source.get()
	let innerDisposable: Subscription = subscriptionNone
	const emitter = newEmitter()

	const resubscribeToInner = () => {
		// dispose previous subscription
		innerDisposable.unsubscribe()
		// create new subscription
		innerDisposable = inner.subscribe(emitter)
	}

	const outerDisposable = source.subscribe({
		next: () => {
			// update reference to new inner source
			inner = source.get()
			resubscribeToInner()
		},
	})

	resubscribeToInner()

	const get = () => {
		// use extra thunk because reference to inner source changes
		return inner.get()
	}

	return [newProperty(get, emitter.subscribe), outerDisposable]
}

export const tap =
	<A>(f: (a: A) => unknown) =>
	(fa: Property<A>): Property<A> => ({
		...fa,
		subscribe: (observer) =>
			fa.subscribe({
				next: (t) => {
					f(fa.get())
					observer.next(t)
				},
			}),
	})

export const fromObservable = <A>(initial: A, ma: Observable<A>): [Property<A>, Subscription] =>
	scan<A, A>((_, a) => a, initial)(ma)

export const scan =
	<A, B>(f: (acc: B, a: A) => B, initial: B) =>
	(ma: Observable<A>): [Property<B>, Subscription] => {
		const p = newAtom(initial)
		const s = ma.subscribe({
			next: (a) => p.set(f(p.get(), a)),
		})
		return [p, s]
	}

export type PropertyValue<Target> = Target extends Property<infer A> ? A : never
export type MapPropertiesToValues<Target extends readonly Property<unknown>[]> = {
	readonly [Index in keyof Target]: PropertyValue<Target[Index]>
}
export const combine = <Properties extends readonly Property<unknown>[], Result>(
	...args: readonly [...Properties, (...values: MapPropertiesToValues<Properties>) => Result]
): Property<Result> => {
	// type is guaranteed by variadic function signature
	// eslint-disable-next-line no-restricted-syntax
	const project: (...values: readonly unknown[]) => Result = args[args.length - 1] as never
	// type is guaranteed by variadic function signature
	// eslint-disable-next-line no-restricted-syntax
	const properties: Properties = args.slice(0, args.length - 1) as never

	const get = memoizeProjectionFunction(properties, project)

	const doesNotEmit = properties.every((property) => property.subscribe === never.subscribe)
	if (doesNotEmit) return newProperty(get, never.subscribe)

	const merged = mergeMany(properties)

	const proxy: Observable<Time> = multicast({
		subscribe: (observer) => {
			let lastValue = get()
			return merged.subscribe({
				next: (time) => {
					const newValue = get()
					if (lastValue !== newValue) {
						lastValue = newValue
						observer.next(time)
					}
				},
			})
		},
	})
	return newProperty(get, proxy.subscribe)
}

const memoizeProjectionFunction = <Result>(
	inputs: readonly Property<unknown>[],
	f: (...values: readonly unknown[]) => Result,
): (() => Result) => {
	const length = inputs.length
	if (length === 0) {
		return memo0(f)
	}
	if (length === 1) {
		const a = inputs[0]
		const memoF = memo1(f)
		return () => memoF(a.get())
	}
	if (length === 2) {
		const a = inputs[0]
		const b = inputs[1]
		const memoF = memo2(f)
		return () => memoF(a.get(), b.get())
	}
	if (length === 3) {
		const a = inputs[0]
		const b = inputs[1]
		const c = inputs[2]
		const memoF = memo3(f)
		return () => memoF(a.get(), b.get(), c.get())
	}
	if (length === 4) {
		const a = inputs[0]
		const b = inputs[1]
		const c = inputs[2]
		const d = inputs[3]
		const memoF = memo4(f)
		return () => memoF(a.get(), b.get(), c.get(), d.get())
	}
	if (length === 5) {
		const a = inputs[0]
		const b = inputs[1]
		const c = inputs[2]
		const d = inputs[3]
		const e = inputs[4]
		const memoF = memo5(f)
		return () => memoF(a.get(), b.get(), c.get(), d.get(), e.get())
	}
	const memoF = memoMany(f)
	return () => {
		const values: unknown[] = Array(length)
		for (let i = 0; i < length; i++) {
			values[i] = inputs[i].get()
		}
		// performance
		// eslint-disable-next-line prefer-spread
		return memoF.apply(undefined, values)
	}
}
