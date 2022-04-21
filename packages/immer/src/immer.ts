import { Atom } from '@frp-ts/core'
import { mapRecord } from '@frp-ts/utils'
import immer, { Draft } from 'immer'

interface Recipe<Value> {
	(...args: readonly unknown[]): (draft: Draft<Value>) => void
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
