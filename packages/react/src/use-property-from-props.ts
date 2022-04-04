import { newAtom, Property } from '@frp-ts/core'
import { useLayoutEffect, useState } from 'react'

export const usePropertyFromProps = <Value>(value: Value): Property<Value> => {
	const [atom] = useState(() => newAtom(value))
	useLayoutEffect(() => atom.set(value), [value])
	return atom
}
