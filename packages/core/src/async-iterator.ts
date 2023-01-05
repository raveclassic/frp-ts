import { Observer, Subscription } from './observable'
import { Time } from './clock'

declare global {
	interface SymbolConstructor {
		readonly asyncIterator: unique symbol
	}
}

interface AsyncIterator<T, TReturn = unknown, TNext = undefined> {
	// NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
	next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>
	return?(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>
	throw?(e?: unknown): Promise<IteratorResult<T, TReturn>>
}

export const asyncIteratorSymbol: typeof Symbol.asyncIterator =
	// eslint-disable-next-line no-restricted-syntax
	(typeof Symbol === 'function' && Symbol.asyncIterator) || /* istanbul ignore next */ ('@@asyncIterator' as never)

export interface AsyncIterable<A> {
	readonly [Symbol.asyncIterator]: () => AsyncIterator<A, void>
}

export const newAsyncIterator = <A>(
	get: () => A,
	subscribe: (observer: Observer<Time>) => Subscription,
): AsyncIterator<A, void> => {
	const buffer: A[] = []
	let isStopped = false
	let resolve: ((a: IteratorResult<A>) => void) | undefined
	const emitNext = () => {
		const value = get()
		if (resolve) {
			resolve({ value })
			resolve = undefined
		} else {
			buffer.push(value)
		}
	}
	emitNext()
	const subscription = subscribe({
		next: emitNext,
	})
	return {
		next: async (): Promise<IteratorResult<A>> => {
			if (isStopped) return { done: true, value: undefined }

			if (buffer.length > 0) {
				// eslint-disable-next-line no-restricted-syntax
				return { value: buffer.shift() as A }
			} else {
				return new Promise((_resolve) => {
					resolve = _resolve
				})
			}
		},
		return: () => {
			isStopped = true
			buffer.length = 0
			subscription.unsubscribe()
			resolve = undefined
			return Promise.resolve({ done: true, value: undefined })
		},
	}
}
