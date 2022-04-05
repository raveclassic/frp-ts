import { Property } from '@frp-ts/core'
import { useState, useEffect, useRef } from 'react'

export const useProperty = <A>(property: Property<A>): A => {
	const [, forceUpdate] = useState<unknown>()

	const newValue = property.get()
	const valueRef = useRef(newValue)
	valueRef.current = newValue

	useEffect(() => {
		const checkForUpdates = () => {
			const newValue = property.get()
			if (newValue !== valueRef.current) {
				valueRef.current = newValue
				forceUpdate({})
			}
		}

		const subscription = property.subscribe({ next: checkForUpdates })

		// account for:
		//  - direct synchronuous updates during rendering
		//  - updates in useLayoutEffect
		checkForUpdates()

		return subscription.unsubscribe
	}, [property])

	return valueRef.current
}
