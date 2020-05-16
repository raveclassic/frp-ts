import { newEmitter } from './emitter'
import { Property } from './property'
import { Env } from './clock'

export interface Atom<A> extends Property<A> {
	readonly set: (a: A) => void
}

export const newAtom = (env: Env) => <A>(initial: A): Atom<A> => {
	let last = initial
	const e = newEmitter()
	return {
		set: (a) => {
			if (last !== a) {
				last = a
				e.next(env.clock.now())
			}
		},
		get: () => last,
		subscribe: (observer) => e.subscribe(observer),
	}
}
