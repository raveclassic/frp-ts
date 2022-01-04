import { atom, Atom, clock, Property } from '@frp-ts/core'
import { PrimitiveElementChild, renderChild } from './h'
import { cleanup, Context, disposeContext, withContext } from './context'
import { APPEND_OPERATION, diff, DiffOperation, GET_BEFORE_OPERATION } from './diff'

export interface ForProps<Item> {
	readonly items: Property<readonly Item[]>
	readonly getKey: (item: Item, index: number) => PropertyKey
	readonly children: (item: Property<Item>) => PrimitiveElementChild
}

interface CacheEntry<Item> {
	readonly element: Node
	readonly atom: Atom<Item>
	readonly context: Context
}
interface Cache<Item> extends Map<PropertyKey, CacheEntry<Item>> {}

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

export function For<Item>(props: ForProps<Item>): DocumentFragment {
	const [result] = withContext('For', () => {
		console.log('rendering For')
		const cache: Cache<Item> = new Map()

		const startMarker = document.createTextNode('')
		const endMarker = document.createTextNode('')

		// initial run
		let previousItems = props.items.get().slice() // make a copy, udomdiff mutates this list
		const renderedItems: Node[] = []
		for (let i = 0; i < previousItems.length; i++) {
			const item = previousItems[i]
			const key = props.getKey(item, i)
			const entry = newCacheEntry(item, props)
			cache.set(key, entry)
			renderedItems.push(entry.element)
		}

		let currentParent: Node | null = null

		// updates
		const subscription = props.items.subscribe({
			next: () => {
				currentParent = startMarker.parentNode
				// parent is either a DocumentFragment or an Element
				// where the DocumentFragment has been attached to
				if (!currentParent) return

				const nextItems = props.items.get()

				diff(currentParent, previousItems, nextItems, process, endMarker, props.getKey, onNewValue, onDelete)
				previousItems = nextItems.slice()
			},
		})

		const process = (item: Item, key: PropertyKey, operation: DiffOperation): Node => {
			switch (operation) {
				case APPEND_OPERATION: {
					const entry = newCacheEntry(item, props)
					cache.set(key, entry)
					return entry.element
				}
				case GET_BEFORE_OPERATION: {
					const cached = cache.get(key)
					if (cached) {
						return cached.element
					}
					throw new Error(`Cannot find cached node for key "${key.toString()}"`)
				}
			}
		}

		const onNewValue = (key: PropertyKey, previousValue: Item, newValue: Item): void => {
			const cached = cache.get(key)
			if (cached) {
				cached.atom.set(newValue)
			}
		}

		const onDelete = (key: PropertyKey): void => {
			const cached = cache.get(key)
			if (cached) {
				currentParent?.removeChild(cached.element)
				disposeContext(cached.context)
				cache.delete(key)
			}
		}

		cleanup(() => {
			console.log('unmounting For')
			subscription.unsubscribe()
		})

		const result = document.createDocumentFragment()
		result.append(startMarker, ...renderedItems, endMarker)
		return result
	})
	return result
}

export function indexKey<Item>(item: Item, index: number): number {
	return index
}

const MOVED = Symbol('Moved')
type Moved = typeof MOVED

function newCacheEntry<Item>(item: Item, props: ForProps<Item>): CacheEntry<Item> {
	const itemAtom = newAtom(item)
	const [itemElement, itemContext] = withContext('item', () => renderChild(props.children(itemAtom)))
	return {
		atom: itemAtom,
		element: itemElement,
		context: itemContext,
	}
}
