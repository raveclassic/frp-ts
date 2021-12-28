import { Lens } from './lensed-atom'
import { Env, clock } from '@frp-ts/core'
import { lensedAtom } from '.'

// eslint-disable-next-line @typescript-eslint/ban-types
const prop = <O extends object, K extends keyof O>(key: K): Lens<O, O[K]> => ({
	get: (s) => s[key],
	set: (a) => (s) => ({ ...s, [key]: a }),
})

const env: Env = {
	clock: clock.newCounterClock(),
}
const newLensedAtom = lensedAtom.newLensedAtom(env)

describe('view', () => {
	it('views', () => {
		const a = newLensedAtom({ foo: 0 })
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
	it('gets', () => {
		const a = newLensedAtom({ foo: 0 })
		const b = a.view(prop('foo'))
		expect(b.get()).toEqual(0)
		a.set({ foo: 1 })
		expect(b.get()).toEqual(1)
	})
	it('sets', () => {
		const a = newLensedAtom({ foo: 0 })
		const b = a.view(prop('foo'))
		b.set(1)
		expect(b.get()).toEqual(1)
		expect(a.get()).toEqual({ foo: 1 })
	})
	it('notifies', () => {
		const a = newLensedAtom({ foo: 0 })
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
	it('composes', () => {
		interface Foo {
			foo: {
				bar: number
			}
		}
		const a = newLensedAtom<Foo>({
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
	it('modifies', () => {
		const a = newLensedAtom({ foo: 0 })
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
