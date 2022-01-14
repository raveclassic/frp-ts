import { newEmitter, mergeMany } from './emitter'
import { Time } from './clock'
import { never } from './observable'
import { constVoid } from '@frp-ts/utils'

describe('Emitter', () => {
	describe('newEmitter', () => {
		it('multicasts', () => {
			const e = newEmitter()
			const f1 = jest.fn()
			const f2 = jest.fn()
			e.subscribe({ next: f1 })
			e.subscribe({ next: f2 })
			e.next(0)
			expect(f1).toHaveBeenCalledWith(0)
			expect(f2).toHaveBeenCalledWith(0)
		})
		it('does not emit if notified within the same tick', () => {
			const e = newEmitter()
			const f = jest.fn()
			e.subscribe({ next: f })
			e.next(0)
			e.next(0)
			e.next(0)
			expect(f).toHaveBeenCalledTimes(1)
		})
		it('removes subscriptions immediately even while notifying', () => {
			const e = newEmitter()
			const f1 = jest.fn()
			const s1 = jest.fn(e.subscribe({ next: f1 }).unsubscribe)
			// now we have child subscriptions, calling set will iterate over them
			// check if it's possible to unsubscribe immediately on notification
			const f2: (time: Time) => void = jest.fn(() => s2())
			const s2 = jest.fn(e.subscribe({ next: f2 }).unsubscribe)
			// add more subscriptions
			const f3 = jest.fn()
			const s3 = jest.fn(e.subscribe({ next: f3 }).unsubscribe)
			// notify!
			e.next(0)
			expect(f1).toHaveBeenCalledTimes(1)
			expect(s1).toHaveBeenCalledTimes(0)
			expect(f2).toHaveBeenCalledTimes(1)
			expect(s2).toHaveBeenCalledTimes(1)
			expect(f3).toHaveBeenCalledTimes(1)
			expect(s3).toHaveBeenCalledTimes(0)
		})
		it('does not notify new subscriptions added immediately while notifying', () => {
			const e = newEmitter()
			const f1 = jest.fn()
			const s1 = jest.fn(e.subscribe({ next: f1 }).unsubscribe)
			// now we have child subscriptions, calling set will iterate over them
			// check if it's possible to add new subscriptions immediately on notification
			const f2 = jest.fn()
			let s2 = constVoid
			const f3: (time: Time) => void = jest.fn(() => {
				s2?.()
				s2 = jest.fn(e.subscribe({ next: f2 }).unsubscribe)
			})
			const s3 = jest.fn(e.subscribe({ next: f3 }).unsubscribe)
			// add some more
			const f4 = jest.fn()
			const s4 = jest.fn(e.subscribe({ next: f4 }).unsubscribe)
			// notify!
			e.next(0)
			expect(f1).toHaveBeenCalledTimes(1)
			expect(s1).toHaveBeenCalledTimes(0)
			expect(f3).toHaveBeenCalledTimes(1)
			expect(s3).toHaveBeenCalledTimes(0)
			expect(f4).toHaveBeenCalledTimes(1)
			expect(s4).toHaveBeenCalledTimes(0)
			// new subscriptions added in the same tick should **NOT** be notified to avoid loops and races
			expect(f2).toHaveBeenCalledTimes(0)
			expect(s2).toHaveBeenCalledTimes(0)
		})
		it('does not notify the same listener twice when subscribed during previous notification', () => {
			const e = newEmitter()
			const o = {
				next: jest.fn(),
			}
			e.subscribe({
				next: () => {
					e.subscribe(o)
					e.subscribe(o)
				},
			})
			e.next(1)
			o.next.mockClear()
			// now o.next is added to the set of listeners
			e.next(2)
			expect(o.next).toHaveBeenCalledTimes(1)
		})
	})
})

describe('mergeMany', () => {
	it('never emits for 0 arguments', () => {
		expect(mergeMany([])).toBe(never)
	})
	it('solves diamond-shape problem', () => {
		const a = newEmitter()
		const b = newEmitter()
		const c = newEmitter()
		const result = mergeMany([a, b, c])
		const cb = jest.fn()
		result.subscribe({
			next: cb,
		})
		// simulate several events on one tick, 1 is the Time
		a.next(1)
		b.next(1)
		c.next(1)
		expect(cb).toBeCalledTimes(1)
	})
})
