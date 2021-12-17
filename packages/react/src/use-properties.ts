import { useMemo } from 'react'
import { property, Property } from '@frp-ts/core'
import { useProperty } from './use-property'

export const useProperties = <Properties extends readonly Property<unknown>[]>(
	...properties: readonly [...Properties]
): property.MapPropertiesToValues<Properties> => {
	const value$ = useMemo(() => property.combine(...properties, (...values) => values), properties)

	return useProperty(value$)
}
