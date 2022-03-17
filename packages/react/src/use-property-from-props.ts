import { newAtom, Property } from '@frp-ts/core'
import { useEffect, useMemo } from 'react'

export const usePropertyFromProps = <Value>(value: Value): Property<Value> => {
	const atom = useMemo(() => newAtom(value), [])
	useEffect(() => atom.set(value), [value])
	return atom
}
