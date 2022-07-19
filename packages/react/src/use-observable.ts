import { Observable } from '@frp-ts/core'
import { useEffect, useState } from 'react'

export function useObservable<Value>(source: Observable<Value>, initial: Value): Value {
	const [state, setState] = useState(() => initial)

	useEffect(() => {
		const subscription = source.subscribe({
			next: (value) => {
				setState(() => value)
			},
		})
		return () => {
			subscription.unsubscribe()
		}
	}, [source])

	return state
}
