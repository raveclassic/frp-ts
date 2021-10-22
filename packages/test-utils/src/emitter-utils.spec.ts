import { attachSubscription } from './emitter-utils'
import { constVoid } from '@frp-ts/utils'

describe('attachSubscription', () => {
	it('subscribes to source on subscrube to result', () => {
		const source = {
			subscribe: jest.fn(() => ({ unsubscribe: constVoid })),
		}
		const result = attachSubscription(source, {
			unsubscribe: constVoid,
		})
		result.subscribe()
		expect(source.subscribe).toHaveBeenCalled()
	})
	it('unsubscribes from source and from additional subscription on unsubscribe to result', () => {
		const unsubscribe = jest.fn(constVoid)
		const source = {
			subscribe: () => ({ unsubscribe }),
		}
		const additional = {
			unsubscribe: jest.fn(constVoid),
		}
		const result = attachSubscription(source, additional)
		const subscription = result.subscribe()
		// unsubscribe
		subscription.unsubscribe()
		expect(unsubscribe).toHaveBeenCalled()
		expect(additional.unsubscribe).toHaveBeenCalled()
	})
})

describe('expectToMulticast', () => {})
