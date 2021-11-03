export const getChildNodes = (target: unknown): readonly Node[] => {
	if (target instanceof Node) {
		return Array.from(target.childNodes)
	}
	throw new Error('Target should be an instance of Node')
}
