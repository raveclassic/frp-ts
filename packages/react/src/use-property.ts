import { Property } from '@frp-ts/core'
import { useState, useEffect, useRef } from 'react'

const useForceUpdate = () => {
	const [, setTick] = useState(0)
	return useRef(() => {
		setTick((tick) => tick + 1)
	}).current
}

export const useProperty = <A>(property: Property<A>): A => {
	const forceUpdate = useForceUpdate()
	useEffect(() => {
		const subscription = property.subscribe({
			next: forceUpdate,
		})
		return subscription.unsubscribe
	}, [property])
	return property.get()
}
