import { PrimitiveElementChild, renderChild } from '../h/h'
import { disposeContext, withContext } from '../context/context'
import { Property, property } from '@frp-ts/core'

export interface BindProps {
	name?: string
	children: Property<PrimitiveElementChild>
}

export function Bind(props: BindProps): PrimitiveElementChild {
	const [result, childContext] = withContext(props.name ?? 'Bind', () => {
		let shouldDisposeChildContext = false
		const result = property.combine(props.children, (children) => {
			shouldDisposeChildContext && disposeContext(childContext)
			shouldDisposeChildContext = true
			return children
		})

		// call renderChild even with a possible `Property<Node>` because this component tracks child context
		return renderChild(result)
	})

	return result
}
