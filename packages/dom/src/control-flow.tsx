import { PrimitiveElementChild, h } from './h'
import { cleanup, Context, disposeContext, withContext } from './context'
import { property, Property } from '@frp-ts/core'

export interface IfProps {
	readonly value: Property<boolean>
	readonly then: () => PrimitiveElementChild
	readonly else?: () => PrimitiveElementChild
}

export function If(props: IfProps): PrimitiveElementChild {
	return <Bind>{property.combine(props.value, (value) => (value ? props.then() : props.else?.()))}</Bind>
}

export interface BindProps {
	children: Property<PrimitiveElementChild>
}

export function Bind(props: BindProps) {
	let childContext: Context | undefined = undefined

	const result = withContext('Bind Child', (context) => {
		childContext = context
		let shouldDisposeChildContext = false
		return property.combine(props.children, (children) => {
			shouldDisposeChildContext && childContext && disposeContext(childContext)
			shouldDisposeChildContext = true
			return children
		})
	})

	cleanup(() => (childContext = undefined))

	return <>{result}</>
}
