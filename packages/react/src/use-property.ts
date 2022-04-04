import { Property, Subscription } from '@frp-ts/core'
import { useState, useEffect, useRef } from 'react'

export const useProperty = <A>(property: Property<A>): A => {
	const [, forceUpdate] = useState<Record<string, unknown>>()

	const newValue = property.get()
	const valueRef = useRef(newValue)
	valueRef.current = newValue

	const propertyRef = useRef<Property<A>>()
	const subscriptionRef = useRef<Subscription>()

	if (propertyRef.current !== property) {
		propertyRef.current = property
		subscriptionRef.current?.unsubscribe()
		subscriptionRef.current = property.subscribe({
			next: () => {
				const newValue = property.get()
				if (newValue !== valueRef.current) {
					valueRef.current = newValue
					forceUpdate({})
				}
			},
		})
	}

	useEffect(
		() => () => {
			// istanbul ignore else
			if (subscriptionRef.current) {
				subscriptionRef.current.unsubscribe()
			}
			propertyRef.current = undefined
			subscriptionRef.current = undefined
		},
		[],
	)

	return valueRef.current
}
