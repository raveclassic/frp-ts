import { Property } from '@frp-ts/core'
import { useCallback } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'

export const useProperty = <A>(property: Property<A>): A =>
	useSyncExternalStore<A>(
		useCallback(
			(next) => {
				const subscription = property.subscribe({
					next,
				})
				return subscription.unsubscribe
			},
			[property],
		),
		property.get,
		property.get,
	)
