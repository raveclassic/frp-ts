import { constVoid } from '@frp-ts/utils'
import { never, subscriptionNone } from './observable'

describe('never', () => {
	it('returns subscriptionNever', () => {
		expect(
			never.subscribe({
				next: constVoid,
			}),
		).toBe(subscriptionNone)
	})
})
