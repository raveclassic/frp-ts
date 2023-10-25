import { Property, combine as combineProperty } from '@frp-ts/core'
import { RemoteData, RemoteFailure, RemoteSuccess, combine as combineRemoteData } from '../remote-data/remote-data'

export interface RemoteProperty<Error, Value> extends Property<RemoteData<Error, Value>> {}

export type RemotePropertyValue<Target> = Target extends Property<RemoteSuccess<infer Value>> ? Value : never
export type RemotePropertyError<Target> = Target extends Property<RemoteFailure<infer Error>> ? Error : never

export type MapRemotePropertiesToValues<Inputs extends readonly RemoteProperty<unknown, unknown>[]> = {
	readonly [Index in keyof Inputs]: RemotePropertyValue<Inputs[Index]>
}
export type MapRemotePropertiesToErrors<Inputs extends readonly RemoteProperty<unknown, unknown>[]> = {
	readonly [Index in keyof Inputs]: RemotePropertyError<Inputs[Index]>
}

export function combine<Inputs extends readonly RemoteProperty<unknown, unknown>[], Result>(
	...args: [...Inputs, (...values: MapRemotePropertiesToValues<Inputs>) => Result]
): RemoteProperty<MapRemotePropertiesToErrors<Inputs>[number], Result> {
	// eslint-disable-next-line no-restricted-syntax
	const inputs: Inputs = args.slice(0, args.length - 1) as never
	// eslint-disable-next-line no-restricted-syntax
	const project = args[args.length - 1] as (...values: readonly unknown[]) => Result
	// eslint-disable-next-line no-restricted-syntax
	return combineProperty(...inputs, (...values) => combineRemoteData(...values, project)) as never
}
