import { Lens } from './atom'
import { Env, newCounterClock } from './clock'
import { atom } from '.'

const env: Env = {
	clock: newCounterClock(),
}
const newAtom = atom.newAtom(env)

// eslint-disable-next-line @typescript-eslint/ban-types
const prop = <O extends object, K extends keyof O>(key: K): Lens<O, O[K]> => ({
	get: (s) => s[key],
	set: (a) => (s) => ({ ...s, [key]: a }),
})

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
	describe('view', () => {
		it('should view', () => {
			const a = newAtom({ foo: 0 })
			const b = a.view(prop('foo'))
			const o = {
				next: jest.fn(),
			}
			b.subscribe(o)
			expect(b.get()).toEqual(0)
			a.set({ foo: 1 })
			expect(b.get()).toEqual(1)
			expect(o.next).toHaveBeenCalledTimes(1)
			b.set(2)
		})
		it('should get', () => {
			const a = newAtom({ foo: 0 })
			const b = a.view(prop('foo'))
			expect(b.get()).toEqual(0)
			a.set({ foo: 1 })
			expect(b.get()).toEqual(1)
		})
		it('should set', () => {
			const a = newAtom({ foo: 0 })
			const b = a.view(prop('foo'))
			b.set(1)
			expect(b.get()).toEqual(1)
			expect(a.get()).toEqual({ foo: 1 })
		})
		it('should notify', () => {
			const a = newAtom({ foo: 0 })
			const b = a.view(prop('foo'))
			const bo = {
				next: jest.fn(),
			}
			const ao = {
				next: jest.fn(),
			}
			a.subscribe(ao)
			b.subscribe(bo)
			expect(ao.next).toHaveBeenCalledTimes(0)
			expect(bo.next).toHaveBeenCalledTimes(0)
			a.set({ foo: 1 })
			expect(ao.next).toHaveBeenCalledTimes(1)
			expect(bo.next).toHaveBeenCalledTimes(1)
			b.set(2)
			expect(ao.next).toHaveBeenCalledTimes(2)
			expect(bo.next).toHaveBeenCalledTimes(2)
		})
		it('should compose', () => {
			interface Foo {
				foo: {
					bar: number
				}
			}
			const a = newAtom<Foo>({
				foo: {
					bar: 0,
				},
			})
			const b = a.view(prop('foo')).view(prop('bar'))
			const ao = {
				next: jest.fn(),
			}
			const bo = {
				next: jest.fn(),
			}
			a.subscribe(ao)
			b.subscribe(bo)
			expect(ao.next).toHaveBeenCalledTimes(0)
			expect(bo.next).toHaveBeenCalledTimes(0)
			expect(b.get()).toEqual(0)
			a.set({ foo: { bar: 1 } })
			expect(ao.next).toHaveBeenCalledTimes(1)
			expect(bo.next).toHaveBeenCalledTimes(1)
			expect(b.get()).toEqual(1)
			b.set(2)
			expect(ao.next).toHaveBeenCalledTimes(2)
			expect(bo.next).toHaveBeenCalledTimes(2)
			expect(b.get()).toEqual(2)
			expect(a.get()).toEqual({ foo: { bar: 2 } })
		})
		it('should modify', () => {
			const a = newAtom({ foo: 0 })
			const b = a.view(prop('foo'))
			const ao = {
				next: jest.fn(),
			}
			const bo = {
				next: jest.fn(),
			}
			a.subscribe(ao)
			b.subscribe(bo)
			b.modify(
				(n) => n + 1,
				(n) => n * 2,
				(n) => n + 1,
				(n) => n * 2,
			)
			expect(b.get()).toBe(6)
			expect(a.get()).toEqual({ foo: 6 })
			expect(ao.next).toHaveBeenCalledTimes(1)
			expect(bo.next).toHaveBeenCalledTimes(1)
		})
	})
})
