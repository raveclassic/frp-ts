import { newCounterClock } from './clock'

describe('newCounterClock', () => {
	it('increments time on each count', () => {
		const clock = newCounterClock()
		expect(clock.now()).toBe(0)
		expect(clock.now()).toBe(1)
		expect(clock.now()).toBe(2)
	})
})
