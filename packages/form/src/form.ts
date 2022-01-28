import { combine, newAtom, Property } from '@frp-ts/core'
import { HKT, URIS, URIS2 } from './hkt'
import {
	DecodedObjectValue1,
	DecodedObjectValue2,
	DecodedObjectValueHKT,
	DecodedValueHKT,
	Form11,
	Form21,
	FormHKT,
	FormStateHKT,
	FormViewHKT,
	FormViewsHKT,
	SchemaHKT,
	StateItemHKT,
	AnyObjectSchema1,
	AnyObjectSchema2,
	UnknownObjectSchemaHKT,
	Schema11,
	Schema21,
} from './types'
import { mapRecord, objectEntries, objectValues } from '@frp-ts/utils'

export { FormHKT, Form11, Form21, SchemaHKT }

export function makeNewForm<SchemaURI extends URIS2, ValidationURI extends URIS>(
	schemaF: Schema21<SchemaURI, ValidationURI>,
): <Schema extends AnyObjectSchema2<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue2<SchemaURI, Schema>,
) => Form21<SchemaURI, ValidationURI, Schema>
export function makeNewForm<SchemaURI extends URIS, ValidationURI extends URIS>(
	schemaF: Schema11<SchemaURI, ValidationURI>,
): <Schema extends AnyObjectSchema1<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue1<SchemaURI, Schema>,
) => Form11<SchemaURI, ValidationURI, Schema>
export function makeNewForm<SchemaURI, ValidationURI>(
	schemaF: SchemaHKT<SchemaURI, ValidationURI>,
): (
	schema: UnknownObjectSchemaHKT<SchemaURI>,
	initial: Record<string, unknown>,
) => FormHKT<SchemaURI, ValidationURI, UnknownObjectSchemaHKT<SchemaURI>>
export function makeNewForm<SchemaURI, ValidationURI>(
	schemaF: SchemaHKT<SchemaURI, ValidationURI>,
): (
	schema: UnknownObjectSchemaHKT<SchemaURI>,
	initial: Record<string, unknown>,
) => FormHKT<SchemaURI, ValidationURI, UnknownObjectSchemaHKT<SchemaURI>> {
	const buildStateF = buildState(schemaF)
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
				> = schemaF.decodingSuccess({})
				for (const [name, decoded] of objectEntries(mapped)) {
					result = schemaF.chainDecoded(result, (result) =>
						schemaF.mapDecoded(decoded, (decoded) => {
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
		}
	}
}

const buildState =
	<SchemaURI, ValidationURI>(schemaF: SchemaHKT<SchemaURI, ValidationURI>) =>
	(
		schema: UnknownObjectSchemaHKT<SchemaURI>,
		initial: Record<string, unknown>,
	): FormStateHKT<SchemaURI, ValidationURI, UnknownObjectSchemaHKT<SchemaURI>> =>
		mapRecord(schema, (field, name) => {
			const value = initial[name]
			const encoded = schemaF.encode(field, value)
			const decoded = schemaF.decodingSuccess(value)
			return {
				encoded,
				decoded,
				isDirty: false,
			}
		})
