export const attachSubscription = <A, S extends Observable<A>>(source: S, subscription: Subscription): S => ({
	...source,
	subscribe: (l) => {
		const sourceSubscription = source.subscribe(l)
		const additionalSubscription = additional.subscribe({
			next: () => {},
		})
		return {
			unsubscribe: () => {
				sourceSubscription.unsubscribe()
				additionalSubscription.unsubscribe()
			},
		}
	},
})
