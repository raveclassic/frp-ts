export interface VirtualClock {
	readonly now: () => number
	readonly next: () => void
}

export const newVirtualClock = (initialTime: number): VirtualClock => {
	let time = initialTime
	return {
		now: () => time,
		next: () => ++time,
	}
}
