export type Time = number

export interface Clock {
	readonly now: () => Time
	readonly transaction: (thunk: () => void) => void
}

export const newCounterClock = (): Clock => {
	let time = -1
	let isFrozen = false
	return {
		now: () => {
			if (!isFrozen) {
				time++
			}
			return time
		},
		transaction: (thunk) => {
			isFrozen = true
			thunk()
			isFrozen = false
		},
	}
}

export interface Env {
	readonly clock: Clock
}
