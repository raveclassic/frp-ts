export interface RemotePending {
	readonly kind: 'RemotePending'
}
export const pending: RemoteData<never, never> = {
	kind: 'RemotePending',
}

export interface RemoteFailure<Error> {
	readonly kind: 'RemoteFailure'
	readonly error: Error
}
export const failure = <Error = never, Value = never>(error: Error): RemoteData<Error, Value> => ({
	kind: 'RemoteFailure',
	error,
})

export interface RemoteSuccess<Value> {
	readonly kind: 'RemoteSuccess'
	readonly value: Value
}
export const success = <Error = never, Value = never>(value: Value): RemoteData<Error, Value> => ({
	kind: 'RemoteSuccess',
	value,
})

export type RemoteData<Error, Value> = RemotePending | RemoteFailure<Error> | RemoteSuccess<Value>

export type RemoteDataError<Target> = Target extends RemoteFailure<infer Error> ? Error : never
export type RemoteDataValue<Target> = Target extends RemoteSuccess<infer Value> ? Value : never

export type MapRemoteDataListToValues<Inputs extends readonly RemoteData<unknown, unknown>[]> = {
	readonly [Index in keyof Inputs]: RemoteDataValue<Inputs[Index]>
}
type MapRemoteDataListToErrors<Inputs extends readonly RemoteData<unknown, unknown>[]> = {
	readonly [Index in keyof Inputs]: RemoteDataError<Inputs[Index]>
}

export function combine<Inputs extends readonly RemoteData<unknown, unknown>[], Result>(
	...args: [...Inputs, (...values: MapRemoteDataListToValues<Inputs>) => Result]
): RemoteData<MapRemoteDataListToErrors<Inputs>[number], Result> {
	// eslint-disable-next-line no-restricted-syntax
	const inputs: Inputs = args.slice(0, args.length - 1) as never

	if (inputs.length === 0) {
		// eslint-disable-next-line no-restricted-syntax
		const project = args[args.length - 1] as () => Result
		return success(project())
	}

	const values: unknown[] = []
	for (const input of inputs) {
		// eslint-disable-next-line no-restricted-syntax
		if (input.kind === 'RemotePending' || input.kind === 'RemoteFailure') return input as never
		values.push(input.value)
	}
	// eslint-disable-next-line no-restricted-syntax
	const project = args[args.length - 1] as (...args: readonly unknown[]) => Result
	return success(project(...values))
}
