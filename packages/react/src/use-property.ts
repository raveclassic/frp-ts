import { Property } from '@frp-ts/core'
import { useState, useEffect } from 'react'

export const useProperty = <A>(property: Property<A>): A => {
	const [value, setValue] = useState(property.get())
	useEffect(() => {
		const subscription = property.subscribe({
			next: () => setValue(() => property.get()),
		})
		return subscription.unsubscribe
	}, [])
	return value
}
