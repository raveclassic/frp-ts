import { newEmitter, Notifier } from './emitter'
import { Source } from './source'
import { Env } from './clock'

export interface Atom<A> extends Source<A> {
	readonly set: (a: A) => void
}

export const newAtom = (env: Env) => <A>(initial: A): Atom<A> => {
	let last = initial
	const e = newEmitter()
	const set = (a: A): void => {
		if (last !== a) {
			last = a
			e.notify(env.clock.now())
		}
	}
	const get = () => last
	const notifier: Notifier = (listener) => e.subscribe(listener)
	return {
		set,
		get,
		notifier,
	}
}
