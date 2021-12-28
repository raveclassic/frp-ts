import { never, Observable, Subscription, subscriptionNone } from './observable'
import { mergeMany, newEmitter } from './emitter'
import { newAtom } from './atom'
import { Env, Time } from './clock'
import { memoMany } from '@frp-ts/utils'

export interface Property<A> extends Observable<Time> {
	readonly get: () => A
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

	return [
		{
			get: () => {
				// use extra thunk because reference to inner source changes
				return inner.get()
			},
			subscribe: emitter.subscribe,
		},
		outerDisposable,
	]
}

export const tap =
	<A>(f: (a: A) => unknown) =>
	(fa: Property<A>): Property<A> => ({
		get: fa.get,
		subscribe: (observer) =>
			fa.subscribe({
				next: (t) => {
					f(fa.get())
					observer.next(t)
				},
			}),
	})

export const fromObservable = (env: Env): (<A>(initial: A, ma: Observable<A>) => [Property<A>, Subscription]) => {
	const s = scan(env)
	return <A>(initial: A, ma: Observable<A>) => s<A, A>((_, a) => a, initial)(ma)
}

export function scan(
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
	const memoProject = memoMany(project)
	const get = () => memoProject(...properties.map((property) => property.get()))
	const doesNotEmit = properties.every((property) => property.subscribe === never.subscribe)
	const subscribe = doesNotEmit ? never.subscribe : mergeMany(properties).subscribe
	return {
		get,
		subscribe,
	}
}
