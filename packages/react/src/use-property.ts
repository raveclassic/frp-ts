import { Property } from '@frp-ts/core'
import { useState, useEffect, useRef } from 'react'

export const useProperty = <A>(property: Property<A>): A => {
	const [, forceUpdate] = useState<Record<string, unknown>>()

	const newValue = property.get()
	const valueRef = useRef(newValue)
	valueRef.current = newValue

	useEffect(() => {
		const subscription = property.subscribe({
			next: () => {
				const newValue = property.get()
				if (newValue !== valueRef.current) {
					valueRef.current = newValue
					forceUpdate({})
				}
			},
		})

		return subscription.unsubscribe
	}, [property])

	return valueRef.current
}
