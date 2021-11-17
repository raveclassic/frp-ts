/** @jsx h.createElement */
import { PrimitiveElementChild, h, renderChild, ElementChild, ElementChildren } from './h'
import { cleanup, disposeContext, withContext } from './context'
import { Emitter, property, Property } from '@frp-ts/core'
import './udomdiff'
import udomdiff from 'udomdiff'
import { newEmitter } from '@frp-ts/core/src/emitter'

export interface IfProps {
	readonly value: Property<boolean>
	readonly then: () => PrimitiveElementChild
	readonly else?: () => PrimitiveElementChild
}

export function If(props: IfProps): PrimitiveElementChild {
	return <Bind name={'If'}>{property.combine(props.value, (value) => (value ? props.then() : props.else?.()))}</Bind>
}

export interface BindProps {
	name?: string
	children: Property<PrimitiveElementChild>
}

export function Bind(props: BindProps): PrimitiveElementChild {
	const [result, childContext] = withContext(props.name ?? 'Bind', () => {
		let shouldDisposeChildContext = false
		const result = property.combine(props.children, (children) => {
			shouldDisposeChildContext && disposeContext(childContext)
			shouldDisposeChildContext = true
			return children
		})

		// call renderChild even with a possible `Property<Node>` because this component tracks child context
		return renderChild(result)
	})

	return result
}

export interface ForProps<Item> {
	readonly value: Property<readonly Item[]>
	readonly key: (item: Item, index: number) => PropertyKey
	readonly children: (item: Property<Item>) => PrimitiveElementChild
}

export function For<Item>(props: ForProps<Item>): PrimitiveElementChild {
	const [result] = withContext('For', () => {
		const cache: Record<PropertyKey, CacheEntry<Item>> = {}

		// initial
		let nextItems = props.value.get()
		for (let i = 0; i < nextItems.length; i++) {
			const item = nextItems[i]
			const key = props.key(item, i)
			cache[key] = createCacheEntry(item, props.children)
		}

		const subscription = props.value.subscribe({
			next: (time) => {
				const prevItems = nextItems
				const prevItemsLength = prevItems.length
				nextItems = props.value.get()
				const nextItemsLength = nextItems.length

				const aEnd = prevItemsLength
				const bEnd = nextItemsLength
				const aStart = 0
				const bStart = 0
				const map = null

				while (aStart < aEnd || bStart < bEnd) {}

				for (let i = 0; i < nextItems.length; i++) {
					const item = nextItems[i]
					const key = props.key(item, i)
					const entry = cache[key]
					if (entry !== undefined) {
						if (item !== entry.valueRef.value) {
							entry.valueRef.value = item
							entry.emitter.next(time)
						}
					} else {
						cache[key] = createCacheEntry(item, props.children)
					}
				}
			},
		})

		const nodes = Object.values(cache).map((entry) => entry.node)

		cleanup(() => {
			nextItems = []
			subscription.unsubscribe()
		})

		return <h.Fragment>{nodes}</h.Fragment>
	})

	return result
}

interface CacheEntry<Item> {
	readonly valueRef: {
		value: Item
	}
	readonly node: PrimitiveElementChild
	readonly emitter: Emitter
	readonly property: Property<Item>
}
function createCacheEntry<Item>(
	item: Item,
	children: (item: Property<Item>) => PrimitiveElementChild,
): CacheEntry<Item> {
	const emitter = newEmitter()
	const valueRef = {
		value: item,
	}
	const p: Property<Item> = {
		get: () => valueRef.value,
		subscribe: emitter.subscribe,
	}
	const entry: CacheEntry<Item> = {
		valueRef,
		emitter,
		node: children(p),
		property: p,
	}
	return entry
}

// const diff = (
// 	parentNode: Node,
// 	a: Node[],
// 	b: readonly Node[],
// 	get: (node: Node, operation: number) => Element,
// 	before: Node,
// ) => {
// 	const bLength = b.length
// 	let aEnd = a.length
// 	let bEnd = bLength
// 	let aStart = 0
// 	let bStart = 0
// 	let map: Map<Node, number> | null = null
// 	while (aStart < aEnd || bStart < bEnd) {
// 		// append head, tail, or nodes in between: fast path
// 		if (aEnd === aStart) {
// 			// we could be in a situation where the rest of nodes that
// 			// need to be added are not at the end, and in such case
// 			// the node to `insertBefore`, if the index is more than 0
// 			// must be retrieved, otherwise it's gonna be the first item.
// 			const node =
// 				bEnd < bLength ? (bStart ? get(b[bStart - 1], -0).nextSibling : get(b[bEnd - bStart], 0)) : before
// 			while (bStart < bEnd) {
// 				parentNode.insertBefore(get(b[bStart++], 1), node)
// 			}
// 		}
// 		// remove head or tail: fast path
// 		else if (bEnd === bStart) {
// 			while (aStart < aEnd) {
// 				// remove the node only if it's unknown or not live
// 				if (!map || !map.has(a[aStart])) get(a[aStart], -1).remove()
// 				aStart++
// 			}
// 		}
// 		// same node: fast path
// 		else if (a[aStart] === b[bStart]) {
// 			aStart++
// 			bStart++
// 		}
// 		// same tail: fast path
// 		else if (a[aEnd - 1] === b[bEnd - 1]) {
// 			aEnd--
// 			bEnd--
// 		}
// 		// The once here single last swap "fast path" has been removed in v1.1.0
// 		// https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
// 		// reverse swap: also fast path
// 		else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
// 			// this is a "shrink" operation that could happen in these cases:
// 			// [1, 2, 3, 4, 5]
// 			// [1, 4, 3, 2, 5]
// 			// or asymmetric too
// 			// [1, 2, 3, 4, 5]
// 			// [1, 2, 3, 5, 6, 4]
// 			const node = get(a[--aEnd], -1).nextSibling
// 			parentNode.insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling)
// 			parentNode.insertBefore(get(b[--bEnd], 1), node)
// 			// mark the future index as identical (yeah, it's dirty, but cheap 👍)
// 			// The main reason to do this, is that when a[aEnd] will be reached,
// 			// the loop will likely be on the fast path, as identical to b[bEnd].
// 			// In the best case scenario, the next loop will skip the tail,
// 			// but in the worst one, this node will be considered as already
// 			// processed, bailing out pretty quickly from the map index check
// 			a[aEnd] = b[bEnd]
// 		}
// 		// map based fallback, "slow" path
// 		else {
// 			// the map requires an O(bEnd - bStart) operation once
// 			// to store all future nodes indexes for later purposes.
// 			// In the worst case scenario, this is a full O(N) cost,
// 			// and such scenario happens at least when all nodes are different,
// 			// but also if both first and last items of the lists are different
// 			if (!map) {
// 				map = new Map()
// 				let i = bStart
// 				while (i < bEnd) {
// 					map.set(b[i], i++)
// 				}
// 			}
// 			// if it's a future node, hence it needs some handling
// 			if (map.has(a[aStart])) {
// 				// grab the index of such node, 'cause it might have been processed
// 				const index = map.get(a[aStart])
// 				// if it's not already processed, look on demand for the next LCS
// 				if (index !== undefined && bStart < index && index < bEnd) {
// 					let i = aStart
// 					// counts the amount of nodes that are the same in the future
// 					let sequence = 1
// 					while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence) sequence++
// 					// effort decision here: if the sequence is longer than replaces
// 					// needed to reach such sequence, which would brings again this loop
// 					// to the fast path, prepend the difference before a sequence,
// 					// and move only the future list index forward, so that aStart
// 					// and bStart will be aligned again, hence on the fast path.
// 					// An example considering aStart and bStart are both 0:
// 					// a: [1, 2, 3, 4]
// 					// b: [7, 1, 2, 3, 6]
// 					// this would place 7 before 1 and, from that time on, 1, 2, and 3
// 					// will be processed at zero cost
// 					if (sequence > index - bStart) {
// 						const node = get(a[aStart], 0)
// 						while (bStart < index) {
// 							parentNode.insertBefore(get(b[bStart++], 1), node)
// 						}
// 					}
// 					// if the effort wasn't good enough, fallback to a replace,
// 					// moving both source and target indexes forward, hoping that some
// 					// similar node will be found later on, to go back to the fast path
// 					else {
// 						parentNode.replaceChild(get(b[bStart++], 1), get(a[aStart++], -1))
// 					}
// 				}
// 				// otherwise move the source forward, 'cause there's nothing to do
// 				else aStart++
// 			}
// 			// this node has no meaning in the future list, so it's more than safe
// 			// to remove it, and check the next live node out instead, meaning
// 			// that only the live list index should be forwarded
// 			else {
// 				get(a[aStart++], -1).remove()
// 			}
// 		}
// 	}
// 	return b
// }
