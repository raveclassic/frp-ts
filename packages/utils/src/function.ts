export const memo2 = <A, B, C>(f: (a: A, b: B) => C): ((a: A, b: B) => C) => {
	let hasValue = false
	let lastA: A
	let lastB: B
	let lastC: C
	return (a, b) => {
		if (!hasValue || a !== lastA || b !== lastB) {
			hasValue = true
			lastA = a
			lastB = b
			lastC = f(a, b)
		}
		return lastC
	}
}

export const memo1 = <A, B>(f: (a: A) => B): ((a: A) => B) => {
	let hasValue = false
	let lastA: A
	let lastB: B
	return (a) => {
		if (!hasValue || a !== lastA) {
			hasValue = true
			lastA = a
			lastB = f(a)
		}
		return lastB
	}
}

export const memoMany = <Args extends readonly unknown[], Result>(
	f: (...args: Args) => Result,
): ((...args: Args) => Result) => {
	let hasValue = false
	let cachedResult: Result
	let cachedArgs: Args
	const update = (args: Args): void => {
		cachedResult = f(...args)
		hasValue = true
		cachedArgs = args
	}
	return (...args: Args): Result => {
		const length = args.length
		if (hasValue && length === 0) {
			return cachedResult
		}
		if (!hasValue || cachedArgs.length !== length) {
			update(args)
			return cachedResult
		}
		for (let i = 0; i < length; i++) {
			if (cachedArgs[i] !== args[i]) {
				update(args)
				return cachedResult
			}
		}
		return cachedResult
	}
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const constVoid = (): void => {}
