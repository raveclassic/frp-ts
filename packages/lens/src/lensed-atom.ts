import { Atom, combine, newAtom } from '@frp-ts/core'

export interface Lens<S, A> {
	readonly get: (s: S) => A
	readonly set: (a: A) => (s: S) => S
}

export interface LensedAtom<A> extends Atom<A> {
	readonly view: <B>(lens: Lens<A, B>) => LensedAtom<B>
}

export const newLensedAtom = <A>(initial: A): LensedAtom<A> => toLensedAtom(newAtom(initial))

export const toLensedAtom = <A>(atom: Atom<A>): LensedAtom<A> => {
	const view = <B>(lens: Lens<A, B>): LensedAtom<B> => {
		const lensedSet = (b: B) => atom.set(lens.set(b)(atom.get()))
		const lensedProperty = combine(atom, lens.get)
		return {
			...lensedProperty,
			set: lensedSet,
			view: (bc) => view(composeLens(lens, bc)),
			modify: (...updates) => {
				let value = lensedProperty.get()
				for (const update of updates) {
					value = update(value)
				}
				lensedSet(value)
			},
		}
	}

	return {
		...atom,
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
