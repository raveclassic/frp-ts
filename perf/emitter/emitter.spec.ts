import { suite } from '../suite'
import { range } from 'fp-ts/lib/Array'
import { Time } from '../../src/clock'
import { Disposable, Emitter, Listener, newEmitter } from '../../src/emitter'

describe('emitter performance', () => {
	it('creating instance', () => {
		suite((s) =>
			s.add('newEmitterClass', () => newEmitter()).add('newEmitterFactory', () => newEmitterClass()),
		).run()
	})
	it('iterating and calling listeners', () => {
		const listeners = range(0, 500).map((i) => () => i)
		suite((s) =>
			s
				.add('for of', () => {
					for (const listener of listeners) {
						listener()
					}
				})
				.add('for i', () => {
					for (let i = 0, l = listeners.length; i < l; ++i) {
						listeners[i]()
					}
				})
				.add('reversed for i', () => {
					for (let i = listeners.length - 1; i >= 0; --i) {
						listeners[i]()
					}
				}),
		).run()
	})
	it('notifying', () => {
		suite((s) => {
			let classTimer = 0
			let factoryTimer = 0
			const classEmitter = newEmitterClass()
			classEmitter.subscribe(() => 1)
			classEmitter.subscribe(() => 2)
			classEmitter.subscribe(() => 3)
			classEmitter.subscribe(() => 4)
			classEmitter.subscribe(() => 5)
			classEmitter.subscribe(() => 6)
			classEmitter.subscribe(() => 7)
			classEmitter.subscribe(() => 8)
			classEmitter.subscribe(() => 9)
			const factoryEmitter = newEmitter()
			factoryEmitter.subscribe(() => 1)
			factoryEmitter.subscribe(() => 2)
			factoryEmitter.subscribe(() => 3)
			factoryEmitter.subscribe(() => 4)
			factoryEmitter.subscribe(() => 5)
			factoryEmitter.subscribe(() => 6)
			factoryEmitter.subscribe(() => 7)
			factoryEmitter.subscribe(() => 8)
			factoryEmitter.subscribe(() => 9)
			return s
				.add('class', () => {
					classEmitter.notify(++classTimer)
				})
				.add('factory', () => {
					factoryEmitter.notify(++factoryTimer)
				})
		}).run()
	})
})

class EmitterImpl implements Emitter {
	private lastNotifiedTime?: Time
	private readonly listeners = new Set<Listener>()
	private isNotifying = false
	// tracks new listeners added while notifying
	private pendingAdditions: Listener[] = []

	subscribe(listener: Listener): Disposable {
		if (this.isNotifying) {
			this.pendingAdditions.push(listener)
		} else {
			this.listeners.add(listener)
		}
		return () => this.listeners.delete(listener)
	}

	notify(time: Time) {
		if (this.lastNotifiedTime !== time) {
			this.lastNotifiedTime = time
			this.isNotifying = true
			for (const listener of this.listeners) {
				listener(time)
			}
			this.isNotifying = false

			// flush pending additions
			if (this.pendingAdditions.length > 0) {
				for (let i = 0, l = this.pendingAdditions.length; i < l; i++) {
					this.listeners.add(this.pendingAdditions[i])
				}
				this.pendingAdditions = []
			}
		}
	}
}

const newEmitterClass = (): Emitter => new EmitterImpl()
