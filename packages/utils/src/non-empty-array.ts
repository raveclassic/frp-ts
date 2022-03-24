export interface NonEmptyArray<Value> extends ReadonlyArray<Value> {
	readonly 0: Value
}

export interface NonEmptyArray2<Value> extends NonEmptyArray<Value> {
	readonly 1: Value
}
