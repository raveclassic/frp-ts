import { type Observer, type Subscription } from './observable'
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
	subscribe: (observer: Observer<Time>) => Subscription,
): InteropObservable<A> => ({
	subscribe: (observer) => {
		const emitNext = () => {
			if (observer.next) {
				observer.next(get())
			}
		}
		emitNext()
		return subscribe({
			next: emitNext,
		})
	},
})
