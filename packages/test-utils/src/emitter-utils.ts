import { Observable, Subscription } from './observable-utils'

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
