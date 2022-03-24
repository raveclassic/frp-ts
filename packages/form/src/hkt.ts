export interface HKT<URI, A> {
	readonly _URI: URI
	readonly _A: A
}
export interface HKT2<URI, E, A> extends HKT<URI, A> {
	readonly _E: E
}
export interface HKT3<URI, R, E, A> extends HKT2<URI, E, A> {
	readonly _R: R
}

const URI_TO_KIND = Symbol('URI_TO_KIND')
const URI_TO_KIND2 = Symbol('URI_TO_KIND2')
const URI_TO_KIND3 = Symbol('URI_TO_KIND3')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface URItoKind<A> {
	readonly [URI_TO_KIND]: never
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface URItoKind2<E, A> {
	readonly [URI_TO_KIND2]: never
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface URItoKind3<R, E, A> {
	readonly [URI_TO_KIND3]: never
}
export type URIS = keyof URItoKind<never>
export type URIS2 = keyof URItoKind2<never, never>
export type URIS3 = keyof URItoKind3<never, never, never>
export type Kind<URI extends URIS, A> = URI extends URIS ? URItoKind<A>[URI] : never
export type Kind2<URI extends URIS2, E, A> = URI extends URIS2 ? URItoKind2<E, A>[URI] : never
export type Kind3<URI extends URIS3, R, E, A> = URI extends URIS3 ? URItoKind3<R, E, A>[URI] : never
