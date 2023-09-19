import { Property } from '@frp-ts/core'
import { createSignal, onCleanup, Accessor } from 'solid-js'

export const useProperty = <A>(property: Property<A>): Accessor<A> => {
	const [get, set] = createSignal<A>(property.get())

	const subscription = property.subscribe({
		next: () => set(property.get),
	})

	onCleanup(() => subscription.unsubscribe())

	return get
}
