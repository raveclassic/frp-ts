import { atom, Atom, clock, Property } from '@frp-ts/core'
import { PrimitiveElementChild, renderChild } from './h'
import { cleanup, withContext } from './context'

export interface ForProps<Item> {
	readonly items: Property<readonly Item[]>
	readonly getKey: (item: Item, index: number) => PropertyKey
	readonly children: (item: Property<Item>) => PrimitiveElementChild
}

interface CacheEntry<Item> {
	element: Node
	atom: Atom<Item>
}
interface Cache<Item> extends Map<PropertyKey, CacheEntry<Item>> {}

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

export function For<Item>(props: ForProps<Item>): DocumentFragment {
	const [result] = withContext('For', () => {
		console.log('rendering For')
		const cache: Cache<Item> = new Map()
		const keys: PropertyKey[] = []

		const start = document.createTextNode('')
		const end = document.createTextNode('')

		// initial run
		const initialItems = props.items.get()
		const renderedItems: Node[] = []
		for (let i = 0; i < initialItems.length; i++) {
			const item = initialItems[i]
			const key = props.getKey(item, i)
			const itemAtom = newAtom(item)
			const itemElement = renderChild(props.children(itemAtom))
			const entry: CacheEntry<Item> = {
				atom: itemAtom,
				element: itemElement,
			}
			keys.push(key)
			cache.set(key, entry)
			renderedItems.push(itemElement)
		}

		// updates
		const subscription = props.items.subscribe({
			next: () => {
				const newItems = props.items.get()
				const newKeys: PropertyKey[] = []
				for (let i = 0; i < newItems.length; i++) {
					const newItem = newItems[i]
					const key = props.getKey(newItem, i)
					newKeys.push(key)
					const cached = cache.get(key)
					if (cached) {
						// update
						cached.atom.set(newItem)
					}
				}
			},
		})

		cleanup(() => {
			console.log('unmounting For')
			subscription.unsubscribe()
		})

		const result = document.createDocumentFragment()
		result.append(start, ...renderedItems, end)
		return result
	})
	return result
}

export function indexKey<Item>(item: Item, index: number): number {
	return index
}
