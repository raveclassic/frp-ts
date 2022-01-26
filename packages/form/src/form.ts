import { Atom, combine, newAtom, Property } from '@frp-ts/core'
import { HKT, Kind, URIS, URIS2 } from './hkt'
import {
	DecodedObjectValue1,
	DecodedObjectValue2,
	DecodedObjectValueHKT,
	DecodedValue1,
	DecodedValue2,
	DecodedValueHKT,
	EncodedValue2,
	Schema11,
	Schema21,
	SchemaHKT,
	UnknownObjectSchema1,
	UnknownObjectSchema2,
	UnknownObjectSchemaHKT,
	Validation1,
	Validation1C,
	ValidationHKT,
} from './abstract/schema-f'
import { buildState } from './abstract/build-state'
import { mapRecord, objectEntries, objectValues } from '@frp-ts/utils'

export interface FormViewHKT<ValidationURI, Value> extends Atom<Value> {
	readonly decoded: Property<HKT<ValidationURI, Value>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface FormView11<ValidationURI extends URIS, Value> extends Atom<Value> {
	readonly decoded: Property<Kind<ValidationURI, Value>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface FormView21<ValidationURI extends URIS, Decoded, Encoded> extends Atom<Encoded> {
	readonly decoded: Property<Kind<ValidationURI, Decoded>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export type FormViewsHKT<SchemaURI, ValidationURI, Schema extends UnknownObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: FormViewHKT<ValidationURI, DecodedValueHKT<SchemaURI, Schema[Field]>>
}

export type FormViews11<
	SchemaURI extends URIS,
	ValidationURI extends URIS,
	Schema extends UnknownObjectSchema1<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: FormView11<ValidationURI, DecodedValue1<SchemaURI, Schema[Field]>>
}

export type FormViews21<
	SchemaURI extends URIS2,
	ValidationURI extends URIS,
	Schema extends UnknownObjectSchema2<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: FormView21<
		ValidationURI,
		DecodedValue2<SchemaURI, Schema[Field]>,
		EncodedValue2<SchemaURI, Schema[Field]>
	>
}

export interface FormHKT<SchemaURI, ValidationURI, Schema extends UnknownObjectSchemaHKT<SchemaURI>>
	extends Property<HKT<ValidationURI, DecodedObjectValueHKT<SchemaURI, Schema>>> {
	readonly reset: (value?: DecodedObjectValueHKT<SchemaURI, Schema>) => void
	readonly commit: () => void
	readonly views: FormViewsHKT<SchemaURI, ValidationURI, Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface Form11<
	SchemaURI extends URIS,
	ValidationURI extends URIS,
	Schema extends UnknownObjectSchema1<SchemaURI>,
> extends Property<Kind<ValidationURI, DecodedObjectValue1<SchemaURI, Schema>>> {
	readonly reset: (value?: DecodedObjectValue1<SchemaURI, Schema>) => void
	readonly commit: () => void
	readonly views: FormViews11<SchemaURI, ValidationURI, Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface Form21<
	SchemaURI extends URIS2,
	ValidationURI extends URIS,
	Schema extends UnknownObjectSchema2<SchemaURI>,
> extends Property<Kind<ValidationURI, DecodedObjectValue2<SchemaURI, Schema>>> {
	readonly reset: (value?: DecodedObjectValue2<SchemaURI, Schema>) => void
	readonly commit: () => void
	readonly views: FormViews21<SchemaURI, ValidationURI, Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

interface StateItemHKT<ValidationURI, Value> {
	readonly encoded: Value
	readonly decoded: HKT<ValidationURI, Value>
	readonly isDirty: boolean
}

type FormStateHKT<SchemaURI, ValidationURI, Schema extends UnknownObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: StateItemHKT<ValidationURI, DecodedValueHKT<SchemaURI, Schema[Field]>>
}

export function makeNewForm<SchemaURI extends URIS2, ValidationURI extends URIS, Failure>(
	schemaF: Schema21<SchemaURI, ValidationURI>,
	validationF: Validation1C<ValidationURI, Failure>,
): <Schema extends UnknownObjectSchema2<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue2<SchemaURI, Schema>,
) => Form21<SchemaURI, ValidationURI, Schema>
export function makeNewForm<SchemaURI extends URIS2, ValidationURI extends URIS>(
	schemaF: Schema21<SchemaURI, ValidationURI>,
	validationF: Validation1<ValidationURI>,
): <Schema extends UnknownObjectSchema2<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue2<SchemaURI, Schema>,
) => Form21<SchemaURI, ValidationURI, Schema>
export function makeNewForm<SchemaURI extends URIS, ValidationURI extends URIS, Failure>(
	schemaF: Schema11<SchemaURI, ValidationURI>,
	validationF: Validation1C<ValidationURI, Failure>,
): <Schema extends UnknownObjectSchema1<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue1<SchemaURI, Schema>,
) => Form11<SchemaURI, ValidationURI, Schema>
export function makeNewForm<SchemaURI extends URIS, ValidationURI extends URIS>(
	schemaF: Schema11<SchemaURI, ValidationURI>,
	validationF: Validation1<ValidationURI>,
): <Schema extends UnknownObjectSchema1<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue1<SchemaURI, Schema>,
) => Form11<SchemaURI, ValidationURI, Schema>
export function makeNewForm<SchemaURI, ValidationURI>(
	schemaF: SchemaHKT<SchemaURI, ValidationURI>,
	validationF: ValidationHKT<ValidationURI>,
): (
	schema: Record<string, HKT<SchemaURI, unknown>>,
	initial: Record<string, unknown>,
) => FormHKT<SchemaURI, ValidationURI, Record<string, HKT<SchemaURI, unknown>>>
export function makeNewForm<SchemaURI, ValidationURI>(
	schemaF: SchemaHKT<SchemaURI, ValidationURI>,
	validationF: ValidationHKT<ValidationURI>,
): (
	schema: Record<string, HKT<SchemaURI, unknown>>,
	initial: Record<string, unknown>,
) => FormHKT<SchemaURI, ValidationURI, Record<string, HKT<SchemaURI, unknown>>> {
	const buildStateF = buildState(schemaF, validationF)
	type Schema = Record<string, HKT<SchemaURI, unknown>>
	return (schema, initial) => {
		const initialState = buildStateF(schema, initial)
		const state = newAtom(initialState)
		const reset = (newValue?: DecodedObjectValueHKT<SchemaURI, Schema>): void =>
			state.set(buildStateF(schema, newValue ?? initial))
		const commit = (): void =>
			state.modify((state) =>
				mapRecord(schema, (field, name) => ({
					...state[name],
					isDirty: false,
				})),
			)
		const isDecoded: Property<boolean> = combine(state, (state) => {
			for (const item of objectValues(state)) {
				if (!validationF.isSuccess(item.decoded)) {
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
		const views: FormViewsHKT<SchemaURI, ValidationURI, Schema> = mapRecord(
			schema,
			(fieldSchema, fieldName): FormViewHKT<ValidationURI, unknown> => {
				const item = combine(state, (state) => state[fieldName])
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				const fieldValue: Property<unknown> = combine(item, (item) => item.encoded)
				const lensedSet = (value: unknown) => {
					if (fieldValue.get() !== value) {
						const item: StateItemHKT<ValidationURI, unknown> = {
							encoded: value,
							decoded: schemaF.decode(fieldSchema, value),
							isDirty: true,
						}
						state.set({ ...state.get(), [fieldName]: item })
					}
				}
				const decoded: Property<HKT<ValidationURI, unknown>> = combine(item, (item) => item.decoded)
				const isDirty: Property<boolean> = combine(item, (item) => item.isDirty)
				const isDecoded: Property<boolean> = combine(item, (item) => validationF.isSuccess(item.decoded))
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
			},
		)
		const value: Property<HKT<ValidationURI, DecodedObjectValueHKT<SchemaURI, Schema>>> = combine(
			state,
			(state) => {
				const mapped = mapRecord(state, (item) => item.decoded)
				let result: HKT<
					ValidationURI,
					{
						[Field in keyof Schema]: DecodedValueHKT<SchemaURI, Schema[Field]>
					}
				> = validationF.success({})
				for (const [name, decoded] of objectEntries(mapped)) {
					result = validationF.chain(decoded, (decoded) =>
						validationF.map(result, (result) => {
							result[name] = decoded
							return result
						}),
					)
				}
				return result
			},
		)
		return {
			...value,
			reset,
			commit,
			views,
			isDirty,
			isDecoded,
		}
	}
}
