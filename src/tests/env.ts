import { fromObservable as getFromObservable, scan as getScan, Property } from '../property'
import { Observable1 } from '../observable'
import { map } from 'rxjs/operators'
import { newAtom as getNewProducer } from '../atom'
import { Clock, Env, newCounterClock } from '../clock'
import { Observable } from 'rxjs'
import { Disposable, fromEvent as getFromEvent } from '../emitter'

const TEST_OBSERVABLE_URI = 'frp-ts//TestObservable'
type TEST_OBSERVABLE_URI = typeof TEST_OBSERVABLE_URI
declare module 'fp-ts/lib/HKT' {
	interface URItoKind<A> {
		readonly [TEST_OBSERVABLE_URI]: Observable<A>
	}
}

const defaultEnv: Env = {
	clock: newCounterClock(),
}

export const newProducer = getNewProducer(defaultEnv)

export const testObservable: Observable1<TEST_OBSERVABLE_URI> = {
	URI: TEST_OBSERVABLE_URI,
	map: (fa, f) => fa.pipe(map(f)),
	subscribe: (ma, observer) => ma.subscribe(observer),
}

export const scan = getScan(testObservable)(defaultEnv)

export const fromObservable = getFromObservable(testObservable)(defaultEnv)

export const attachDisposable = <A, S extends Property<A>>(source: S, disposable: Disposable): S => ({
	...source,
	notifier: (l) => {
		const d = source.notifier(l)
		return () => {
			d()
			disposable()
		}
	},
})

export const fromEvent = getFromEvent(defaultEnv)

interface VirtualClock extends Clock {
	readonly next: () => void
}

export const newVirtualClock = (initialTime: number): VirtualClock => {
	let time = initialTime
	return {
		now: () => time,
		next: () => ++time,
	}
}
