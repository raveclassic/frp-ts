export const diff = <Item>(a: readonly Item[], b: readonly Item[], key: (item: Item, index: number) => PropertyKey) => {
	const aItemKeyToIndex = new Map<PropertyKey, number>()
	const aKeys: PropertyKey[] = []
	const bItemKeyToIndex = new Map<PropertyKey, number>()
	const bKeys: PropertyKey[] = []

	const aLength = a.length
	const bLength = b.length

	for (let aIndex = 0; aIndex < aLength; aIndex++) {
		const aItem = a[aIndex]
		const aKey = key(aItem, aIndex)
		aItemKeyToIndex.set(aKey, aIndex)
		aKeys.push(aKey)
	}

	for (let bIndex = 0; bIndex < bLength; bIndex++) {
		const bItem = b[bIndex]
		const bKey = key(bItem, bIndex)
		bItemKeyToIndex.set(bKey, bIndex)
		bKeys.push(bKey)
	}

	const aIndex = 0
	const bIndex = 0
	while (aIndex < aLength || bIndex < bLength) {
		const aItem = a[aIndex]
		const bItem = b[bIndex]
	}
}
