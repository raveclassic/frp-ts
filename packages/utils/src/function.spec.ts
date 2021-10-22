import { constVoid, memo1, memo2, memoMany } from './function'

describe('memo1', () => {
	it('caches until argument is updated', () => {
		const f: (argument: unknown) => void = jest.fn(constVoid)
		const memo = memo1(f)
		memo(123)
		expect(f).toHaveBeenCalledTimes(1)
		memo(123)
		expect(f).toHaveBeenCalledTimes(1)
		memo(456)
		expect(f).toHaveBeenCalledTimes(2)
		memo(456)
		expect(f).toHaveBeenCalledTimes(2)
	})
})

describe('memo2', () => {
	it('caches until one of arguments is updated', () => {
		const f: (argument1: unknown, argument2: unknown) => void = jest.fn(constVoid)
		const memo = memo2(f)
		memo(0, 0)
		expect(f).toHaveBeenCalledTimes(1)
		memo(0, 0)
		expect(f).toHaveBeenCalledTimes(1)
		memo(0, 1)
		expect(f).toHaveBeenCalledTimes(2)
		memo(0, 1)
		expect(f).toHaveBeenCalledTimes(2)
		memo(1, 1)
		expect(f).toHaveBeenCalledTimes(3)
		memo(1, 1)
		expect(f).toHaveBeenCalledTimes(3)
	})
})

describe('constVoid', () => {
	it('always returns undefined', () => {
		expect(constVoid()).toBeUndefined()
	})
})

describe('memoMany', () => {
	it('caches untils one of arguments is updated', () => {
		const f: (...args: readonly unknown[]) => void = jest.fn(constVoid)
		const memo = memoMany(f)
		memo(0, 0)
		expect(f).toHaveBeenCalledTimes(1)
		memo(0, 0)
		expect(f).toHaveBeenCalledTimes(1)
		memo(0, 1)
		expect(f).toHaveBeenCalledTimes(2)
		memo(0, 1)
		expect(f).toHaveBeenCalledTimes(2)
		memo(1, 1)
		expect(f).toHaveBeenCalledTimes(3)
		memo(1, 1)
		expect(f).toHaveBeenCalledTimes(3)
	})
	it('returns cached value immediately for 0 arguments', () => {
		const f = jest.fn(constVoid)
		const memo = memoMany(f)
		memo()
		expect(f).toHaveBeenCalledTimes(1)
		memo()
		expect(f).toHaveBeenCalledTimes(1)
	})
})
