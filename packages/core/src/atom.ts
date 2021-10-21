import { newEmitter } from './emitter'
import { Property } from './property'
import { Env, Time } from './clock'
import { Observer, Subscription } from './observable'

export interface Update<A> {
	(a: A): A
}

export interface Atom<A> extends Property<A> {
	readonly set: (a: A) => void
	readonly modify: (...updates: readonly Update<A>[]) => void
}

export const newAtom =
	(env: Env) =>
	<A>(initial: A): Atom<A> => {
		let last = initial
		const e = newEmitter()
		const set = (a: A): void => {
			if (last !== a) {
				last = a
				e.next(env.clock.now())
			}
		}
		const get = (): A => last
		const subscribe = (observer: Observer<Time>): Subscription => e.subscribe(observer)
		const modify = (...updates: readonly Update<A>[]): void => {
			let value = last
			for (const update of updates) {
				value = update(value)
			}
			set(value)
		}

		return {
			set,
			get,
			subscribe,
			modify,
		}
	}
