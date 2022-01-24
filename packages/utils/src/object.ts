export const objectEntries = <T>(obj: T): readonly (readonly [keyof T, T[keyof T]])[] =>
	// eslint-disable-next-line no-restricted-syntax
	Object.entries(obj) as never

export const objectValues = <Target extends Record<PropertyKey, unknown>>(
	target: Target,
	// eslint-disable-next-line no-restricted-syntax
): readonly Target[keyof Target][] => Object.values(target) as never

export const mapRecord = <Target extends Record<string, unknown>, Result>(
	target: Target,
	f: (value: Target[keyof Target], key: keyof Target) => Result,
): {
	readonly [Key in keyof Target]: Result
} => {
	// eslint-disable-next-line no-restricted-syntax
	const result: Record<keyof Target, Result> = {} as never
	for (const [key, value] of objectEntries(target)) {
		result[key] = f(value, key)
	}
	return result
}
