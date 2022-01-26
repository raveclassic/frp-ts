import { Either, left, right } from './either'

export type Validation<E, A> = Either<readonly E[], A>

export const failures: <E, A>(errors: readonly E[]) => Validation<E, A> = left
export const success: <E, A>(value: A) => Validation<E, A> = right
