import { Time } from './clock'
import { never, Observable, Observer, Subscription } from './observable'

let isLocked = false
let lastTime: Time | undefined = undefined
const lockedListeners = new Set<(time: Time) => void>()
export const action = (f: () => void): void => {
	isLocked = true
	f()
	isLocked = false
	if (lastTime !== undefined) {
		for (const listener of Array.from(lockedListeners)) {
			lockedListeners.delete(listener)
			listener(lastTime)
		}
		lastTime = undefined
	}
}

/**
 * Synchronous time-based emitter
 */
export interface Emitter extends Observable<Time>, Observer<Time> {}

export const newEmitter = (): Emitter => {
	let lastNotifiedTime: Time | undefined = undefined
	const listeners = new Set<Observer<Time>>()
	let isNotifying = false
	// tracks new listeners added while notifying
	const pendingAdditions: Observer<Time>[] = []

	return {
		next: (time) => {
			if (lastNotifiedTime !== time) {
				lastNotifiedTime = time
				if (isLocked) {
					lastTime = time
				}

				// performance
				if (listeners.size === 0) return

				isNotifying = true
				for (const listener of Array.from(listeners)) {
					if (isLocked) {
						lockedListeners.add(listener.next)
					} else {
						listener.next(time)
					}
				}
				isNotifying = false

				// flush pending additions
				if (pendingAdditions.length > 0) {
					for (let i = 0, l = pendingAdditions.length; i < l; i++) {
						listeners.add(pendingAdditions[i])
					}
					pendingAdditions.length = 0
				}
			}
		},
		subscribe: (listener) => {
			if (isNotifying) {
				pendingAdditions.push(listener)
			} else {
				listeners.add(listener)
			}
			return {
				unsubscribe: () => listeners.delete(listener),
			}
		},
	}
}

export const multicast = (a: Observable<Time>): Observable<Time> => {
	const emitter = newEmitter()
	let counter = 0
	let outer: Subscription | undefined
	return {
		subscribe: (listener) => {
			counter++
			const inner = emitter.subscribe(listener)
			if (counter === 1) {
				outer = a.subscribe(emitter)
			}
			return {
				unsubscribe: () => {
					counter--
					inner.unsubscribe()
					if (counter === 0 && outer) {
						outer.unsubscribe()
						outer = undefined
					}
				},
			}
		},
	}
}

export const mergeMany = (observables: readonly Observable<Time>[]): Observable<Time> => {
	if (observables.length === 0) {
		return never
	}
	if (observables.length === 1) {
		return observables[0]
	}
	let lastNotifiedTime: Time | undefined
	return {
		subscribe: (listener) => {
			const observer: Observer<Time> = {
				next: (t) => {
					if (t !== lastNotifiedTime) {
						lastNotifiedTime = t
						listener.next(t)
					}
				},
			}

			const subscriptions = observables.map((observable) => observable.subscribe(observer))
			return {
				unsubscribe: () => {
					for (const subscription of subscriptions) subscription.unsubscribe()
				},
			}
		},
	}
}
