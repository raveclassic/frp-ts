import { Subscription } from '@frp-ts/core'

export interface Context {
	readonly name: string
	readonly cleanups: Set<() => void>
	readonly children: Set<Context>
}

const newContext = (name: string): Context => ({
	name,
	cleanups: new Set(),
	children: new Set(),
})
const ROOT_CONTEXT: Context = newContext('ROOT')
export let CURRENT_CONTEXT: Context = ROOT_CONTEXT

export function withContext<Result>(name: string, f: (newContext: Context) => Result): Result {
	console.group(name)
	const currentContext = CURRENT_CONTEXT
	const context = newContext(name)
	CURRENT_CONTEXT.children.add(context)
	CURRENT_CONTEXT = context
	console.log(CURRENT_CONTEXT)
	const result = f(context)
	CURRENT_CONTEXT = currentContext
	console.groupEnd()
	return result
}

export const disposeContext = (context: Context): void => {
	console.log('disposeContext', context)
	for (const child of context.children.values()) {
		disposeContext(child)
	}
	context.children.clear()
	for (const cleanup of context.cleanups.values()) {
		cleanup()
	}
	context.children.clear()
}
export const cleanup = (f: () => void): void => {
	CURRENT_CONTEXT.cleanups.add(f)
}
