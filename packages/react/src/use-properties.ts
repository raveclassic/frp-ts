import { useMemo } from 'react'
import { combine, MapPropertiesToValues, Property } from '@frp-ts/core'
import { useProperty } from './use-property'

export const useProperties = <Properties extends readonly Property<unknown>[]>(
	...properties: Properties
): MapPropertiesToValues<Properties> =>
	useProperty(useMemo(() => combine(...properties, (...values) => values), properties))
