import { newVirtualClock } from './env'

describe('test env', () => {
	describe('virtual clock', () => {
		it('should not increment', () => {
			const c = newVirtualClock(0)
			expect(c.now()).toEqual(0)
			expect(c.now()).toEqual(0)
			expect(c.now()).toEqual(0)
		})
		it('should manually increment', () => {
			const c = newVirtualClock(0)
			expect(c.now()).toEqual(0)
			c.next()
			expect(c.now()).toEqual(1)
		})
		it('should ignore transactions', () => {
			const c = newVirtualClock(0)
			const f = jest.fn()
			c.transaction(f)
			expect(f).toHaveBeenCalledTimes(1)
			expect(c.now()).toEqual(0)
		})
	})
})
