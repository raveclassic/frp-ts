/**
 * Adopted from https://github.com/artalar/reatom/blob/v2/packages/core/src/index.bench.test.ts
 * All credits to @artalar
 */

import { buildFRPTS, measureFRPTSPush } from './utils/frp-ts-utils'
import { buildCellX, measureCellXPush } from './utils/cellx-utils'
import { buildReatom, measureReatomPush } from './utils/reatom-utils'
import { defaultStore } from '@reatom/core'
import { buildMolWireFiber, measureMolWireFiberPush } from './utils/mol-utils'
import { log, printLogs, validateResults } from './utils/test-utils'

function testBuild(iterations: number) {
	let i = 0
	const frptsLog: number[] = []
	let frptsResult: unknown = undefined
	const cellxLog: number[] = []
	let cellxResult: unknown = undefined
	const reatomLog: number[] = []
	let reatomResult: unknown = undefined
	const molWireFiberLog: number[] = []
	let molWireFiberResult: unknown = undefined
	while (i++ < iterations) {
		const frptsStart = performance.now()
		frptsResult = buildFRPTS()
		frptsLog.push(performance.now() - frptsStart)

		const cellxStart = performance.now()
		cellxResult = buildCellX()
		cellxLog.push(performance.now() - cellxStart)

		const reatomStart = performance.now()
		reatomResult = buildReatom()
		reatomLog.push(performance.now() - reatomStart)

		const molWireFiberStart = performance.now()
		molWireFiberResult = buildMolWireFiber()
		molWireFiberLog.push(performance.now() - molWireFiberStart)
	}

	console.log('\nBuild', iterations)
	printLogs({
		'@frp-ts/core': log(frptsLog),
		cellx: log(cellxLog),
		reatom: log(reatomLog),
		$mol_wire_fiber: log(molWireFiberLog),
	})
}

function testPull(iterations: number) {
	let i = 0
	const frptsLog: number[] = []
	const [frptsInput, frptsOutput] = buildFRPTS()
	let frptsResult = 0

	const cellxLog: number[] = []
	const [cellxInput, cellxOutput] = buildCellX()
	let cellxResult = 0

	const reatomLog: number[] = []
	const [reatomInput, reatomOutput] = buildReatom()
	let reatomResult = 0

	const molWireFiberLog: number[] = []
	const [molWireFiberInput, molWireFiberOutput] = buildMolWireFiber()
	let molWireFiberResult = 0

	while (i++ < iterations) {
		const frptsStart = performance.now()
		frptsInput.set(i)
		frptsResult += frptsOutput.get()
		frptsLog.push(performance.now() - frptsStart)

		const cellxStart = performance.now()
		cellxInput(i)
		cellxResult += cellxOutput()
		cellxLog.push(performance.now() - cellxStart)

		const reatomStart = performance.now()
		defaultStore.dispatch(reatomInput.entry(i))
		reatomResult += reatomOutput.getState()
		reatomLog.push(performance.now() - reatomStart)

		const molWireFiberStart = performance.now()
		molWireFiberInput.put(i)
		molWireFiberResult += molWireFiberOutput.sync()
		molWireFiberLog.push(performance.now() - molWireFiberStart)
	}

	console.log('\nPull', iterations)
	validateResults(frptsResult, cellxResult, reatomResult, molWireFiberResult)
	printLogs({
		'@frp-ts/core': log(frptsLog),
		cellx: log(cellxLog),
		reatom: log(reatomLog),
		$mol_wire_fiber: log(molWireFiberLog),
	})
}

async function testPush(iterations: number) {
	const frptsLog: number[] = []
	const [frptsInput, frptsOutput] = buildFRPTS()
	let frptsResult = 0

	const cellxLog: number[] = []
	const [cellxInput, cellxOutput] = buildCellX()
	let cellxResult = 0

	const reatomLog: number[] = []
	const [reatomInput, reatomOutput] = buildReatom()
	let reatomResult = 0

	const molWireFiberLog: number[] = []
	const [molWireFiberInput, molWireFiberOutput] = buildMolWireFiber()
	let molWireFiberResult = 0

	let i = 0
	while (i++ < iterations) {
		const [frptsValue, frptsTime] = await measureFRPTSPush(i, frptsInput, frptsOutput)
		frptsResult += frptsValue
		frptsLog.push(frptsTime)

		const [cellxValue, cellxTime] = await measureCellXPush(i, cellxInput, cellxOutput)
		cellxResult += cellxValue
		cellxLog.push(cellxTime)

		const [reatomValue, reatomTime] = await measureReatomPush(i, reatomInput, reatomOutput)
		reatomResult += reatomValue
		reatomLog.push(reatomTime)

		const [molWireFiberValue, molWireFiberTime] = await measureMolWireFiberPush(
			i,
			molWireFiberInput,
			molWireFiberOutput,
		)
		molWireFiberResult += molWireFiberValue
		molWireFiberLog.push(molWireFiberTime)
	}

	console.log('\nPush', iterations)
	validateResults(frptsResult, cellxResult, reatomResult, molWireFiberResult)
	printLogs({
		'@frp-ts/core': log(frptsLog),
		cellx: log(cellxLog),
		reatom: log(reatomLog),
		$mol_wire_fiber: log(molWireFiberLog),
	})
}

async function run() {
	testBuild(100)
	testBuild(1_000)
	testBuild(10_000)

	testPull(100)
	testPull(1_000)
	testPull(10_000)

	await testPush(100)
	await testPush(1_000)
	await testPush(10_000)
}

void run()
	.then(() => console.log('\nDone'))
	.catch((e) => {
		console.log('\nError')
		console.error(e)
		process.exit(1)
	})
