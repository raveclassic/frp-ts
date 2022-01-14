import { DEFAULT_ENV, Env, Time } from './clock'
import { never, Observable, Observer, subscriptionNone } from './observable'

let isLocked = false
let lastTime: Time | undefined = undefined
let lockedListeners = new Set<(time: Time) => void>()
export const action = (f: () => void): void => {
	isLocked = true
	f()
	isLocked = false
	if (lastTime !== undefined && lockedListeners) {
		for (const listener of Array.from(lockedListeners)) {
			listener(lastTime)
		}
		lastTime = undefined
		lockedListeners.clear()
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
	let pendingAdditions: Observer<Time>[] = []

	return {
		next: (time) => {
			if (lastNotifiedTime !== time) {
				lastNotifiedTime = time
				if (isLocked) {
					lastTime = time
				}

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

const multicast = (a: Observable<Time>): Observable<Time> => {
	const emitter = newEmitter()
	let counter = 0
	let outer = subscriptionNone
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
					if (counter === 0) {
						outer.unsubscribe()
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
		return multicast(observables[0])
	}
	let lastNotifiedTime = Infinity
	return multicast({
		subscribe: (listener) => {
			const subscriptions = observables.map((observable) =>
				observable.subscribe({
					next: (t) => {
						if (t !== lastNotifiedTime) {
							lastNotifiedTime = t
							listener.next(t)
						}
					},
				}),
			)
			return {
				unsubscribe: () => {
					for (const subscription of subscriptions) subscription.unsubscribe()
				},
			}
		},
	})
}

export interface EventListenerOptions {
	capture?: boolean
}
export interface AddEventListenerOptions extends EventListenerOptions, Partial<Env> {
	once?: boolean
	passive?: boolean
}
export interface EventTarget {
	readonly addEventListener: (event: string, handler: () => void, options?: AddEventListenerOptions | boolean) => void
	readonly removeEventListener: (event: string, handler: () => void, options?: EventListenerOptions | boolean) => void
}
export const fromEvent = (target: EventTarget, event: string, options?: AddEventListenerOptions): Observable<Time> => {
	const clock = options?.clock ?? DEFAULT_ENV.clock
	return multicast({
		subscribe: (listener) => {
			const handler = () => listener.next(clock.now())
			target.addEventListener(event, handler, options)
			return {
				unsubscribe: () => target.removeEventListener(event, handler, options),
			}
		},
	})
}
