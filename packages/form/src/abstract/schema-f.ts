import { HKT, HKT2, HKT3, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from '../hkt'
import { Atom, Property } from '@frp-ts/core'
import { Either } from '@frp-ts/utils'

export interface SchemaHKT<SchemaURI, ValidationURI> {
	readonly URI: SchemaURI
	readonly encode: <Value>(schema: HKT<SchemaURI, Value>, value: Value) => Value
	readonly decode: <Value>(schema: HKT<SchemaURI, Value>, value: Value) => HKT<ValidationURI, Value>
}

export interface Schema11<SchemaURI extends URIS, ValidationURI extends URIS> {
	readonly URI: SchemaURI
	readonly encode: <Value>(schema: Kind<SchemaURI, Value>, value: Value) => Value
	readonly decode: <Value>(schema: Kind<SchemaURI, Value>, value: Value) => Kind<ValidationURI, Value>
}

export interface Schema12<SchemaURI extends URIS, ValidationURI extends URIS2, Failure> {
	readonly URI: SchemaURI
	readonly encode: <Value>(schema: Kind<SchemaURI, Value>, value: Value) => Value
	readonly decode: <Value>(schema: Kind<SchemaURI, Value>, value: Value) => Kind2<ValidationURI, Failure, Value>
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
export type UnknownSchemaHKT<SchemaURI> = HKT<SchemaURI, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnknownSchema1<SchemaURI extends URIS> = Kind<SchemaURI, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UnknownSchema2<SchemaURI extends URIS2> = Kind2<SchemaURI, any, any>

export interface UnknownObjectSchemaHKT<SchemaURI> {
	readonly [field: string]: UnknownSchemaHKT<SchemaURI>
}
export interface UnknownObjectSchema1<SchemaURI extends URIS> {
	readonly [field: string]: UnknownSchema1<SchemaURI>
}
export interface UnknownObjectSchema2<SchemaURI extends URIS2> {
	readonly [field: string]: UnknownSchema2<SchemaURI>
}

export type DecodedValueHKT<SchemaURI, Schema extends UnknownSchemaHKT<SchemaURI>> = Schema extends HKT<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type DecodedValue1<SchemaURI extends URIS, Schema extends UnknownSchema1<SchemaURI>> = Schema extends Kind<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type DecodedValue2<SchemaURI extends URIS2, Schema extends UnknownSchema2<SchemaURI>> = Schema extends Kind2<
	SchemaURI,
	any,
	infer Decoded
>
	? Decoded
	: never

export type EncodedValueHKT<SchemaURI, Schema extends UnknownSchemaHKT<SchemaURI>> = Schema extends HKT<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type EncodedValue1<SchemaURI extends URIS, Schema extends UnknownSchema1<SchemaURI>> = Schema extends Kind<
	SchemaURI,
	infer Value
>
	? Value
	: never
export type EncodedValue2<SchemaURI extends URIS2, Schema extends UnknownSchema2<SchemaURI>> = Schema extends Kind2<
	SchemaURI,
	infer Encoded,
	any
>
	? Encoded
	: never

type EncodedObjectValueHKT<SchemaURI, Schema extends UnknownObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: EncodedValueHKT<SchemaURI, Schema[Field]>
}

export type DecodedObjectValueHKT<SchemaURI, Schema extends UnknownObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: DecodedValueHKT<SchemaURI, Schema[Field]>
}
export type DecodedObjectValue1<SchemaURI extends URIS, Schema extends UnknownObjectSchema1<SchemaURI>> = {
	readonly [Field in keyof Schema]: DecodedValue1<SchemaURI, Schema[Field]>
}
export type DecodedObjectValue2<SchemaURI extends URIS2, Schema extends UnknownObjectSchema2<SchemaURI>> = {
	readonly [Field in keyof Schema]: DecodedValue2<SchemaURI, Schema[Field]>
}

export interface FormViewHKT<ValidationURI, Decoded, Failure, Encoded> extends Atom<Encoded> {
	readonly decoded: Property<HKT2<ValidationURI, Failure, Decoded>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}
export interface FormView<ValidationURI extends URIS2, Failure, Decoded, Encoded> extends Atom<Encoded> {
	readonly decoded: Property<Kind2<ValidationURI, Failure, Decoded>>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export type FormViewsHKT<SchemaURI, ValidationURI, Failure, Schema extends UnknownObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: FormViewHKT<
		ValidationURI,
		Failure,
		DecodedValueHKT<SchemaURI, Schema[Field]>,
		EncodedValueHKT<SchemaURI, Schema[Field]>
	>
}

export interface FormHKT<SchemaURI, ValidationURI, Failure, Schema extends UnknownObjectSchemaHKT<SchemaURI>>
	extends Property<Either<Failure, DecodedObjectValueHKT<SchemaURI, Schema>>> {
	readonly reset: (value?: DecodedObjectValueHKT<SchemaURI, Schema>) => void
	readonly commit: () => void
	readonly views: FormViewsHKT<SchemaURI, ValidationURI, Failure, Schema>
	readonly isDirty: Property<boolean>
	readonly isDecoded: Property<boolean>
}

export interface StateItemHKT<ValidationURI, Decoded, Encoded> {
	readonly encoded: Encoded
	readonly decoded: HKT<ValidationURI, Decoded>
	readonly isDirty: boolean
}
export interface StateItem1<ValidationURI extends URIS, Decoded, Encoded> {
	readonly encoded: Encoded
	readonly decoded: Kind<ValidationURI, Decoded>
	readonly isDirty: boolean
}
export interface StateItem2<ValidationURI extends URIS2, Failure, Decoded, Encoded> {
	readonly encoded: Encoded
	readonly decoded: Kind2<ValidationURI, Failure, Decoded>
	readonly isDirty: boolean
}
export interface StateItem<ValidationURI extends URIS2, Failure, Decoded, Encoded> {
	readonly encoded: Encoded
	readonly decoded: Kind2<ValidationURI, Failure, Decoded>
	readonly isDirty: boolean
}

export type FormStateHKT<SchemaURI, ValidationURI, Schema extends UnknownObjectSchemaHKT<SchemaURI>> = {
	readonly [Field in keyof Schema]: StateItemHKT<
		ValidationURI,
		DecodedValueHKT<SchemaURI, Schema[Field]>,
		EncodedValueHKT<SchemaURI, Schema[Field]>
	>
}

export type FormState11<
	SchemaURI extends URIS,
	ValidationURI extends URIS,
	Schema extends UnknownObjectSchema1<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: StateItem1<
		ValidationURI,
		DecodedValue1<SchemaURI, Schema[Field]>,
		EncodedValue1<SchemaURI, Schema[Field]>
	>
}

export type FormState12<
	SchemaURI extends URIS,
	ValidationURI extends URIS2,
	Failure,
	Schema extends UnknownObjectSchema1<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: StateItem2<
		ValidationURI,
		Failure,
		DecodedValue1<SchemaURI, Schema[Field]>,
		EncodedValue1<SchemaURI, Schema[Field]>
	>
}

export type FormState21<
	SchemaURI extends URIS2,
	ValidationURI extends URIS,
	Schema extends UnknownObjectSchema2<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: StateItem1<
		ValidationURI,
		DecodedValue2<SchemaURI, Schema[Field]>,
		EncodedValue2<SchemaURI, Schema[Field]>
	>
}

export type FormState22<
	SchemaURI extends URIS2,
	ValidationURI extends URIS2,
	Failure,
	Schema extends UnknownObjectSchema2<SchemaURI>,
> = {
	readonly [Field in keyof Schema]: StateItem2<
		ValidationURI,
		Failure,
		DecodedValue2<SchemaURI, Schema[Field]>,
		EncodedValue2<SchemaURI, Schema[Field]>
	>
}
