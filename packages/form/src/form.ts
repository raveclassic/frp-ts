import { Atom, newAtom, Property, combine } from '@frp-ts/core'
import { DecodedObjectValue, UnknownObjectSchema, DecodedValue, EncodedValue } from './schema'
import { mapRecord, objectValues, Result, sequenceS, success } from '@frp-ts/utils'

export interface FormView<Decoded, Encoded> extends Atom<Encoded> {
	readonly decoded: Property<Result<Error, Decoded>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export type FormViews<Schema extends UnknownObjectSchema> = {
	readonly [Field in keyof Schema]: FormView<DecodedValue<Schema[Field]>, EncodedValue<Schema[Field]>>
}

export interface Form<Schema extends UnknownObjectSchema> extends Property<Result<Error, DecodedObjectValue<Schema>>> {
	readonly reset: (value?: DecodedObjectValue<Schema>) => void
	readonly commit: () => void
	readonly views: FormViews<Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

interface StateItem<Decoded, Encoded> {
	readonly encoded: Encoded
	readonly decoded: Result<Error, Decoded>
	readonly isDirty: boolean
}

type FormState<Schema extends UnknownObjectSchema> = {
	readonly [Field in keyof Schema]: StateItem<DecodedValue<Schema[Field]>, EncodedValue<Schema[Field]>>
}

export const newForm = <Schema extends UnknownObjectSchema>(
	schema: Schema,
	initial: DecodedObjectValue<Schema>,
): Form<Schema> => {
	type FieldSchema = Schema[keyof Schema]
	type Decoded = DecodedValue<FieldSchema>
	type Encoded = EncodedValue<FieldSchema>
	const state: Atom<FormState<Schema>> = newAtom(buildState(schema, initial))
	const reset = (newValue?: DecodedObjectValue<Schema>): void => state.set(buildState(schema, newValue ?? initial))
	const commit = (): void =>
		state.modify((state) =>
			mapRecord(schema, (field, name) => ({
				...state[name],
				isDirty: false,
			})),
		)
	const views: FormViews<Schema> = mapRecord(schema, (fieldSchema, fieldName): FormView<Decoded, Encoded> => {
		const item = combine(state, (state) => state[fieldName])
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		const fieldValue: Property<Encoded> = combine(item, (item) => item.encoded)
		const lensedSet = (value: Encoded) => {
			if (fieldValue.get() !== value) {
				const item: StateItem<Decoded, Encoded> = {
					encoded: value,
					decoded: fieldSchema.decode(value),
					isDirty: true,
				}
				state.set({ ...state.get(), [fieldName]: item })
			}
		}
		const decoded: Property<Result<Error, Decoded>> = combine(item, (item) => item.decoded)
		const isDirty: Property<boolean> = combine(item, (item) => item.isDirty)
		const isDecoded: Property<boolean> = combine(item, (item) => item.decoded.tag === 'success')
		return {
			...fieldValue,
			set: lensedSet,
			modify: (...updates) => {
				let value = fieldValue.get()
				for (const update of updates) {
					value = update(value)
				}
				lensedSet(value)
			},
			isDirty,
			isDecoded,
			decoded,
		}
	})
	const isDecoded: Property<boolean> = combine(state, (state) => {
		for (const item of objectValues(state)) {
			if (item.decoded.tag === 'error') {
				return false
			}
		}
		return true
	})
	const isDirty: Property<boolean> = combine(state, (state) => {
		for (const item of objectValues(state)) {
			if (item.isDirty) {
				return true
			}
		}
		return false
	})
	const value: Property<Result<Error, DecodedObjectValue<Schema>>> = combine(state, (state) =>
		sequenceS(mapRecord(state, (item): Result<Error, Decoded> => item.decoded)),
	)
	return {
		...value,
		views,
		isDirty,
		isDecoded,
		reset,
		commit,
	}
}

const buildState = <Schema extends UnknownObjectSchema>(
	schema: Schema,
	initial: DecodedObjectValue<Schema>,
): FormState<Schema> =>
	mapRecord(schema, (field, name) => {
		const value = initial[name]
		// eslint-disable-next-line no-restricted-syntax
		const encoded = field.encode(value) as EncodedValue<Schema[keyof Schema]>
		const decoded = success(value)
		return {
			encoded,
			decoded,
			isDirty: false,
		}
	})
