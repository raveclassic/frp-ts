import { mapRecord, recordKeys } from './record'

describe('record', () => {
	describe('recordKeys', () => {
		it('returns keys a list of keys', () => {
			expect(recordKeys({ foo: 'foo', bar: 123 })).toEqual(['foo', 'bar'])
		})
	})
	describe('mapObject', () => {
		it('maps values of an object', () => {
			expect(mapRecord({ foo: 1, bar: 2 }, (value) => `${value}`)).toEqual({ foo: '1', bar: '2' })
		})
	})
})
