// import * as I from 'io-ts'
// import * as IT from 'io-ts-types'
// import * as Z from 'zod'
// import * as J from 'joi'
// import * as R from 'runtypes'
// import { Schema11, Schema21, Validation1 } from './schema-f'
// import { either } from 'fp-ts'
// import { buildState } from './build-state'
// import { identity } from '@frp-ts/utils'
//
// describe('build-state', () => {
// 	describe('zod', () => {
// 		const buildStateF = buildState(ZODSchema, Exception)
// 		const state = buildStateF({ foo: Z.string() }, { foo: '' })
// 		state.foo.decoded.toLowerCase()
// 		state.foo.encoded.toLowerCase()
// 	})
// 	describe('zod safe', () => {
// 		const buildStateF = buildState(ZODSafeSchema, ZODSafeParseReturnType)
// 		const state = buildStateF({ foo: Z.string() }, { foo: '' })
// 		if (state.foo.decoded.success) {
// 			state.foo.decoded.data.toLowerCase()
// 		}
// 		state.foo.encoded.toLowerCase()
// 	})
// 	describe('io-ts', () => {
// 		it('builds', () => {
// 			const buildStateF = buildState(IOTSSchema, IOTSValidation)
// 			const state = buildStateF({ foo: IT.NumberFromString }, { foo: 123 })
// 			state.foo.encoded
// 			either.Monad.map(state.foo.decoded, (n) => n)
// 		})
// 	})
// 	describe('joi', () => {
// 		const buildStateF = buildState(JOISchema, JOIValidationResult)
// 		const state = buildStateF({ foo: J.string() }, { foo: '123' })
// 		state.foo.encoded
// 		state.foo.decoded
// 	})
// 	describe('runtypes', () => {
// 		const buildStateF = buildState(RuntypesSchema, RuntypesResult)
// 		const state = buildStateF({ foo: R.String }, { foo: '123' })
// 		state.foo.encoded
// 		state.foo.decoded
// 	})
// })
