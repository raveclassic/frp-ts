import { newProducer } from './env'

describe('producer', () => {
	it('should store initial value', () => {
		const p = newProducer(0)
		expect(p.get()).toBe(0)
	})
	it('should update value', () => {
		const p = newProducer(0)
		expect(p.get()).toBe(0)
		p.set(1)
		expect(p.get()).toBe(1)
	})
	it('should notify about changes', () => {
		const { set, notifier } = newProducer(0)
		const f = jest.fn()
		const s = notifier(f)
		expect(f).toHaveBeenCalledTimes(0)
		set(1)
		expect(f).toHaveBeenCalledTimes(1)
		s.unsubscribe()
	})
	it('should skip duplicates', () => {
		const { set, notifier } = newProducer(0)
		const f = jest.fn()
		const s = notifier(f)
		expect(f).toHaveBeenCalledTimes(0)
		set(0)
		expect(f).toHaveBeenCalledTimes(0)
		s.unsubscribe()
	})
})
