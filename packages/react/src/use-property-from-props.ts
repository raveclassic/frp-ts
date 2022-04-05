import { newAtom, Property } from '@frp-ts/core'
import { useEffect, useState } from 'react'

export const usePropertyFromProps = <Value>(value: Value): Property<Value> => {
	const [atom] = useState(() => newAtom(value))
	useEffect(() => atom.set(value), [value])
	return atom
}
