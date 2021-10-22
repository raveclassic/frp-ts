interface Observer<A> {
	readonly next: (a: A) => void
}

interface Subscription {
	readonly unsubscribe: () => void
}

interface Observable<A> {
	readonly subscribe: (observer: Observer<A>) => Subscription
}

export const attachSubscription = <A, S extends Observable<A>>(source: S, subscription: Subscription): S => ({
	...source,
	subscribe: (l) => {
		const sourceSubscription = source.subscribe(l)
		return {
			unsubscribe: () => {
				sourceSubscription.unsubscribe()
				subscription.unsubscribe()
			},
		}
	},
})
