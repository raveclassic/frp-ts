export const DELETE_OPERATION = -1
export const APPEND_OPERATION = 1
export const GET_BEFORE_OPERATION = 0

export type DiffOperation = typeof DELETE_OPERATION | typeof APPEND_OPERATION | typeof GET_BEFORE_OPERATION

const MOVED = Symbol('Moved')
type Moved = typeof MOVED

/**
 * Adapted from https://github.com/luwes/sinuous/blob/master/packages/sinuous/map/src/diff.js
 * All credits to https://github.com/luwes
 * License: no license
 */
export function diff<T>(
	parent: Node,
	a: (T | Moved)[],
	b: readonly T[],
	get: (item: T, key: PropertyKey, operation: DiffOperation) => Node,
	before: Node,
	getKey: (item: T, index: number) => PropertyKey,
	onNewValue: (key: PropertyKey, previousValue: T, newValue: T) => void,
): void {
	const aIdx = new Map<PropertyKey, number>()
	const bIdx = new Map<PropertyKey, number>()
	let i
	let j

	// Create a mapping from keys to their position in the old list
	for (i = 0; i < a.length; i++) {
		const aItem = a[i]
		if (aItem !== MOVED) {
			aIdx.set(getKey(aItem, i), i)
		}
	}

	// Create a mapping from keys to their position in the new list
	for (i = 0; i < b.length; i++) {
		bIdx.set(getKey(b[i], i), i)
	}

	for (i = j = 0; i !== a.length || j !== b.length; ) {
		const aElm = a[i]
		const bElm = b[j]
		if (aElm === MOVED) {
			// This is a element that has been moved to earlier in the list
			i++
		} else if (b.length <= j) {
			// No more elements in new, this is a delete
			parent.removeChild(get(aElm, getKey(aElm, i), DELETE_OPERATION))
			i++
		} else if (a.length <= i) {
			// No more elements in old, this is an addition
			parent.insertBefore(
				get(bElm, getKey(bElm, j), APPEND_OPERATION),
				get(aElm, getKey(aElm, i), GET_BEFORE_OPERATION) ?? before,
			)
			j++
		} else if (aElm === bElm) {
			// No difference, we move on
			i++
			j++
		} else {
			const aKey = getKey(aElm, i)
			const bKey = getKey(bElm, j)
			// Look for the current element at this location in the new list
			// This gives us the idx of where this element should be
			const curElmInNewIndex = bIdx.get(aKey)
			// Look for the the wanted elment at this location in the old list
			// This gives us the idx of where the wanted element is now
			const wantedElmInOldIndex = aIdx.get(bKey)
			if (curElmInNewIndex === undefined) {
				// Current element is not in new list, it has been removed
				parent.removeChild(get(aElm, aKey, DELETE_OPERATION))
				i++
			} else if (wantedElmInOldIndex === undefined) {
				// New element is not in old list, it has been added
				parent.insertBefore(get(bElm, bKey, APPEND_OPERATION), get(aElm, aKey, GET_BEFORE_OPERATION) ?? before)
				j++
			} else if (curElmInNewIndex === wantedElmInOldIndex && aKey === bKey) {
				// Different elements with the same key
				// Element has been updated with a new value
				// Try to updated cached
				onNewValue(aKey, aElm, bElm)
				i++
				j++
			} else {
				// Element is in both lists, it has been moved
				const wantedElmInOld = a[wantedElmInOldIndex]
				if (wantedElmInOld !== MOVED) {
					parent.insertBefore(
						get(wantedElmInOld, getKey(wantedElmInOld, wantedElmInOldIndex), APPEND_OPERATION),
						get(aElm, aKey, GET_BEFORE_OPERATION) ?? before,
					)
				}
				a[wantedElmInOldIndex] = MOVED
				if (wantedElmInOldIndex > i + 1) i++
				j++
			}
		}
	}
}
