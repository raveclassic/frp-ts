/* eslint-disable import/no-default-export */
declare module 'udomdiff' {
	/**
	 * @param parentNode The container where children live
	 * @param a The list of current/live children
	 * @param b The list of future children
	 * @param get The callback invoked per each entry related DOM operation
	 * @param [before] The optional node used as anchor to insert before.
	 * @returns The same list of future children
	 */
	export default function udomdiff(
		parentNode: Node,
		a: readonly Node[],
		b: readonly Node[],
		get: (entry: Node, action: number) => Node,
		before?: Node,
	): void
}
