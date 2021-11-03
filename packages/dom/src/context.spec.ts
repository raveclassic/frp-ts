import { constVoid } from '@frp-ts/utils'
import { cleanup, CURRENT_CONTEXT, disposeContext, withContext } from './context'

describe('context', () => {
	beforeEach(() => disposeContext(CURRENT_CONTEXT))

	describe('withContext', () => {
		it('returns result of factory', () => {
			const [result] = withContext('foo', () => 123)
			expect(result).toBe(123)
		})
		it('nests contexts', () => {
			const [[result, childContext], parentContext] = withContext('parent', () => withContext('child', () => 123))
			expect(result).toBe(123)
			expect(parentContext.children).toContain(childContext)
			expect(childContext.children.size).toBe(0)
		})
	})

	describe('disposeContext', () => {
		it('disposes nested contexts', () => {
			const [[, childContext], parentContext] = withContext('parent', () => withContext('child', () => 123))
			const cleanupChild = jest.fn(constVoid)
			const cleanupParent = jest.fn(constVoid)
			childContext.cleanups.add(cleanupChild)
			parentContext.cleanups.add(cleanupParent)
			expect(childContext.cleanups.size).toBe(1)
			expect(parentContext.cleanups.size).toBe(1)
			disposeContext(parentContext)
			expect(cleanupParent).toHaveBeenCalled()
			expect(cleanupChild).toHaveBeenCalled()
			expect(childContext.cleanups.size).toBe(0)
			expect(childContext.children.size).toBe(0)
			expect(parentContext.cleanups.size).toBe(0)
			expect(parentContext.children.size).toBe(0)
		})
	})

	describe('cleanup', () => {
		it('adds cleanup to current context cleanups', () => {
			const cleanupChild = jest.fn()
			const cleanupParent = jest.fn()
			const [, context] = withContext('parent', () => {
				cleanup(cleanupParent)
				return withContext('child', () => {
					cleanup(cleanupChild)
				})
			})
			disposeContext(context)
			expect(cleanupParent).toHaveBeenCalled()
			expect(cleanupChild).toHaveBeenCalled()
		})
	})
})
