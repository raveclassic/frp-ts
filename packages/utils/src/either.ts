export interface Left<E> {
	readonly _tag: 'Left'
	readonly left: E
}
export const left = <E = never, A = never>(left: E): Either<E, A> => ({ _tag: 'Left', left })
export const isLeft = <E>(target: Either<E, unknown>): target is Left<E> => target._tag === 'Left'

export interface Right<A> {
	readonly _tag: 'Right'
	readonly right: A
}
export const right = <E = never, A = never>(right: A): Either<E, A> => ({ _tag: 'Right', right })
export const isRight = <A>(target: Either<unknown, A>): target is Right<A> => target._tag === 'Right'

export type Either<E, A> = Left<E> | Right<A>
