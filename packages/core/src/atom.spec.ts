import { Env, newCounterClock } from './clock'
import { atom } from '.'

const env: Env = {
	clock: newCounterClock(),
}
const newAtom = atom.newAtom(env)

describe('atom', () => {
	it('should store initial value', () => {
		const p = newAtom(0)
		expect(p.get()).toBe(0)
	})
	it('should update value', () => {
		const p = newAtom(0)
		expect(p.get()).toBe(0)
		p.set(1)
		expect(p.get()).toBe(1)
	})
	it('should notify about changes', () => {
		const { set, subscribe } = newAtom(0)
		const f = jest.fn()
		const s = subscribe({ next: f })
		expect(f).toHaveBeenCalledTimes(0)
		set(1)
		expect(f).toHaveBeenCalledTimes(1)
		s.unsubscribe()
	})
	it('should skip duplicates', () => {
		const { set, subscribe } = newAtom(0)
		const f = jest.fn()
		const s = subscribe({ next: f })
		expect(f).toHaveBeenCalledTimes(0)
		set(0)
		expect(f).toHaveBeenCalledTimes(0)
		s.unsubscribe()
	})
	describe('modify', () => {
		it('should apply updates in batch', () => {
			const a = newAtom(0)
			const o = {
				next: jest.fn(),
			}
			a.subscribe(o)
			a.modify(
				(a) => a + 1,
				(a) => a * 2,
				(a) => a + 1,
				(a) => a * 2,
			)
			expect(a.get()).toBe(6)
			expect(o.next).toHaveBeenCalledTimes(1)
		})
	})
})
