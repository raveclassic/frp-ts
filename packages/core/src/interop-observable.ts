import { type Observable, type Observer, type Subscription } from './observable'
import { type Time } from './clock'

declare global {
	interface SymbolConstructor {
		readonly observable: symbol
	}
}

// A hack for typing and (RxJS / Most) compatibility
export const observableSymbol: typeof Symbol.observable =
	// eslint-disable-next-line no-restricted-syntax
	(typeof Symbol === 'function' && Symbol.observable) || ('@@observable' as never)

export interface InteropObservable<A> {
	subscribe: (observer: Partial<Observer<A>>) => Subscription
}

export interface InteropObservableHolder<A> {
	readonly [Symbol.observable]: () => InteropObservable<A>
}

export const newInteropObservable = <A>(
	get: () => A,
	subscribe: Observable<Time>['subscribe'],
): InteropObservable<A> => ({
	subscribe: (observer) => {
		let hasValue = false
		let value: A | undefined
		const emitNext = () => {
			if (observer.next) {
				const prevValue = value
				const prevHasValue = hasValue
				value = get()
				hasValue = true
				if (!prevHasValue || prevValue !== value) {
					observer.next(value)
				}
			}
		}
		emitNext()
		return subscribe({
			next: emitNext,
		})
	},
})
