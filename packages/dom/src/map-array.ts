import { property, Property, Subscription } from '@frp-ts/core'
import { cleanup } from './context'

export const mapArray = <T, U>(
	list: Property<readonly T[]>,
	f: (value: Property<T>, index: Property<number>) => U,
): Property<readonly U[]> => {
	let items: T[] = []
	let mapped: U[] = []
	let subscritions: Subscription[] = []
	let length = 0
	let indexes: ((value: number) => number)[] = []

	cleanup(() => disposeAll(subscritions))

	return property.combine(list, (newItems) => {
		let i: number
		let j: number
		const newLength = newItems.length
		let newIndexes: Map<T, number>
		let temp: U[]
		let tempSubscriptions: Subscription[]
		let tempIndexes: ((value: number) => number)[]
		let start: number
		let end: number
		let newEnd: number
		let item: T

		// fast path for empty arrays
		if (newLength === 0) {
			if (length !== 0) {
				disposeAll(subscritions)
				subscritions = []
				items = []
				mapped = []
				length = 0
				indexes && (indexes = [])
			}
			// fast path for new create
		} else if (length === 0) {
			mapped = new Array(newLength)
			for (j = 0; j < newLength; j++) {
				items[j] = newItems[j]
			}
		}
	}) as any
}

const disposeAll = (subscriptions: Subscription[]) => {
	for (let i = 0, length = subscriptions.length; i < length; i++) subscriptions[i].unsubscribe()
}
