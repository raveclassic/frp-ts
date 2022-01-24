import { objectEntries } from './object'

interface Failure<Error> {
	readonly tag: 'error'
	readonly error: Error
}
interface Success<Value> {
	readonly tag: 'success'
	readonly value: Value
}
export type Result<Error, Value> = Failure<Error> | Success<Value>

export type ResultError<Target> = Target extends Failure<unknown> ? Target['error'] : never
export type ResultValue<Target> = Target extends Success<unknown> ? Target['value'] : never

export const failure = <Error>(error: Error): Result<Error, never> => ({ tag: 'error', error })
export const success = <Value>(value: Value): Result<never, Value> => ({ tag: 'success', value })

export const sequenceS = <Target extends Record<string, Result<unknown, unknown>>>(
	target: Target,
): Result<
	ResultError<Target[keyof Target]>,
	{
		readonly [Key in keyof Target]: ResultValue<Target[Key]>
	}
> => {
	const result: {
		[Key in keyof Target]: ResultValue<Target[Key]>
		// eslint-disable-next-line no-restricted-syntax
	} = {} as never
	for (const [name, entry] of objectEntries(target)) {
		if (entry.tag === 'error') {
			// eslint-disable-next-line no-restricted-syntax
			return entry as never
		}
		// eslint-disable-next-line no-restricted-syntax
		result[name] = entry.value as never
	}
	return success(result)
}
