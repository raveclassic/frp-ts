export function recordKeys<T extends Record<string, unknown>>(obj: T): readonly (keyof T & string)[] {
	// eslint-disable-next-line no-restricted-syntax
	return Object.keys(obj) as never
}

export function mapRecord<Input extends Record<PropertyKey, unknown>, Result>(
	input: Input,
	f: (value: Input[keyof Input], key: keyof Input) => Result,
): { readonly [Key in keyof Input]: Result } {
	// eslint-disable-next-line no-restricted-syntax
	const result: Record<keyof Input, Result> = {} as never
	for (const key of recordKeys(input)) {
		result[key] = f(input[key], key)
	}
	return result
}
