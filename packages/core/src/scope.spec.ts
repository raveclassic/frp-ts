import { constVoid } from '@frp-ts/utils'
import { disposeScope, newScope, resetScopes } from './scope'

describe('scope', () => {
	beforeEach(resetScopes)

	describe('newScope', () => {
		it('returns result of factory', () => {
			const [result, scope] = newScope(() => 123)
			expect(result).toBe(123)
		})
		it('nests scopes', () => {
			const [[result, childScope], parentScope] = newScope(() => newScope(() => 123))
			expect(result).toBe(123)
			expect(parentScope.children).toContain(childScope)
			expect(childScope.children.size).toBe(0)
		})
	})

	describe('disposeScope', () => {
		it('disposes nested scopes', () => {
			const [[, childScope], parentScope] = newScope(() => newScope(() => 123))
			const cleanupChild = jest.fn(constVoid)
			const cleanupParent = jest.fn(constVoid)
			childScope.cleanups.add(cleanupChild)
			parentScope.cleanups.add(cleanupParent)
			expect(childScope.cleanups.size).toBe(1)
			expect(parentScope.cleanups.size).toBe(1)
			disposeScope(parentScope)
			expect(cleanupParent).toHaveBeenCalled()
			expect(cleanupChild).toHaveBeenCalled()
			expect(childScope.cleanups.size).toBe(0)
			expect(childScope.children.size).toBe(0)
			expect(parentScope.cleanups.size).toBe(0)
			expect(parentScope.children.size).toBe(0)
		})
	})

	describe('cleanup', () => {
		it('adds cleanup to current scope cleanups', () => {
			const cleanupChild = jest.fn()
			const cleanupParent = jest.fn()
			const [, scope] = newScope(({ cleanup }) => {
				cleanup(cleanupParent)
				return newScope(({ cleanup }) => {
					cleanup(cleanupChild)
				})
			})
			disposeScope(scope)
			expect(cleanupParent).toHaveBeenCalled()
			expect(cleanupChild).toHaveBeenCalled()
		})
	})
})
