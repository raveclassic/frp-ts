import { failure, identity, Result, success, objectEntries, mapRecord } from '@frp-ts/utils'

export interface UnknownObjectSchema {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readonly [field: string]: ValueSchema<any, any>
}

export interface ValueSchema<Decoded, Encoded> {
	readonly encode: (value: Decoded) => Encoded
	readonly decode: (value: Encoded) => Result<Error, Decoded>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DecodedValue<Schema extends ValueSchema<any, any>> = Schema extends ValueSchema<infer Decoded, any>
	? Decoded
	: never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EncodedValue<Schema extends ValueSchema<any, any>> = Schema extends ValueSchema<any, infer Encoded>
	? Encoded
	: never

export type DecodedObjectValue<Schema extends UnknownObjectSchema> = {
	readonly [Field in keyof Schema]: DecodedValue<Schema[Field]>
}
export type EncodedObjectValue<Schema extends UnknownObjectSchema> = {
	readonly [Field in keyof Schema]: EncodedValue<Schema[Field]>
}

const identitySchema = {
	encode: identity,
	decode: success,
}

export const stringSchema: ValueSchema<string, string> = identitySchema
export const booleanSchema: ValueSchema<boolean, boolean> = identitySchema
export const numberSchema: ValueSchema<number, number> = identitySchema
export const optionalSchema = <Decoded, Encoded>(
	schema: ValueSchema<Decoded, Encoded>,
): ValueSchema<Decoded | undefined, Encoded | undefined> => ({
	encode: (value) => (value !== undefined ? schema.encode(value) : undefined),
	decode: (value) => (value !== undefined ? schema.decode(value) : success(undefined)),
})

export const numberFromStringSchema: ValueSchema<number, string> = {
	encode: (value) => value.toString(),
	decode: (value) => {
		const decoded = Number(value)
		if (isNaN(decoded)) {
			return failure(new Error(`Cannot parse numeric value from "${value}" input`))
		}
		return success(decoded)
	},
}

export const arraySchema = <Decoded, Encoded>(
	schema: ValueSchema<Decoded, Encoded>,
): ValueSchema<readonly Decoded[], readonly Encoded[]> => {
	return {
		encode: (value) => value.map((item) => schema.encode(item)),
		decode: (value) => {
			const decoded: Decoded[] = []
			for (const item of value) {
				const decodedItem = schema.decode(item)
				if (decodedItem.tag === 'error') {
					return decodedItem
				}
			}
			return success(decoded)
		},
	}
}

export const objectSchema = <Schema extends UnknownObjectSchema>(
	schema: Schema,
): ValueSchema<DecodedObjectValue<Schema>, EncodedObjectValue<Schema>> => {
	return {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		encode: (value) => mapRecord(schema, (fieldSchema, key) => fieldSchema.encode(value[key])),
		decode: (value) => {
			// eslint-disable-next-line no-restricted-syntax
			const decoded: { [Field in keyof Schema]: DecodedValue<Schema[Field]> } = {} as never
			for (const [key, fieldSchema] of objectEntries(schema)) {
				const decodedField = fieldSchema.decode(value[key])
				if (decodedField.tag === 'error') {
					return decodedField
				}
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				decoded[key] = decodedField.value
			}
			return success(decoded)
		},
	}
}

export const recordSchema = <Decoded, Encoded>(
	schema: ValueSchema<Decoded, Encoded>,
): ValueSchema<Record<string, Decoded>, Record<string, Encoded>> => {
	return {
		encode: (value) => mapRecord(value, (item) => schema.encode(item)),
		decode: (value) => {
			// eslint-disable-next-line no-restricted-syntax
			const decoded: Record<string, Decoded> = {} as never
			for (const [key, item] of objectEntries(value)) {
				const decodedItem = schema.decode(item)
				if (decodedItem.tag === 'error') {
					return decodedItem
				}
				decoded[key] = decodedItem.value
			}
			return success(decoded)
		},
	}
}
