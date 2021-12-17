import { Property } from '@frp-ts/core'
import { useState, useEffect, useRef, useMemo } from 'react'
import { subscriptionNone } from '@frp-ts/core/src/observable'

export const useProperty = <A>(property: Property<A>): A => {
	const [, forceUpdate] = useState<Record<string, unknown>>()

	const newValue = property.get()
	const valueRef = useRef(newValue)
	valueRef.current = newValue

	const subscriptionRef = useRef(subscriptionNone)
	useMemo(() => {
		subscriptionRef.current.unsubscribe()
		subscriptionRef.current = property.subscribe({
			next: () => {
				const newValue = property.get()
				if (newValue !== valueRef.current) {
					valueRef.current = newValue
					forceUpdate({})
				}
			},
		})
	}, [property])

	useEffect(
		() => () => {
			subscriptionRef.current.unsubscribe()
			subscriptionRef.current = subscriptionNone
		},
		[],
	)

	return valueRef.current
}
