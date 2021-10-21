import { atom, clock, Env } from '@frp-ts/core'
import { Functor1 } from 'fp-ts/lib/Functor'
import { map, Observable } from 'rxjs'

const TEST_OBSERVABLE_URI = 'frp-ts/fp-ts/TestObservable'
type TEST_OBSERVABLE_URI = typeof TEST_OBSERVABLE_URI
declare module 'fp-ts/lib/HKT' {
	interface URItoKind<A> {
		readonly [TEST_OBSERVABLE_URI]: Observable<A>
	}
}

export const testObservable: Functor1<TEST_OBSERVABLE_URI> = {
	URI: TEST_OBSERVABLE_URI,
	map: (fa, f) => fa.pipe(map(f)),
}

const defaultEnv: Env = {
	clock: clock.newCounterClock(),
}

export const newAtom = atom.newAtom(defaultEnv)
