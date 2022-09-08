import { Observable } from '@frp-ts/core'
import { useRef, useCallback } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

interface Ref<Value> {
	source: Observable<Value>
	value: Value
}

export function useObservable<Value>(source: Observable<Value>, initial: Value): Value {
	const ref = useRef<Ref<Value>>({
		source,
		value: initial,
	})
	if (ref.current.source !== source) {
		ref.current = {
			source,
			value: initial,
		}
	}

	const get = useCallback(() => ref.current.value, [])
	const subscribe = useCallback(
		(next: () => void) => {
			const subscription = source.subscribe({
				next: (value) => {
					ref.current.value = value
					next()
				},
			})

			return subscription.unsubscribe
		},
		[source],
	)

	return useSyncExternalStore(subscribe, get)
}
