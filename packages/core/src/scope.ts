export interface Scope {
	readonly name?: PropertyKey
	readonly cleanups: Set<() => void>
	readonly children: Set<Scope>
	readonly parent?: Scope
}

const createScope = (name?: PropertyKey, parent?: Scope): Scope => ({
	name,
	cleanups: new Set(),
	children: new Set(),
	parent,
})
const ROOT_SCOPE: Scope = createScope('ROOT')
export let CURRENT_SCOPE: Scope = ROOT_SCOPE

export interface Scoped<Value> extends ReadonlyArray<unknown> {
	readonly 0: Value
	readonly 1: Scope
}

export interface NewScopeFactoryParameters {
	readonly cleanup: (f: () => void) => void
}
export function newScope<Result>(
	factory: (parameters: NewScopeFactoryParameters) => Result,
	name?: PropertyKey,
): Scoped<Result> {
	const currentScope = CURRENT_SCOPE
	const scope = createScope(name, CURRENT_SCOPE)
	currentScope.children.add(scope)
	CURRENT_SCOPE = scope
	const result = factory({ cleanup })
	CURRENT_SCOPE = currentScope
	return [result, scope]
}

export const disposeScope = (scope: Scope): void => {
	for (const child of scope.children.values()) {
		disposeScope(child)
	}
	scope.children.clear()
	for (const cleanup of scope.cleanups.values()) {
		cleanup()
	}
	scope.cleanups.clear()
	scope.parent?.children.delete(scope)
}

const cleanup = (f: () => void): void => {
	CURRENT_SCOPE.cleanups.add(f)
}

export const resetScopes = (): void => disposeScope(ROOT_SCOPE)
