import { HKT, Kind, Kind2, URIS, URIS2 } from './hkt'
import { Atom, Property } from '@frp-ts/core'

export interface SchemaHKT<SchemaURI, ValidationURI> {
	readonly URI: SchemaURI
	readonly encode: <Value>(schema: HKT<SchemaURI, Value>, value: Value) => Value
	readonly decode: <Value>(schema: HKT<SchemaURI, Value>, value: unknown) => HKT<ValidationURI, Value>
}

export interface Schema11<SchemaURI extends URIS, ValidationURI extends URIS> {
	readonly URI: SchemaURI
	readonly encode: <Value>(schema: Kind<SchemaURI, Value>, value: Value) => Value
	readonly decode: <Value>(schema: Kind<SchemaURI, Value>, value: unknown) => Kind<ValidationURI, Value>
}

export interface Schema12<SchemaURI extends URIS, ValidationURI extends URIS2, Failure> {
	readonly URI: SchemaURI
	readonly encode: <Value>(schema: Kind<SchemaURI, Value>, value: Value) => Value
	readonly decode: <Value>(schema: Kind<SchemaURI, Value>, value: unknown) => Kind2<ValidationURI, Failure, Value>
}

export interface Schema21<SchemaURI extends URIS2, ValidationURI extends URIS> {
	readonly URI: SchemaURI
	readonly encode: <Encoded, Decoded>(schema: Kind2<SchemaURI, Encoded, Decoded>, decoded: Decoded) => Encoded
	readonly decode: <Encoded, Decoded>(
		schema: Kind2<SchemaURI, Encoded, Decoded>,
		encoded: Encoded,
	) => Kind<ValidationURI, Decoded>
}

export interface ValidationHKT<ValidationURI> {
	readonly URI: ValidationURI
	readonly success: <Value>(value: Value) => HKT<ValidationURI, Value>
	readonly failure: <Failure>(error: Failure) => HKT<ValidationURI, Failure>
	readonly isSuccess: <Value>(value: HKT<ValidationURI, Value>) => boolean
	readonly map: <A, B>(value: HKT<ValidationURI, A>, f: (a: A) => B) => HKT<ValidationURI, B>
	readonly chain: <A, B>(value: HKT<ValidationURI, A>, f: (a: A) => HKT<ValidationURI, B>) => HKT<ValidationURI, B>
}

export interface Validation1<ValidationURI extends URIS> {
	readonly URI: ValidationURI
	readonly success: <Value>(value: Value) => Kind<ValidationURI, Value>
	readonly failure: <Failure>(error: Failure) => Kind<ValidationURI, Failure>
	readonly isSuccess: <Value>(value: Kind<ValidationURI, Value>) => boolean
	readonly map: <A, B>(value: Kind<ValidationURI, A>, f: (a: A) => B) => Kind<ValidationURI, B>
	readonly chain: <A, B>(value: Kind<ValidationURI, A>, f: (a: A) => Kind<ValidationURI, B>) => Kind<ValidationURI, B>
}

export interface Validation1C<ValidationURI extends URIS, Failure> {
	readonly URI: ValidationURI
	readonly success: <Value>(value: Value) => Kind<ValidationURI, Value>
	readonly failure: (error: Failure) => Kind<ValidationURI, Failure>
	readonly isSuccess: <Value>(value: Kind<ValidationURI, Value>) => boolean
	readonly map: <A, B>(value: Kind<ValidationURI, A>, f: (a: A) => B) => Kind<ValidationURI, B>
	readonly chain: <A, B>(value: Kind<ValidationURI, A>, f: (a: A) => Kind<ValidationURI, B>) => Kind<ValidationURI, B>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySchemaHKT<SchemaURI> = HKT<SchemaURI, any>
export type UnknownSchemaHKT<SchemaURI> = HKT<SchemaURI, unknown>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySchema1<SchemaURI extends URIS> = Kind<SchemaURI, any>
export type UnknownSchema1<SchemaURI extends URIS> = Kind<SchemaURI, unknown>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySchema2<SchemaURI extends URIS2> = Kind2<SchemaURI, any, any>
export type UnknownSchema2<SchemaURI extends URIS2> = Kind2<SchemaURI, unknown, unknown>

export interface AnyObjectSchemaHKT<SchemaURI> {
	readonly [field: string]: AnySchemaHKT<SchemaURI>
}
export interface UnknownObjectSchemaHKT<SchemaURI> {
	readonly [field: string]: UnknownSchemaHKT<SchemaURI>
}
export interface AnyObjectSchema1<SchemaURI extends URIS> {
	readonly [field: string]: AnySchema1<SchemaURI>
}
export interface UnknownObjectSchema1<SchemaURI extends URIS> {
	readonly [field: string]: UnknownSchema1<SchemaURI>
}
export interface AnyObjectSchema2<SchemaURI extends URIS2> {
	readonly [field: string]: AnySchema2<SchemaURI>
}
export interface UnknownObjectSchema2<SchemaURI extends URIS2> {
	readonly [field: string]: UnknownSchema2<SchemaURI>
}

export type DecodedValueHKT<SchemaURI, Schema extends AnySchemaHKT<SchemaURI>> = Schema extends HKT<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type DecodedValue1<SchemaURI extends URIS, Schema extends AnySchema1<SchemaURI>> = Schema extends Kind<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type DecodedValue2<SchemaURI extends URIS2, Schema extends AnySchema2<SchemaURI>> = Schema extends Kind2<
	SchemaURI,
	// `any` is required for type inference from `Kin2<any, any, any>`
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	infer Decoded
>
	? Decoded
	: never

export type EncodedValueHKT<SchemaURI, Schema extends AnySchemaHKT<SchemaURI>> = Schema extends HKT<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type EncodedValue1<SchemaURI extends URIS, Schema extends AnySchema1<SchemaURI>> = Schema extends Kind<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type EncodedValue2<SchemaURI extends URIS2, Schema extends AnySchema2<SchemaURI>> = Schema extends Kind2<
	SchemaURI,
	infer Encoded,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>
	? Encoded
	: never

export type DecodedObjectValueHKT<SchemaURI, Schema extends AnyObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: DecodedValueHKT<SchemaURI, Schema[Field]>
}
export type DecodedObjectValue1<SchemaURI extends URIS, Schema extends AnyObjectSchema1<SchemaURI>> = {
	readonly [Field in keyof Schema]: DecodedValue1<SchemaURI, Schema[Field]>
}
export type DecodedObjectValue2<SchemaURI extends URIS2, Schema extends AnyObjectSchema2<SchemaURI>> = {
	readonly [Field in keyof Schema]: DecodedValue2<SchemaURI, Schema[Field]>
}

export interface FormViewBase<Value> extends Property<Value>, Pick<Atom<unknown>, 'set' | 'modify'> {}

export interface FormViewHKT<ValidationURI, Value> extends FormViewBase<Value> {
	readonly decoded: Property<HKT<ValidationURI, Value>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface FormView11<ValidationURI extends URIS, Value> extends FormViewBase<Value> {
	readonly decoded: Property<Kind<ValidationURI, Value>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface FormView21<ValidationURI extends URIS, Decoded, Encoded> extends FormViewBase<Encoded> {
	readonly decoded: Property<Kind<ValidationURI, Decoded>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export type FormViewsHKT<SchemaURI, ValidationURI, Schema extends AnyObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: FormViewHKT<ValidationURI, DecodedValueHKT<SchemaURI, Schema[Field]>>
}
export type FormViews11<
	SchemaURI extends URIS,
	ValidationURI extends URIS,
	Schema extends AnyObjectSchema1<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: FormView11<ValidationURI, DecodedValue1<SchemaURI, Schema[Field]>>
}
export type FormViews21<
	SchemaURI extends URIS2,
	ValidationURI extends URIS,
	Schema extends AnyObjectSchema2<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: FormView21<
		ValidationURI,
		DecodedValue2<SchemaURI, Schema[Field]>,
		EncodedValue2<SchemaURI, Schema[Field]>
	>
}

export interface FormHKT<SchemaURI, ValidationURI, Schema extends AnyObjectSchemaHKT<SchemaURI>>
	extends Property<HKT<ValidationURI, DecodedObjectValueHKT<SchemaURI, Schema>>> {
	readonly reset: (value?: DecodedObjectValueHKT<SchemaURI, Schema>) => void
	readonly commit: () => void
	readonly views: FormViewsHKT<SchemaURI, ValidationURI, Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface Form11<SchemaURI extends URIS, ValidationURI extends URIS, Schema extends AnyObjectSchema1<SchemaURI>>
	extends Property<Kind<ValidationURI, DecodedObjectValue1<SchemaURI, Schema>>> {
	readonly reset: (value?: DecodedObjectValue1<SchemaURI, Schema>) => void
	readonly commit: () => void
	readonly views: FormViews11<SchemaURI, ValidationURI, Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface Form21<SchemaURI extends URIS2, ValidationURI extends URIS, Schema extends AnyObjectSchema2<SchemaURI>>
	extends Property<Kind<ValidationURI, DecodedObjectValue2<SchemaURI, Schema>>> {
	readonly reset: (value?: DecodedObjectValue2<SchemaURI, Schema>) => void
	readonly commit: () => void
	readonly views: FormViews21<SchemaURI, ValidationURI, Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface StateItemHKT<ValidationURI, Value> {
	readonly encoded: Value
	readonly decoded: HKT<ValidationURI, Value>
	readonly isDirty: boolean
}

export type FormStateHKT<SchemaURI, ValidationURI, Schema extends AnyObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: StateItemHKT<ValidationURI, DecodedValueHKT<SchemaURI, Schema[Field]>>
}
