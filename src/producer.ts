import { newEmitter } from './emitter'
import { Notifier, Source } from './source'
import { Clock } from './clock'

export interface Producer<A> {
	readonly next: (a: A) => void
	readonly source: Source<A>
}

export interface Env {
	readonly clock: Clock
}

export const newProducer = (env: Env) => <A>(initial: A): Producer<A> => {
	let last = initial
	const e = newEmitter()
	const next = (a: A): void => {
		if (last !== a) {
			last = a
			e.notify(env.clock.now())
		}
	}
	const getter = () => last
	const notifier: Notifier = (listener) => e.subscribe(listener)
	return {
		next,
		source: { getter, notifier },
	}
}
