import { Disposable, fromObservable as getFromObservable, scan as getScan, Source } from '../source'
import { Observable1 } from '../observable'
import { map } from 'rxjs/operators'
import { newProducer as getNewProducer } from '../producer'
import { Env, newCounterClock } from '../clock'
import { Observable } from 'rxjs'

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

export const attachDisposable = <A>(source: Source<A>, disposable: Disposable): Source<A> => ({
	getter: source.getter,
	notifier: (l) => {
		const d = source.notifier(l)
		return () => {
			d()
			disposable()
		}
	},
})
