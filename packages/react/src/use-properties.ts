import { useMemo } from 'react'
import { property, Property } from '@frp-ts/core'
import { useProperty } from './use-property'

export const useProperties = <Properties extends readonly Property<unknown>[]>(
	...properties: Properties
): property.MapPropertiesToValues<Properties> =>
	useProperty(useMemo(() => property.combine(...properties, (...values) => values), properties))
