import { newAtom, Property } from '@frp-ts/core'
import { useState } from 'react'

export const usePropertyFromProps = <Value>(value: Value): Property<Value> => {
	const [state] = useState(() => newAtom(value))
	state.set(value)
	return state
}
