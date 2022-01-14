import { Property, clock, atom } from '@frp-ts/core'
import { useState } from 'react'

export const usePropertyFromProps = <Value>(value: Value, env = clock.DEFAULT_ENV): Property<Value> => {
	const [state] = useState(() => atom.newAtom(value, env))
	state.set(value)
	return state
}
