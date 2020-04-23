export type Time = number

export interface Clock {
	readonly now: () => Time
}

export const newCounterClock = (): Clock => {
	let time = -1
	return {
		now: () => ++time,
	}
}

export interface Env {
	readonly clock: Clock
}
