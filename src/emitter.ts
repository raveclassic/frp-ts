import { Disposable, Listener } from './source';
import { Time } from './clock';

/**
 * Synchronous time-based emitter
 */
export interface Emitter {
	readonly subscribe: (listener: Listener) => Disposable;
	readonly notify: (time: Time) => void;
}

export const newEmitter = (): Emitter => {
	let lastNotifiedTime: Time | undefined = undefined;
	const listeners = new Set<Listener>();
	let isNotifying = false;
	// tracks new listeners added while notifying
	let pendingAdditions: Listener[] = [];

	return {
		notify: (time) => {
			if (lastNotifiedTime !== time) {
				lastNotifiedTime = time;
				isNotifying = true;
				for (const listener of listeners) {
					listener(time);
				}
				isNotifying = false;

				// flush pending additions
				if (pendingAdditions.length > 0) {
					for (let i = 0, l = pendingAdditions.length; i < l; i++) {
						listeners.add(pendingAdditions[i]);
					}
					pendingAdditions = [];
				}
			}
		},
		subscribe: (listener) => {
			if (isNotifying) {
				pendingAdditions.push(listener);
			} else {
				listeners.add(listener);
			}
			return () => listeners.delete(listener);
		},
	};
};
