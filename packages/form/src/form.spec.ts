import { constVoid, identity } from '@frp-ts/utils'
import * as I from 'io-ts'
import { NumberFromString } from 'io-ts-types/lib/NumberFromString'
import * as Z from 'zod'
import * as J from 'joi'
import * as R from 'runtypes'
import { Schema11, Schema21, Validation1C } from './types'
import { either } from 'fp-ts'
import { makeNewForm } from './form'
import { ValidationError } from 'joi'
import { Failure } from 'runtypes/lib/result'

declare module './hkt' {
	interface URItoKind2<E, A> {
		readonly IOTSSchema: I.Type<A, E>
	}
	interface URItoKind<A> {
		readonly ZODSchema: Z.ZodSchema<A>
		readonly JOISchema: J.Schema<A>
		readonly RuntypesSchema: R.Runtype<A>
		readonly IOTSValidation: I.Validation<A>
		readonly Identity: A
		readonly ZODSafeParseReturnType: Z.SafeParseReturnType<A, A>
		readonly JOIValidationResult: J.ValidationResult<A>
		readonly RuntypesResult: R.Result<A>
	}
}

const ZODSchema: Schema11<'ZODSchema', 'Identity'> = {
	URI: 'ZODSchema',
	encode: (schema, decoded) => decoded,
	decode: (schema, encoded) => schema.parse(encoded),
}

const ZODSafeSchema: Schema11<'ZODSchema', 'ZODSafeParseReturnType'> = {
	URI: 'ZODSchema',
	encode: (schema, decoded) => decoded,
	decode: (schema, encoded) => schema.safeParse(encoded),
}

const IOTSSchema: Schema21<'IOTSSchema', 'IOTSValidation'> = {
	URI: 'IOTSSchema',
	encode: (schema, decoded) => schema.encode(decoded),
	decode: (schema, encoded) => schema.decode(encoded),
}

const JOISchema: Schema11<'JOISchema', 'JOIValidationResult'> = {
	URI: 'JOISchema',
	encode: (schema, value) => value,
	decode: (schema, value) => schema.validate(value),
}

const RuntypesSchema: Schema11<'RuntypesSchema', 'RuntypesResult'> = {
	URI: 'RuntypesSchema',
	encode: (schema, value) => value,
	decode: (schema, value) => schema.validate(value),
}

const IdentityValidation: Validation1C<'Identity', never> = {
	URI: 'Identity',
	success: identity,
	failure: identity,
	isSuccess: () => true,
	map: (value, f) => f(value),
	chain: (value, f) => f(value),
}

const ZODSafeParseReturnType: Validation1C<'ZODSafeParseReturnType', Z.ZodError> = {
	URI: 'ZODSafeParseReturnType',
	success: (data) => ({ success: true, data }),
	failure: (error) => ({ success: false, error }),
	// eslint-disable-next-line no-restricted-syntax
	map: (value, f) => (value.success ? { success: true, data: f(value.data) } : (value as never)),
	isSuccess: (value) => value.success,
	// eslint-disable-next-line no-restricted-syntax
	chain: (value, f) => (value.success ? f(value.data) : (value as never)),
}

const IOTSValidation: Validation1C<'IOTSValidation', I.Errors> = {
	...either.Monad,
	success: either.Monad.of,
	failure: either.left,
	URI: 'IOTSValidation',
	isSuccess: either.isRight,
}

const JOIValidationResult: Validation1C<'JOIValidationResult', ValidationError> = {
	URI: 'JOIValidationResult',
	success: (value) => ({ error: undefined, value }),
	failure: (error) => ({ error, value: undefined }),
	isSuccess: (value) => value.error !== undefined,
	map: <A, B>(value: J.ValidationResult<A>, f: (a: A) => B): J.ValidationResult<B> =>
		value.error !== undefined
			? {
					error: undefined,
					value: f(value.value as never),
			  }
			: (value as never),
	chain: (value, f) => (value.error !== undefined ? f(value.value as never) : (value as never)),
}

const RuntypesResult: Validation1C<'RuntypesResult', Failure> = {
	URI: 'RuntypesResult',
	success: (value) => ({ success: true, value }),
	failure: () => ({ success: false, code: 'VALUE_INCORRECT', message: '' }),
	isSuccess: (value) => value.success,
	map: (value, f) => (value.success ? { success: true, value: f(value.value) } : value),
	chain: (value, f) => (value.success ? f(value.value) : value),
}

describe('form', () => {
	const newForm = makeNewForm(IOTSSchema, IOTSValidation)
	describe('newForm', () => {
		it('initializes form with initial state', () => {
			const form = newForm({ foo: NumberFromString }, { foo: 123 })
			expect(form.get()).toEqual(IOTSValidation.success({ foo: 123 }))
		})
		it('initializes form with all fields isDirty set to false', () => {
			const form = newForm({ foo: NumberFromString }, { foo: 123 })
			for (const entry of Object.values(form.views)) {
				expect(entry.isDirty.get()).toEqual(false)
			}
		})
		it('initializes form with all fields isDecoded set to true', () => {
			const form = newForm({ foo: NumberFromString }, { foo: 123 })
			for (const entry of Object.values(form.views)) {
				expect(entry.isDecoded.get()).toEqual(true)
			}
		})
		it('does not decode on initialization', () => {
			const decode = jest.spyOn(NumberFromString, 'decode')
			newForm({ foo: NumberFromString }, { foo: 123 })
			expect(decode).not.toHaveBeenCalled()
		})
	})
	describe('views', () => {
		describe('get', () => {
			it('encodes with schema', () => {
				const form = newForm({ foo: NumberFromString }, { foo: 123 })
				expect(form.views.foo.get()).toBe('123')
			})
		})
		describe('set', () => {
			describe('success', () => {
				describe('local', () => {
					it('updates encoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.subscribe({ next: cb })
						form.views.foo.set('456')
						expect(form.views.foo.get()).toBe('456')
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('456')
						expect(form.views.foo.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates decoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('456')
						expect(form.views.foo.decoded.get()).toEqual(IOTSValidation.success(456))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('456')
						expect(form.views.foo.isDecoded.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
				describe('form', () => {
					it('updates value', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('456')
						expect(form.get()).toEqual(IOTSValidation.success({ foo: 456 }))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('udpates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('456')
						expect(form.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('456')
						expect(form.isDecoded.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
			})
			describe('failure', () => {
				describe('local', () => {
					it('updates encoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.subscribe({ next: cb })
						form.views.foo.set('a')
						expect(form.views.foo.get()).toBe('a')
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('a')
						expect(form.views.foo.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates decoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('a')
						expect(form.views.foo.decoded.get()).toEqual(IOTSValidation.failure([expect.any(Object)]))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('a')
						expect(form.views.foo.isDecoded.get()).toEqual(false)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
				describe('form', () => {
					it('updates value', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('a')
						expect(form.get()).toEqual(IOTSValidation.failure([expect.any(Object)]))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('udpates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('a')
						expect(form.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.set('a')
						expect(form.isDecoded.get()).toEqual(false)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.set('a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
			})
		})
		describe('modify', () => {
			describe('success', () => {
				describe('local', () => {
					it('updates encoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.subscribe({ next: cb })
						form.views.foo.modify(() => '456')
						expect(form.views.foo.get()).toBe('456')
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => '456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => '456')
						expect(form.views.foo.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => '456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates decoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => '456')
						expect(form.views.foo.decoded.get()).toEqual(IOTSValidation.success(456))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => '456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => '456')
						expect(form.views.foo.isDecoded.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => '456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
				describe('form', () => {
					it('updates value', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => '456')
						expect(form.get()).toEqual(IOTSValidation.success({ foo: 456 }))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => '456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('udpates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => '456')
						expect(form.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => '456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => '456')
						expect(form.isDecoded.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => '456')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
			})
			describe('failure', () => {
				describe('local', () => {
					it('updates encoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.subscribe({ next: cb })
						form.views.foo.modify(() => 'a')
						expect(form.views.foo.get()).toBe('a')
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => 'a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => 'a')
						expect(form.views.foo.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => 'a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates decoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => 'a')
						expect(form.views.foo.decoded.get()).toEqual(IOTSValidation.failure([expect.any(Object)]))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => 'a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => 'a')
						expect(form.views.foo.isDecoded.get()).toEqual(false)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => 'a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
				describe('form', () => {
					it('updates value', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => 'a')
						expect(form.get()).toEqual(IOTSValidation.failure([expect.any(Object)]))
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => 'a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('udpates isDirty', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => 'a')
						expect(form.isDirty.get()).toEqual(true)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => 'a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
					it('updates isDecoded', () => {
						const form = newForm({ foo: NumberFromString }, { foo: 123 })
						const cb = jest.fn(constVoid)
						form.views.foo.isDirty.subscribe({ next: cb })
						form.views.foo.modify(() => 'a')
						expect(form.isDecoded.get()).toEqual(false)
						expect(cb).toHaveBeenCalledTimes(1)
						cb.mockClear()
						form.views.foo.modify(() => 'a')
						expect(cb).toHaveBeenCalledTimes(0)
					})
				})
			})
		})
	})
	describe('get', () => {
		it('sequences successful views', () => {
			const form = newForm(
				{
					foo: NumberFromString,
					bar: NumberFromString,
				},
				{ foo: 0, bar: 0 },
			)
			form.views.foo.set('123')
			form.views.bar.set('123')
			expect(form.get()).toEqual(IOTSValidation.success({ foo: 123, bar: 123 }))
		})
		it('sequences failed views', () => {
			const form = newForm(
				{
					foo: NumberFromString,
					bar: NumberFromString,
				},
				{ foo: 0, bar: 0 },
			)
			form.views.foo.set('a')
			form.views.bar.set('a')
			expect(form.get()).toEqual(IOTSValidation.failure([expect.any(Object)]))
		})
	})
})

describe('zod + exception', () => {
	const newForm = makeNewForm(ZODSchema, IdentityValidation)
	it('encodes', () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		expect(form.get()).toEqual({ foo: 'foo' })
		form.views.foo.set(123)
		expect(form.get()).toEqual({ foo: '123' })
	})
})
