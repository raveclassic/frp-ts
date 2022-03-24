import { newAtom, Property } from '@frp-ts/core'
import { useLayoutEffect, useMemo } from 'react'

export const usePropertyFromProps = <Value>(value: Value): Property<Value> => {
	const atom = useMemo(() => newAtom(value), [])
	useLayoutEffect(() => atom.set(value), [value])
	return atom
}
