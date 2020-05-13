import { Env, Time } from './clock'
import { Subscription, subscriptionNone } from './observable'

export interface Listener {
	(time: Time): void
}

export interface Notifier {
	(listener: Listener): Subscription
}

/**
 * Synchronous time-based emitter
 */
export interface Emitter {
	readonly subscribe: Notifier
	readonly notify: Listener
}

export const newEmitter = (): Emitter => {
	let lastNotifiedTime: Time | undefined = undefined
	const listeners = new Set<Listener>()
	let isNotifying = false
	// tracks new listeners added while notifying
	let pendingAdditions: Listener[] = []

	return {
		notify: (time) => {
			if (lastNotifiedTime !== time) {
				lastNotifiedTime = time
				isNotifying = true
				for (const listener of listeners) {
					listener(time)
				}
				isNotifying = false

				// flush pending additions
				if (pendingAdditions.length > 0) {
					for (let i = 0, l = pendingAdditions.length; i < l; i++) {
						listeners.add(pendingAdditions[i])
					}
					pendingAdditions = []
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

const multicast = (a: Notifier): Notifier => {
	const emitter = newEmitter()
	let counter = 0
	let outer = subscriptionNone
	return (listener) => {
		counter++
		const inner = emitter.subscribe(listener)
		if (counter === 1) {
			outer = a((t) => emitter.notify(t))
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
	}
}

export const combineNotifier = (a: Notifier, b: Notifier): Notifier => {
	let lastNotifiedTime = Infinity
	return multicast((listener) => {
		const sa = a((t) => {
			if (t !== lastNotifiedTime) {
				lastNotifiedTime = t
				listener(t)
			}
		})
		const sb = b((t) => {
			if (t !== lastNotifiedTime) {
				lastNotifiedTime = t
				listener(t)
			}
		})
		return {
			unsubscribe: () => {
				sa.unsubscribe()
				sb.unsubscribe()
			},
		}
	})
}

export interface EventListenerOptions {
	capture?: boolean
}
export interface AddEventListenerOptions extends EventListenerOptions {
	once?: boolean
	passive?: boolean
}
export interface EventTarget {
	readonly addEventListener: (event: string, handler: () => void, options?: AddEventListenerOptions | boolean) => void
	readonly removeEventListener: (event: string, handler: () => void, options?: EventListenerOptions | boolean) => void
}
export const fromEvent = (e: Env) => (
	target: EventTarget,
	event: string,
	options?: AddEventListenerOptions,
): Notifier =>
	multicast((listener) => {
		const handler = () => listener(e.clock.now())
		target.addEventListener(event, handler, options)
		return {
			unsubscribe: () => target.removeEventListener(event, handler, options),
		}
	})
