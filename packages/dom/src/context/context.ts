export interface Context {
	readonly name: PropertyKey
	readonly cleanups: Set<() => void>
	readonly children: Set<Context>
	readonly parent?: Context
}

const newContext = (name: PropertyKey, parent?: Context): Context => ({
	name,
	cleanups: new Set(),
	children: new Set(),
	parent,
})
const ROOT_CONTEXT: Context = newContext('ROOT')
export let CURRENT_CONTEXT: Context = ROOT_CONTEXT

export function withContext<Result>(name: PropertyKey, factory: () => Result): [Result, Context] {
	const currentContext = CURRENT_CONTEXT
	const context = newContext(name, CURRENT_CONTEXT)
	currentContext.children.add(context)
	CURRENT_CONTEXT = context
	const result = factory()
	CURRENT_CONTEXT = currentContext
	return [result, context]
}

export const disposeContext = (context: Context): void => {
	for (const child of context.children.values()) {
		disposeContext(child)
	}
	context.children.clear()
	for (const cleanup of context.cleanups.values()) {
		cleanup()
	}
	context.cleanups.clear()
	context.parent?.children.delete(context)
}

export const cleanup = (f: () => void): void => {
	CURRENT_CONTEXT.cleanups.add(f)
}
