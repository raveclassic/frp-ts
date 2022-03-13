import { disposeScope, Scope, Scoped } from '@frp-ts/core'
import { useEffect, useMemo, useRef } from 'react'

export const useScoped = <Args extends readonly unknown[], Value>(
	factory: (...args: Args) => Scoped<Value>,
	...args: Args
): Value => {
	const scope = useRef<Scope>()
	const result = useMemo(() => {
		if (scope.current) disposeScope(scope.current)
		const scoped = factory(...args)
		scope.current = scoped[1]
		return scoped[0]
	}, [factory, ...args])
	useEffect(
		() => () => {
			if (scope.current) disposeScope(scope.current)
		},
		[],
	)
	return result
}
