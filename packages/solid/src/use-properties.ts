import { Property, PropertyValue } from '@frp-ts/core'
import { Accessor } from 'solid-js'

import { useProperty } from './use-property'

type MapPropertiesToAccessors<Target extends readonly Property<unknown>[]> = {
	readonly [Index in keyof Target]: Accessor<PropertyValue<Target[Index]>>
}

export const useProperties = <Properties extends readonly Property<unknown>[]>(
	...properties: Properties
): MapPropertiesToAccessors<Properties> =>
	// type is guaranteed
	// eslint-disable-next-line no-restricted-syntax
	properties.map((property) => useProperty(property)) as never
