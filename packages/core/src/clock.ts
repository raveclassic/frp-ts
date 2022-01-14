export type Time = number

let time: Time = -1
export const now = (): Time => ++time
