export interface Observer<A> {
	readonly next: (a: A) => void
}

export interface Subscription {
	readonly unsubscribe: () => void
}

export interface Observable<A> {
	readonly subscribe: (observer: Observer<A>) => Subscription
}

export function newAdapter<T = never>(): [observable: Observable<T>, next: (value: T) => void] {
	let observer: Observer<T> | undefined
	const observable: Observable<T> = {
		subscribe: (o) => {
			observer = o
			return {
				unsubscribe: () => {
					observer = undefined
				},
			}
		},
	}
	return [observable, (value) => observer?.next(value)]
}
