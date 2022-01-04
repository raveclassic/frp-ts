import { atom, clock, emitter, Property, Time } from '@frp-ts/core'
import { PrimitiveElementChild, renderChild } from '../h/h'
import { cleanup, Context, disposeContext, withContext } from '../context/context'
import { diff } from '../utils/diff'

export interface ForProps<Item> {
	readonly items: Property<readonly Item[]>
	readonly getKey: (item: Item, index: number) => PropertyKey
	readonly children: (item: Property<Item>) => PrimitiveElementChild
}

interface Notifier<Value> extends Property<Value> {
	readonly notify: (time: Time, newValue: Value) => void
}

interface CacheEntry<Item> {
	readonly element: Node
	readonly notifier: Notifier<Item>
	readonly context: Context
}
interface Cache<Item> extends Map<PropertyKey, CacheEntry<Item>> {}

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

export function For<Item>(props: ForProps<Item>): DocumentFragment {
	const [result] = withContext('For', () => {
		const cache: Cache<Item> = new Map()

		const startMarker = document.createTextNode('')
		const endMarker = document.createTextNode('')

		// initial run
		let previousItems = props.items.get().slice() // make a copy, udomdiff mutates this list
		const renderedItems: Node[] = []
		for (let i = 0; i < previousItems.length; i++) {
			const item = previousItems[i]
			const key = props.getKey(item, i)
			const entry = newCacheEntry(item, key, props)
			cache.set(key, entry)
			renderedItems.push(entry.element)
		}

		let currentParent: Node | null = null

		// updates
		const subscription = props.items.subscribe({
			next: (time) => {
				// parent might be different from the previous call
				currentParent = startMarker.parentNode
				const nextItems = props.items.get()

				diff(previousItems, nextItems, props.getKey, onNewValue, onDelete, onInsertBefore, time)
				previousItems = nextItems.slice()
			},
		})

		const onNewValue = (key: PropertyKey, previousValue: Item, newValue: Item, time: Time): void => {
			const cached = cache.get(key)
			if (cached) {
				cached.notifier.notify(time, newValue)
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

		const onInsertBefore = (item: Item, key: PropertyKey, beforeKey: PropertyKey): void => {
			let element = cache.get(key)?.element
			if (!element) {
				const entry = newCacheEntry(item, key, props)
				cache.set(key, entry)
				element = entry.element
			}
			currentParent?.insertBefore(element, cache.get(beforeKey)?.element ?? endMarker)
		}

		cleanup(() => {
			cache.clear()
			currentParent = null
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

function newCacheEntry<Item>(item: Item, key: PropertyKey, props: ForProps<Item>): CacheEntry<Item> {
	const itemAtom = newAtom(item)
	const [itemElement, itemContext] = withContext(key, () => renderChild(props.children(itemAtom)))
	const e = emitter.newEmitter()
	let value = item
	return {
		notifier: {
			get: () => value,
			subscribe: e.subscribe,
			notify: (time, newValue) => {
				if (value !== newValue) {
					value = newValue
					e.next(time)
				}
			},
		},
		element: itemElement,
		context: itemContext,
	}
}
