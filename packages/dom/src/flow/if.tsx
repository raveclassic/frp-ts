import { property, Property } from '@frp-ts/core'
import { PrimitiveElementChild, renderChild } from '../h/h'
import { Context, disposeContext, withContext } from '../context/context'

export interface IfProps {
	readonly value: Property<boolean>
	readonly then: () => PrimitiveElementChild
	readonly else?: () => PrimitiveElementChild
	readonly name?: string
}

export function If(props: IfProps): PrimitiveElementChild {
	const ifContextName = props.name ?? 'If'
	const ifBranchContextName = `${ifContextName}: Branch`
	const [result] = withContext(ifContextName, () => {
		let branchChild: PrimitiveElementChild
		let branchContext: Context | undefined
		const render = () => {
			const [, context] = withContext(ifBranchContextName, () => {
				branchChild = props.value.get() ? props.then() : props.else?.()
			})
			branchContext = context
		}
		render()

		let conditionValue = props.value.get()
		const proxy: Property<PrimitiveElementChild> = property.newProperty(
			() => branchChild,
			(observer) =>
				props.value.subscribe({
					next: (time) => {
						const newConditionValue = props.value.get()
						if (newConditionValue !== conditionValue) {
							conditionValue = newConditionValue
							branchContext && disposeContext(branchContext)
							// we need to call props.then/else again in `ifBranchContextName` context
							render()
							observer.next(time)
						}
					},
				}),
		)

		return renderChild(proxy)
	})
	return result
}
