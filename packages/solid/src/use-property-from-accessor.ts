import { Accessor, observable, onCleanup } from 'solid-js'
import { newAtom, newProperty, Property } from '@frp-ts/core'

export const usePropertyFromAccessor = <A>(accessor: Accessor<A>): Property<A> => {
	const atom = newAtom(accessor())

	const stream = observable(accessor)
	const subscription = stream.subscribe(atom.set)
	onCleanup(() => subscription.unsubscribe())

	return newProperty(atom.get, atom.subscribe)
}
