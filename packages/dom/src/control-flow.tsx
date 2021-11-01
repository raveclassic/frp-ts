import { PrimitiveElementChild, h } from './h'
import { disposeContext, withContext } from './context'
import { property, Property } from '@frp-ts/core'

export interface IfProps {
	readonly value: Property<boolean>
	readonly then: () => PrimitiveElementChild
	readonly else?: () => PrimitiveElementChild
}

export function If(props: IfProps): PrimitiveElementChild {
	return <Bind name={'If'}>{property.combine(props.value, (value) => (value ? props.then() : props.else?.()))}</Bind>
}

export interface BindProps {
	name?: string
	children: Property<PrimitiveElementChild>
}

export function Bind(props: BindProps): PrimitiveElementChild {
	const [result, childContext] = withContext(props.name ?? 'Bind', () => {
		let shouldDisposeChildContext = false
		return property.combine(props.children, (children) => {
			shouldDisposeChildContext && childContext && disposeContext(childContext)
			shouldDisposeChildContext = true
			return children
		})
	})

	return <>{result}</>
}
