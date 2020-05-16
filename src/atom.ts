import { newEmitter } from './emitter'
import { Property } from './property'
import { Env, Time } from './clock'
import { Observer, Subscription } from './observable'

export interface Lens<S, A> {
	readonly get: (s: S) => A
	readonly set: (a: A) => (s: S) => S
}

export interface Atom<A> extends Property<A> {
	readonly set: (a: A) => void
	readonly view: <B>(lens: Lens<A, B>) => Atom<B>
}

export const newAtom = (env: Env) => <A>(initial: A): Atom<A> => {
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
	const view = <B>(lens: Lens<A, B>): Atom<B> => ({
		get: () => lens.get(get()),
		set: (a) => set(lens.set(a)(get())),
		subscribe,
		view: (bc) => view(composeLens(lens, bc)),
	})
	return {
		set,
		get,
		subscribe,
		view,
	}
}

const composeLens = <A, B, C>(ab: Lens<A, B>, bc: Lens<B, C>): Lens<A, C> => ({
	get: (a) => bc.get(ab.get(a)),
	set: (c) => (a) => {
		const newB = bc.set(c)(ab.get(a))
		return ab.set(newB)(a)
	},
})
