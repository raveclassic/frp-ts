import { getChildNodes } from './dom-utils'

describe('getChildNodes', () => {
	it('throws if target is not an instance of Node', () => {
		expect(() => getChildNodes(123)).toThrow()
	})
	it('returns array of child nodes', () => {
		const child = document.createTextNode('child')
		const target = document.createElement('div')
		target.append(child)
		expect(() => getChildNodes(target)).toEqual([child])
	})
})
