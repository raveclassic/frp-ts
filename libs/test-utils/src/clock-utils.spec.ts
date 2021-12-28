import { newVirtualClock } from './clock-utils'

describe('newVirtualClock', () => {
	describe('now', () => {
		it('does not increment time', () => {
			const clock = newVirtualClock(0)
			expect(clock.now()).toBe(0)
			expect(clock.now()).toBe(0)
			expect(clock.now()).toBe(0)
			expect(clock.now()).toBe(0)
		})
	})
	describe('next', () => {
		it('increments time', () => {
			const clock = newVirtualClock(0)
			expect(clock.now()).toBe(0)
			clock.next()
			expect(clock.now()).toBe(1)
			expect(clock.now()).toBe(1)
			clock.next()
			expect(clock.now()).toBe(2)
			expect(clock.now()).toBe(2)
		})
	})
})
