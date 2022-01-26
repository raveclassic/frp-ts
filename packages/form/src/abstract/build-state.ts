import {
	DecodedObjectValue1,
	DecodedObjectValue2,
	FormState11,
	FormState21,
	FormStateHKT,
	Schema11,
	Schema21,
	SchemaHKT,
	UnknownObjectSchema1,
	UnknownObjectSchema2,
	Validation1,
	ValidationHKT,
} from './schema-f'
import { mapRecord } from '@frp-ts/utils'
import { HKT, URIS, URIS2 } from '../hkt'

export function buildState<SchemaURI extends URIS2, ValidationURI extends URIS>(
	schemaF: Schema21<SchemaURI, ValidationURI>,
	validationF: Validation1<ValidationURI>,
): <Schema extends UnknownObjectSchema2<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue2<SchemaURI, Schema>,
) => FormState21<SchemaURI, ValidationURI, Schema>
export function buildState<SchemaURI extends URIS, ValidationURI extends URIS>(
	schemaF: Schema11<SchemaURI, ValidationURI>,
	validationF: Validation1<ValidationURI>,
): <Schema extends UnknownObjectSchema1<SchemaURI>>(
	schema: Schema,
	initial: DecodedObjectValue1<SchemaURI, Schema>,
) => FormState11<SchemaURI, ValidationURI, Schema>
export function buildState<SchemaURI, ValidationURI>(
	schemaF: SchemaHKT<SchemaURI, ValidationURI>,
	validationF: ValidationHKT<ValidationURI>,
): (
	schema: Record<string, HKT<SchemaURI, unknown>>,
	initial: Record<string, unknown>,
) => FormStateHKT<SchemaURI, ValidationURI, Record<string, HKT<SchemaURI, unknown>>>
export function buildState<SchemaURI, ValidationURI>(
	schemaF: SchemaHKT<SchemaURI, ValidationURI>,
	validationF: ValidationHKT<ValidationURI>,
): (
	schema: Record<string, HKT<SchemaURI, unknown>>,
	initial: Record<string, unknown>,
) => FormStateHKT<SchemaURI, ValidationURI, Record<string, HKT<SchemaURI, unknown>>> {
	return (schema, initial) =>
		mapRecord(schema, (field, name) => {
			const value = initial[name]
			const encoded = schemaF.encode(field, value)
			const decoded = validationF.success(value)
			return {
				encoded,
				decoded,
				isDirty: false,
			}
		})
}
