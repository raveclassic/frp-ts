import { fromObservable as getFromObservable, scan as getScan, Property } from '../property'
import { Subscription } from '../observable'
import { map } from 'rxjs/operators'
import { newAtom as getNewAtom } from '../atom'
import { Clock, Env, newCounterClock } from '../clock'
import { Observable } from 'rxjs'
import { fromEvent as getFromEvent } from '../emitter'
import { Functor1 } from 'fp-ts/lib/Functor'

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

export const newAtom = getNewAtom(defaultEnv)

export const testObservable: Functor1<TEST_OBSERVABLE_URI> = {
	URI: TEST_OBSERVABLE_URI,
	map: (fa, f) => fa.pipe(map(f)),
}

export const scan = getScan(defaultEnv)

export const fromObservable = getFromObservable(defaultEnv)

export const attachSubscription = <A, S extends Property<A>>(source: S, subscription: Subscription): S => ({
	...source,
	subscribe: (l) => {
		const d = source.subscribe(l)
		return {
			unsubscribe: () => {
				d.unsubscribe()
				subscription.unsubscribe()
			},
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
		transaction: (thunk) => thunk(),
	}
}
