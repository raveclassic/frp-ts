import { atom, Property, Env } from '@frp-ts/core'
import { useState } from 'react'

export const usePropertyFromProps = (env: Env) => {
	const newAtom = atom.newAtom(env)
	return <Value>(value: Value): Property<Value> => {
		const [state] = useState(() => newAtom(value))
		state.set(value)
		return state
	}
}
