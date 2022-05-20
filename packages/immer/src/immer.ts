import { Atom } from '@frp-ts/core'
import { mapRecord } from '@frp-ts/utils'
import immer, { Draft } from 'immer'

interface Recipe<Value> {
	// any is needed due to variance
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(...args: readonly any[]): (draft: Draft<Value>) => void
}

export function produceMany<Input, Recipes extends Record<PropertyKey, Recipe<Input>>>(
	input: Atom<Input>,
	recipes: Recipes,
): {
	readonly [Name in keyof Recipes]: (...args: Parameters<Recipes[Name]>) => void
} {
	return mapRecord(
		recipes,
		(recipe) =>
			(...args) =>
				input.set(immer(input.get(), recipe(...args))),
	)
}
