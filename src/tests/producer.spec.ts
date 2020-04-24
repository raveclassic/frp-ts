import { newProducer } from './env'

describe('producer', () => {
	it('should store initial value', () => {
		const p = newProducer(0)
		expect(p.source.getter()).toBe(0)
	})
	it('should update value', () => {
		const p = newProducer(0)
		expect(p.source.getter()).toBe(0)
		p.next(1)
		expect(p.source.getter()).toBe(1)
	})
	it('should notify about changes', () => {
		const {
			next,
			source: { notifier },
		} = newProducer(0)
		const f = jest.fn()
		const s = notifier(f)
		expect(f).toHaveBeenCalledTimes(0)
		next(1)
		expect(f).toHaveBeenCalledTimes(1)
		s()
	})
	it('should skip duplicates', () => {
		const {
			next,
			source: { notifier },
		} = newProducer(0)
		const f = jest.fn()
		const s = notifier(f)
		expect(f).toHaveBeenCalledTimes(0)
		next(0)
		expect(f).toHaveBeenCalledTimes(0)
		s()
	})
})
