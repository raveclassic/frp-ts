import { now } from './clock'

describe('now', () => {
	it('increments time on each count', () => {
		const time = now()
		expect(now()).toBe(time + 1)
		expect(now()).toBe(time + 2)
		expect(now()).toBe(time + 3)
	})
})
