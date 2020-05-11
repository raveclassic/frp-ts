import { suite } from '../suite'
import { constVoid } from 'fp-ts/lib/function'
import { never } from '../../src/property'
import { range } from 'fp-ts/lib/Array'

const r = range(0, 1000)

describe('source', () => {
	it('initialization', () => {
		suite((s) =>
			s
				.add('tuple', () => {
					return r.map(() => [constVoid, never])
				})
				.add('object', () => {
					return r.map(() => ({ getter: constVoid, notifier: never }))
				}),
		).run()
	})
})
