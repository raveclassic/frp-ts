import { constVoid, identity } from '@frp-ts/utils'
import * as I from 'io-ts'
import { NumberFromString } from 'io-ts-types/lib/NumberFromString'
import * as Z from 'zod'
import * as J from 'joi'
import * as R from 'runtypes'
import { Schema11, Schema21 } from './types'
import { either } from 'fp-ts'
import { makeNewForm } from './form'

declare module './hkt' {
	interface URItoKind2<E, A> {
		readonly IOTSSchema: I.Type<A, E>
	}
	interface URItoKind<A> {
		readonly ZODSchema: Z.ZodSchema<A>
		readonly JOISchema: J.Schema<A>
		readonly RuntypesSchema: R.Runtype<A>
		readonly IOTSValidation: I.Validation<A>
		readonly Exception: A
		readonly ZODSafeParseReturnType: Z.SafeParseReturnType<A, A>
		readonly JOIValidationResult: J.ValidationResult<A>
		readonly RuntypesResult: R.Result<A>
		readonly Promise: Promise<A>
		readonly ZODPromiseSafeParseReturnType: Promise<Z.SafeParseReturnType<A, A>>
		readonly CustomEitherSchema: CustomEitherSchema<A>
		readonly CustomEitherSchemaResult: either.Either<Error, A>
	}
}

interface CustomEitherSchema<A> {
	readonly decode: (value: unknown) => either.Either<Error, A>
}

const CustomEitherSchema: Schema11<'CustomEitherSchema', 'CustomEitherSchemaResult'> = {
	URI: 'CustomEitherSchema',
	decode: (schema, value) => schema.decode(value),
	encode: (schema, value) => value,
	decodingSuccess: either.right,
	chainDecoded: either.Monad.chain,
	mapDecoded: either.Monad.map,
}

const ZODSchema: Schema11<'ZODSchema', 'Exception'> = {
	URI: 'ZODSchema',
	encode: (schema, decoded) => decoded,
	decode: (schema, encoded) => schema.parse(encoded),
	decodingSuccess: identity,
	mapDecoded: (value, f) => f(value),
	chainDecoded: (value, f) => f(value),
}

const ZODPromiseSchema: Schema11<'ZODSchema', 'Promise'> = {
	URI: 'ZODSchema',
	encode: (schema, decoded) => decoded,
	decode: (schema, encoded) => schema.parseAsync(encoded),
	decodingSuccess: (value) => Promise.resolve(value),
	mapDecoded: (value, f) => value.then(f),
	chainDecoded: (value, f) => value.then(f),
}

const ZODSafeSchema: Schema11<'ZODSchema', 'ZODSafeParseReturnType'> = {
	URI: 'ZODSchema',
	encode: (schema, decoded) => decoded,
	decode: (schema, encoded) => schema.safeParse(encoded),
	decodingSuccess: (data) => ({ success: true, data }),
	// eslint-disable-next-line no-restricted-syntax
	mapDecoded: (value, f) => (value.success ? { success: true, data: f(value.data) } : (value as never)),
	// eslint-disable-next-line no-restricted-syntax
	chainDecoded: (value, f) => (value.success ? f(value.data) : (value as never)),
}

const ZODPromiseSafeSchema: Schema11<'ZODSchema', 'ZODPromiseSafeParseReturnType'> = {
	URI: 'ZODSchema',
	encode: (schema, decoded) => decoded,
	decode: (schema, encoded) => schema.safeParseAsync(encoded),
	decodingSuccess: (data) => Promise.resolve({ success: true, data }),
	mapDecoded: (value, f) =>
		// eslint-disable-next-line no-restricted-syntax
		value.then((value) => (value.success ? { success: true, data: f(value.data) } : (value as never))),
	// eslint-disable-next-line no-restricted-syntax
	chainDecoded: (value, f) => value.then((value) => (value.success ? f(value.data) : (value as never))),
}
const IOTSSchema: Schema21<'IOTSSchema', 'IOTSValidation'> = {
	URI: 'IOTSSchema',
	encode: (schema, decoded) => schema.encode(decoded),
	decode: (schema, encoded) => schema.decode(encoded),
	chainDecoded: either.Monad.chain,
	mapDecoded: either.Monad.map,
	decodingSuccess: either.Monad.of,
}

const JOISchema: Schema11<'JOISchema', 'JOIValidationResult'> = {
	URI: 'JOISchema',
	encode: (schema, value) => value,
	decode: (schema, value) => schema.validate(value),
	decodingSuccess: (value) => ({ error: undefined, value }),
	mapDecoded: (value, f) => (value.error === undefined ? { error: undefined, value: f(value.value) } : value),
	chainDecoded: (value, f) => (value.error === undefined ? f(value.value) : value),
}

const JOIPromiseSchema: Schema11<'JOISchema', 'Promise'> = {
	URI: 'JOISchema',
	encode: (schema, value) => value,
	decode: (schema, value) => schema.validateAsync(value),
	decodingSuccess: (value) => Promise.resolve(value),
	mapDecoded: (value, f) => value.then(f),
	chainDecoded: (value, f) => value.then(f),
}

const RuntypesSchema: Schema11<'RuntypesSchema', 'Exception'> = {
	URI: 'RuntypesSchema',
	encode: (schema, value) => value,
	decode: (schema, value) => schema.check(value),
	decodingSuccess: identity,
	mapDecoded: (value, f) => f(value),
	chainDecoded: (value, f) => f(value),
}

const RuntypesSafeSchema: Schema11<'RuntypesSchema', 'RuntypesResult'> = {
	URI: 'RuntypesSchema',
	encode: (schema, value) => value,
	decode: (schema, value) => schema.validate(value),
	decodingSuccess: (value) => ({ success: true, value }),
	mapDecoded: (value, f) => (value.success ? { success: true, value: f(value.value) } : value),
	chainDecoded: (value, f) => (value.success ? f(value.value) : value),
}

describe('form', () => {
	const newForm = makeNewForm(IOTSSchema)
	describe('newForm', () => {
		it('initializes form with initial state', () => {
			const form = newForm({ foo: NumberFromString }, { foo: 123 })
			expect(form.get()).toEqual(IOTSSchema.decodingSuccess({ foo: 123 }))
		})
		it('initializes form with all fields isDirty set to false', () => {
			const form = newForm({ foo: NumberFromString }, { foo: 123 })
			for (const entry of Object.values(form.views)) {
				expect(entry.isDirty.get()).toEqual(false)
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
						expect(form.views.foo.decoded.get()).toEqual(IOTSSchema.decodingSuccess(456))
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
						expect(form.get()).toEqual(IOTSSchema.decodingSuccess({ foo: 456 }))
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
						expect(form.views.foo.decoded.get()).toEqual(I.failures([expect.any(Object)]))
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
						expect(form.get()).toEqual(I.failures([expect.any(Object)]))
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
						expect(form.views.foo.decoded.get()).toEqual(IOTSSchema.decodingSuccess(456))
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
						expect(form.get()).toEqual(IOTSSchema.decodingSuccess({ foo: 456 }))
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
						expect(form.views.foo.decoded.get()).toEqual(I.failures([expect.any(Object)]))
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
						expect(form.get()).toEqual(I.failures([expect.any(Object)]))
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
			expect(form.get()).toEqual(IOTSSchema.decodingSuccess({ foo: 123, bar: 123 }))
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
			expect(form.get()).toEqual(I.failures([expect.any(Object)]))
		})
	})
})

describe('zod', () => {
	const newForm = makeNewForm(ZODSchema)
	it('gets', () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		expect(form.get()).toEqual({ foo: 'foo' })
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual('foo')
	})
	it('sets success', () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(form.get()).toEqual({ foo: 'bar' })
		expect(form.views.foo.get()).toEqual('bar')
		expect(form.views.foo.decoded.get()).toEqual('bar')
	})
	it('sets failure', () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		expect(() => form.views.foo.set(123)).toThrow()
		expect(form.get()).toEqual({ foo: 'foo' })
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual('foo')
	})
})

describe('zod promise', () => {
	const newForm = makeNewForm(ZODPromiseSchema)
	it('gets', async () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		expect(await form.get()).toEqual({ foo: 'foo' })
		expect(form.views.foo.get()).toEqual('foo')
		expect(await form.views.foo.decoded.get()).toEqual('foo')
	})
	it('sets success', async () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(await form.get()).toEqual({ foo: 'bar' })
		expect(form.views.foo.get()).toEqual('bar')
		expect(await form.views.foo.decoded.get()).toEqual('bar')
	})
	it('sets failure', async () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		form.views.foo.set(123)
		await expect(form.get()).rejects.toBeTruthy()
		expect(form.views.foo.get()).toEqual(123)
		await expect(form.views.foo.decoded.get()).rejects.toBeTruthy()
	})
})

describe('zod safe', () => {
	const newForm = makeNewForm(ZODSafeSchema)
	it('gets', () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		expect(form.get()).toEqual(ZODSafeSchema.decodingSuccess({ foo: 'foo' }))
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual(ZODSafeSchema.decodingSuccess('foo'))
	})
	it('sets success', () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(form.get()).toEqual(ZODSafeSchema.decodingSuccess({ foo: 'bar' }))
		expect(form.views.foo.get()).toEqual('bar')
		expect(form.views.foo.decoded.get()).toEqual(ZODSafeSchema.decodingSuccess('bar'))
	})
	it('sets failure', () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		form.views.foo.set(123)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		expect(form.get()).toEqual({ success: false, error: expect.any(Object) })
		expect(form.views.foo.get()).toEqual(123)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		expect(form.views.foo.decoded.get()).toEqual({ success: false, error: expect.any(Object) })
	})
})

describe('zod safe promise', () => {
	const newForm = makeNewForm(ZODPromiseSafeSchema)
	it('gets', async () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		expect(await form.get()).toEqual(await ZODPromiseSafeSchema.decodingSuccess({ foo: 'foo' }))
		expect(form.views.foo.get()).toEqual('foo')
		expect(await form.views.foo.decoded.get()).toEqual(await ZODPromiseSafeSchema.decodingSuccess('foo'))
	})
	it('sets success', async () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(await form.get()).toEqual(await ZODPromiseSafeSchema.decodingSuccess({ foo: 'bar' }))
		expect(form.views.foo.get()).toEqual('bar')
		expect(await form.views.foo.decoded.get()).toEqual(await ZODPromiseSafeSchema.decodingSuccess('bar'))
	})
	it('sets failure', async () => {
		const form = newForm({ foo: Z.string() }, { foo: 'foo' })
		form.views.foo.set(123)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		expect(await form.get()).toEqual({ success: false, error: expect.any(Object) })
		expect(form.views.foo.get()).toEqual(123)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		expect(await form.views.foo.decoded.get()).toEqual({ success: false, error: expect.any(Object) })
	})
})

describe('runtypes', () => {
	const newForm = makeNewForm(RuntypesSchema)
	it('gets', () => {
		const form = newForm({ foo: R.String }, { foo: 'foo' })
		expect(form.get()).toEqual({ foo: 'foo' })
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual('foo')
	})
	it('sets success', () => {
		const form = newForm({ foo: R.String }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(form.get()).toEqual({ foo: 'bar' })
		expect(form.views.foo.get()).toEqual('bar')
		expect(form.views.foo.decoded.get()).toEqual('bar')
	})
	it('sets failure', () => {
		const form = newForm({ foo: R.String }, { foo: 'foo' })
		expect(() => form.views.foo.set(123)).toThrow()
		expect(form.get()).toEqual({ foo: 'foo' })
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual('foo')
	})
})

describe('runtypes safe', () => {
	const newForm = makeNewForm(RuntypesSafeSchema)
	it('gets', () => {
		const form = newForm({ foo: R.String }, { foo: 'foo' })
		expect(form.get()).toEqual(RuntypesSafeSchema.decodingSuccess({ foo: 'foo' }))
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual(RuntypesSafeSchema.decodingSuccess('foo'))
	})
	it('sets success', () => {
		const form = newForm({ foo: R.String }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(form.get()).toEqual(RuntypesSafeSchema.decodingSuccess({ foo: 'bar' }))
		expect(form.views.foo.get()).toEqual('bar')
		expect(form.views.foo.decoded.get()).toEqual(RuntypesSafeSchema.decodingSuccess('bar'))
	})
	it('sets failure', () => {
		const form = newForm({ foo: R.String }, { foo: 'foo' })
		form.views.foo.set(123)
		expect(form.get()).toEqual({
			success: false,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			code: expect.any(String),
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			message: expect.any(String),
		})
		expect(form.views.foo.get()).toEqual(123)
		expect(form.views.foo.decoded.get()).toEqual({
			success: false,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			code: expect.any(String),
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			message: expect.any(String),
		})
	})
})

describe('joi', () => {
	const newForm = makeNewForm(JOISchema)
	it('gets', () => {
		const form = newForm({ foo: J.string() }, { foo: 'foo' })
		expect(form.get()).toEqual(JOISchema.decodingSuccess({ foo: 'foo' }))
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual(JOISchema.decodingSuccess('foo'))
	})
	it('sets success', () => {
		const form = newForm({ foo: J.string() }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(form.get()).toEqual(JOISchema.decodingSuccess({ foo: 'bar' }))
		expect(form.views.foo.get()).toEqual('bar')
		expect(form.views.foo.decoded.get()).toEqual(JOISchema.decodingSuccess('bar'))
	})
	it('sets failure', () => {
		const form = newForm({ foo: J.string() }, { foo: 'foo' })
		form.views.foo.set(123)
		expect(form.get()).toMatchObject({
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			error: expect.any(Object),
		})
		expect(form.views.foo.get()).toEqual(123)
		expect(form.views.foo.decoded.get()).toMatchObject({
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			error: expect.any(Object),
		})
	})
})

describe('joi promise', () => {
	const newForm = makeNewForm(JOIPromiseSchema)
	it('gets', async () => {
		const form = newForm({ foo: J.string() }, { foo: 'foo' })
		expect(await form.get()).toEqual(await JOIPromiseSchema.decodingSuccess({ foo: 'foo' }))
		expect(form.views.foo.get()).toEqual('foo')
		expect(await form.views.foo.decoded.get()).toEqual(await JOIPromiseSchema.decodingSuccess('foo'))
	})
	it('sets success', async () => {
		const form = newForm({ foo: J.string() }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(await form.get()).toEqual(await JOIPromiseSchema.decodingSuccess({ foo: 'bar' }))
		expect(form.views.foo.get()).toEqual('bar')
		expect(await form.views.foo.decoded.get()).toEqual(await JOIPromiseSchema.decodingSuccess('bar'))
	})
	it('sets failure', async () => {
		const form = newForm({ foo: J.string() }, { foo: 'foo' })
		form.views.foo.set(123)
		await expect(form.get()).rejects.toMatchObject(expect.any(Object))
		expect(form.views.foo.get()).toEqual(123)
		await expect(form.views.foo.decoded.get()).rejects.toMatchObject(expect.any(Object))
	})
})

describe('custom either', () => {
	const newForm = makeNewForm(CustomEitherSchema)
	const String: CustomEitherSchema<string> = {
		decode: (value) =>
			typeof value === 'string' ? either.right(value) : either.left(new Error('Cannot decode value to string')),
	}
	it('gets', () => {
		const form = newForm({ foo: String }, { foo: 'foo' })
		expect(form.get()).toEqual(CustomEitherSchema.decodingSuccess({ foo: 'foo' }))
		expect(form.views.foo.get()).toEqual('foo')
		expect(form.views.foo.decoded.get()).toEqual(CustomEitherSchema.decodingSuccess('foo'))
	})
	it('sets success', () => {
		const form = newForm({ foo: String }, { foo: 'foo' })
		form.views.foo.set('bar')
		expect(form.get()).toEqual(CustomEitherSchema.decodingSuccess({ foo: 'bar' }))
		expect(form.views.foo.get()).toEqual('bar')
		expect(form.views.foo.decoded.get()).toEqual(CustomEitherSchema.decodingSuccess('bar'))
	})
	it('sets failure', () => {
		const form = newForm({ foo: String }, { foo: 'foo' })
		form.views.foo.set(123)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		expect(form.get()).toEqual(either.left(expect.any(Error)))
		expect(form.views.foo.get()).toEqual(123)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		expect(form.views.foo.decoded.get()).toEqual(either.left(expect.any(Error)))
	})
})
