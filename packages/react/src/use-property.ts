import { Property, observable } from '@frp-ts/core'
import { useState, useEffect, useRef, useMemo } from 'react'

export const useProperty = <A>(property: Property<A>): A => {
	const [, forceUpdate] = useState<Record<string, unknown>>()

	const newValue = property.get()
	const valueRef = useRef(newValue)
	valueRef.current = newValue

	const subscriptionRef = useRef(observable.subscriptionNone)
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
			subscriptionRef.current = observable.subscriptionNone
		},
		[],
	)

	return valueRef.current
}
