export const DELETE_OPERATION = 1 // -1
export const APPEND_OPERATION = 2 // 1
export const INSERT_BEFORE_OPERATION = 3 // -0
export const INSERT_AFTER_OPERATION = 4 // 0

export type UDOMDiffOperation =
	| typeof DELETE_OPERATION
	| typeof APPEND_OPERATION
	| typeof INSERT_BEFORE_OPERATION
	| typeof INSERT_AFTER_OPERATION

/**
 * Adapted from https://github.com/WebReflection/udomdiff/blob/master/index.js
 * All credits to https://github.com/WebReflection
 * License: ISC
 */
export function udomdiff<T>(
	parentNode: Node,
	a: T[],
	b: readonly T[],
	get: (item: T, key: PropertyKey, operation: UDOMDiffOperation) => Node,
	before: Node,
	getKey: (item: T, index: number) => PropertyKey,
): readonly T[] {
	const bLength = b.length
	let aEnd = a.length
	let bEnd = bLength
	let aStart = 0
	let bStart = 0
	let map = null

	while (aStart < aEnd || bStart < bEnd) {
		// append head, tail, or nodes in between: fast path
		if (aEnd === aStart) {
			// we could be in a situation where the rest of nodes that
			// need to be added are not at the end, and in such case
			// the node to `insertBefore`, if the index is more than 0
			// must be retrieved, otherwise it's gonna be the first item.
			let node: Node | null
			if (bEnd < bLength) {
				if (bStart) {
					const index = bStart - 1
					const item = b[index]
					const key = getKey(item, index)
					node = get(item, key, INSERT_BEFORE_OPERATION).nextSibling
				} else {
					const index = bEnd - bStart
					const item = b[index]
					const key = getKey(item, index)
					node = get(item, key, INSERT_AFTER_OPERATION)
				}
			} else {
				node = before
			}

			while (bStart < bEnd) {
				const item = b[bStart]
				const key = getKey(item, bStart)
				parentNode.insertBefore(get(item, key, APPEND_OPERATION), node)
				bStart++
			}
		} // remove head or tail: fast path
		else if (bEnd === bStart) {
			while (aStart < aEnd) {
				// remove the node only if it's unknown or not live
				if (!map || !map.has(a[aStart])) {
					const item = a[aStart]
					const key = getKey(item, aStart)
					parentNode.removeChild(get(item, key, DELETE_OPERATION))
				}
				aStart++
			}
		} // same node: fast path
		else if (a[aStart] === b[bStart]) {
			aStart++
			bStart++
		} // same tail: fast path
		else if (a[aEnd - 1] === b[bEnd - 1]) {
			aEnd--
			bEnd--
		} // The once here single last swap "fast path" has been removed in v1.1.0
		// https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
		// reverse swap: also fast path
		else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
			// this is a "shrink" operation that could happen in these cases:
			// [1, 2, 3, 4, 5]
			// [1, 4, 3, 2, 5]
			// or asymmetric too
			// [1, 2, 3, 4, 5]
			// [1, 2, 3, 5, 6, 4]
			const index = --aEnd
			const item = a[index]
			const key = getKey(item, index)
			const _node = get(item, key, DELETE_OPERATION).nextSibling
			{
				const bItem = b[bStart]
				const bKey = getKey(bItem, bStart)
				const aItem = a[aStart]
				const aKey = getKey(aItem, aStart)
				parentNode.insertBefore(
					get(bItem, bKey, APPEND_OPERATION),
					get(aItem, aKey, DELETE_OPERATION).nextSibling,
				)
				bStart++
				aStart++
			}
			{
				const index = --bEnd
				const item = b[index]
				const key = getKey(item, index)
				parentNode.insertBefore(get(item, key, APPEND_OPERATION), _node) // mark the future index as identical (yeah, it's dirty, but cheap 👍)
			}
			// The main reason to do this, is that when a[aEnd] will be reached,
			// the loop will likely be on the fast path, as identical to b[bEnd].
			// In the best case scenario, the next loop will skip the tail,
			// but in the worst one, this node will be considered as already
			// processed, bailing out pretty quickly from the map index check

			a[aEnd] = b[bEnd]
		} // map based fallback, "slow" path
		else {
			// the map requires an O(bEnd - bStart) operation once
			// to store all future nodes indexes for later purposes.
			// In the worst case scenario, this is a full O(N) cost,
			// and such scenario happens at least when all nodes are different,
			// but also if both first and last items of the lists are different
			if (!map) {
				map = new Map()
				let i = bStart

				while (i < bEnd) {
					map.set(b[i], i++)
				}
			} // if it's a future node, hence it needs some handling

			if (map.has(a[aStart])) {
				// grab the index of such node, 'cause it might have been processed
				const index = map.get(a[aStart]) // if it's not already processed, look on demand for the next LCS

				if (bStart < index && index < bEnd) {
					let _i = aStart // counts the amount of nodes that are the same in the future

					let sequence = 1

					while (++_i < aEnd && _i < bEnd && map.get(a[_i]) === index + sequence) {
						sequence++
					} // effort decision here: if the sequence is longer than replaces
					// needed to reach such sequence, which would brings again this loop
					// to the fast path, prepend the difference before a sequence,
					// and move only the future list index forward, so that aStart
					// and bStart will be aligned again, hence on the fast path.
					// An example considering aStart and bStart are both 0:
					// a: [1, 2, 3, 4]
					// b: [7, 1, 2, 3, 6]
					// this would place 7 before 1 and, from that time on, 1, 2, and 3
					// will be processed at zero cost

					if (sequence > index - bStart) {
						const aItem = a[aStart]
						const aKey = getKey(aItem, aStart)
						const _node2 = get(aItem, aKey, INSERT_AFTER_OPERATION)

						while (bStart < index) {
							const bItem = b[bStart]
							const bKey = getKey(bItem, bStart)
							parentNode.insertBefore(get(bItem, bKey, APPEND_OPERATION), _node2)
							bStart++
						}
					} // if the effort wasn't good enough, fallback to a replace,
					// moving both source and target indexes forward, hoping that some
					// similar node will be found later on, to go back to the fast path
					else {
						const bItem = b[bStart]
						const bKey = getKey(bItem, bStart)
						const aItem = a[aStart]
						const aKey = getKey(aItem, aStart)
						parentNode.replaceChild(get(bItem, bKey, APPEND_OPERATION), get(aItem, aKey, DELETE_OPERATION))
						bStart++
						aStart++
					}
				} // otherwise move the source forward, 'cause there's nothing to do
				else aStart++
			} // this node has no meaning in the future list, so it's more than safe
			// to remove it, and check the next live node out instead, meaning
			// that only the live list index should be forwarded
			else {
				const item = a[aStart]
				const key = getKey(item, aStart)
				parentNode.removeChild(get(item, key, DELETE_OPERATION))
				aStart++
			}
		}
	}

	return b
}
