import { Observable, Observer, Subscription } from './observable'
import { Time } from './clock'

declare global {
	interface SymbolConstructor {
		readonly observable: symbol
	}
}

// A hack for typing and (RxJS / Most) compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment
export const observableSymbol: typeof Symbol.observable = ((): any =>
	(typeof Symbol === 'function' && Symbol.observable) || '@@observable')()

export interface InteropObservable<A> {
	subscribe: (observer: Partial<Observer<A>>) => Subscription
}

export const newInteropObservable = <A>(
	get: () => A,
	subscribe: Observable<Time>['subscribe'],
): InteropObservable<A> => ({
	subscribe: (observer) => {
		const emitNext = () => observer.next?.(get())
		emitNext()
		return subscribe({
			next: emitNext,
		})
	},
})
