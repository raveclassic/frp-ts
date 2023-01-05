export interface Iterable<A> {
	readonly [Symbol.iterator]: () => Iterator<A, void>
}

export const newIterator = <A>(get: () => A): Iterator<A, void> => {
	let didEmitInitial = false
	return {
		next: () => {
			if (!didEmitInitial) {
				didEmitInitial = true
				return { value: get() }
			}
			return { done: true, value: undefined }
		},
	}
}
