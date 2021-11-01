import { h } from './h'
import { constVoid } from '@frp-ts/utils'
import { atom, clock } from '@frp-ts/core'
import { CURRENT_CONTEXT, disposeContext } from './context'

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

describe('createElement', () => {
	beforeEach(() => {
		disposeContext(CURRENT_CONTEXT)
	})
	describe('native element', () => {
		describe('create element', () => {
			it('creates native element', () => {
				const div = h.createElement('div', null)
				expect(div).toBeInstanceOf(HTMLDivElement)
			})
			it.skip('creates namespaced native element', () => {
				const svg = h.createElement('svg', null, undefined)
				expect(svg).toBeInstanceOf(SVGElement)
			})
		})
		describe('children', () => {
			it('adds string content', () => {
				const div = h.createElement('div', null, 'foo')
				expect(getChildNodes(div)).toEqual([document.createTextNode('foo')])
			})
			it('adds node content', () => {
				const child = h.createElement('div', null)
				const div = h.createElement('div', null, child)
				expect(getChildNodes(div)).toEqual([child])
			})
			it('skips null content', () => {
				const div = h.createElement('div', null, null)
				expect(getChildNodes(div)).toEqual([])
			})
			it('skips undefined content', () => {
				const div = h.createElement('div', null, undefined)
				expect(getChildNodes(div)).toEqual([])
			})
			it('skips "false" content', () => {
				const div = h.createElement('div', null, false)
				expect(getChildNodes(div)).toEqual([])
			})
			it('skips "true" content', () => {
				const div = h.createElement('div', null, true)
				expect(getChildNodes(div)).toEqual([])
			})
			it('stringifies numeric content', () => {
				const div = h.createElement('div', null, 123)
				expect(getChildNodes(div)).toEqual([document.createTextNode('123')])
			})
		})
		describe('props', () => {
			describe('abitrary attribute', () => {
				describe('null', () => {
					it('skips value', () => {
						const div = h.createElement('div', { color: null })
						expect(hasAttribute(div, 'color')).toBe(false)
					})
					it('skips initial Property value', () => {
						const color = newAtom(null)
						const div = h.createElement('div', { color })
						expect(hasAttribute(div, 'color')).toBe(false)
					})
					it('removes attribute on Property update', () => {
						const color = newAtom<string | null>('red')
						const div = h.createElement('div', { color })
						expect(hasAttribute(div, 'color')).toBe(true)
						color.set(null)
						expect(hasAttribute(div, 'color')).toBe(false)
					})
				})
				describe('undefined', () => {
					it('skips value', () => {
						const div = h.createElement('div', { color: undefined })
						expect(hasAttribute(div, 'color')).toBe(false)
					})
					it('skips initial Property value', () => {
						const color = newAtom(undefined)
						const div = h.createElement('div', { color })
						expect(hasAttribute(div, 'color')).toBe(false)
					})
					it('removes attribute on Property update', () => {
						const color = newAtom<string | undefined>('red')
						const div = h.createElement('div', { color })
						expect(hasAttribute(div, 'color')).toBe(true)
						color.set(undefined)
						expect(hasAttribute(div, 'color')).toBe(false)
					})
				})
				describe('string', () => {
					it('sets value', () => {
						const div = h.createElement('div', { color: 'red' })
						expect(getAttribute(div, 'color')).toBe('red')
					})
					it('sets initial Property value', () => {
						const color = newAtom('red')
						const div = h.createElement('div', { color })
						expect(getAttribute(div, 'color')).toBe('red')
					})
					it('updates value', () => {
						const color = newAtom('red')
						const div = h.createElement('div', { color })
						color.set('blue')
						expect(getAttribute(div, 'color')).toBe('blue')
					})
				})
				describe('number', () => {
					it('sets value', () => {
						const div = h.createElement('div', { color: 123 })
						expect(getAttribute(div, 'color')).toBe('123')
					})
					it('sets initial Property value', () => {
						const color = newAtom(123)
						const div = h.createElement('div', { color })
						expect(getAttribute(div, 'color')).toBe('123')
					})
					it('updates value', () => {
						const color = newAtom(123)
						const div = h.createElement('div', { color })
						color.set(456)
						expect(getAttribute(div, 'color')).toBe('456')
					})
				})
				describe('false', () => {
					it('sets value', () => {
						const div = h.createElement('div', { color: false })
						expect(getAttribute(div, 'color')).toBe('false')
					})
					it('sets initial Property value', () => {
						const color = newAtom(false)
						const div = h.createElement('div', { color })
						expect(getAttribute(div, 'color')).toBe('false')
					})
					it('updates value', () => {
						const color = newAtom(true)
						const div = h.createElement('div', { color })
						color.set(false)
						expect(getAttribute(div, 'color')).toBe('false')
					})
				})
				describe('true', () => {
					it('sets value', () => {
						const div = h.createElement('div', { color: true })
						expect(getAttribute(div, 'color')).toBe('true')
					})
					it('sets initial Property value', () => {
						const color = newAtom(true)
						const div = h.createElement('div', { color })
						expect(getAttribute(div, 'color')).toBe('true')
					})
					it('updates value', () => {
						const color = newAtom(false)
						const div = h.createElement('div', { color })
						color.set(true)
						expect(getAttribute(div, 'color')).toBe('true')
					})
				})
			})
			describe('style attribute', () => {
				describe('string', () => {
					it('sets value as cssText', () => {
						const div = h.createElement('div', { style: 'color: red' })
						expect(getStyle(div).color).toBe('red')
					})
					it('sets initial Property value as cssText', () => {
						const style = newAtom('color: red')
						const div = h.createElement('div', { style })
						expect(getStyle(div).color).toBe('red')
					})
					it('updates value', () => {
						const style = newAtom('color: red')
						const div = h.createElement('div', { style })
						style.set('color: blue')
						expect(getStyle(div).color).toBe('blue')
					})
				})
				describe('undefined', () => {
					it('skips value', () => {
						const div = h.createElement('div', { style: undefined })
						expect(getStyle(div).cssText).toBe('')
					})
					it('skips initial Property value', () => {
						const style = newAtom(undefined)
						const div = h.createElement('div', { style })
						expect(getStyle(div).cssText).toBe('')
					})
					it('removes styles on Property update', () => {
						const style = newAtom<string | undefined>('color: red')
						const div = h.createElement('div', { style })
						style.set(undefined)
						expect(getStyle(div).cssText).toBe('')
					})
				})
				describe('CSSProperties', () => {
					it('sets value', () => {
						const div = h.createElement('div', { style: { color: 'red' } })
						expect(getStyle(div).color).toBe('red')
					})
					it('sets initial Property value', () => {
						const style = newAtom({ color: 'red' })
						const div = h.createElement('div', { style })
						expect(getStyle(div).color).toBe('red')
					})
					it('updates value', () => {
						const style = newAtom({ color: 'red' })
						const div = h.createElement('div', { style })
						style.set({ color: 'blue' })
						expect(getStyle(div).color).toBe('blue')
					})
				})
			})
			describe('className attribute', () => {
				describe('string', () => {
					it('sets string value', () => {
						const div = h.createElement('div', { className: 'foo' })
						expect(getClassName(div)).toBe('foo')
					})
					it('sets initial Property value', () => {
						const className = newAtom('foo')
						const div = h.createElement('div', { className })
						expect(getClassName(div)).toBe('foo')
					})
					it('updates value', () => {
						const className = newAtom('foo')
						const div = h.createElement('div', { className })
						className.set('bar')
						expect(getClassName(div)).toBe('bar')
					})
				})
				describe('undefined', () => {
					it('skips value', () => {
						const div = h.createElement('div', { className: undefined })
						expect(getClassName(div)).toBe('')
					})
					it('skips initial Property value', () => {
						const className = newAtom(undefined)
						const div = h.createElement('div', { className })
						expect(getClassName(div)).toBe('')
					})
					it('updates value', () => {
						const className = newAtom('foo')
						const div = h.createElement('div', { className })
						className.set('bar')
						expect(getClassName(div)).toBe('bar')
					})
				})
			})
			describe('event handler', () => {
				describe('EventListener', () => {
					it('sets value', () => {
						const cb = jest.fn(constVoid)
						const div = h.createElement('div', { onClick: cb })
						if (div instanceof HTMLDivElement) {
							div.dispatchEvent(new MouseEvent('click'))
						}
						expect(cb).toHaveBeenCalledTimes(1)
					})
					it('sets initial Property value', () => {
						const cb = jest.fn(constVoid)
						const onClick = newAtom(cb)
						const div = h.createElement('div', { onClick })
						if (div instanceof HTMLDivElement) {
							div.dispatchEvent(new MouseEvent('click'))
						}
						expect(cb).toHaveBeenCalledTimes(1)
					})
					it('updates value', () => {
						const cb1 = jest.fn(constVoid)
						const cb2 = jest.fn(constVoid)
						const onClick = newAtom(cb1)
						const div = h.createElement('div', { onClick })
						onClick.set(cb2)
						if (div instanceof HTMLDivElement) {
							div.dispatchEvent(new MouseEvent('click'))
						}
						expect(cb1).not.toHaveBeenCalled()
						expect(cb2).toHaveBeenCalledTimes(1)
					})
				})
				describe('undefined', () => {
					it('removes event handler', () => {
						const cb = jest.fn(constVoid)
						const onClick = newAtom<undefined | EventListener>(cb)
						const div = h.createElement('div', { onClick })
						onClick.set(undefined)
						if (div instanceof HTMLElement) {
							div.dispatchEvent(new MouseEvent('click'))
						}
						expect(cb).not.toHaveBeenCalled()
					})
				})
			})
		})
	})
})

const getChildNodes = (target: unknown): readonly Node[] => {
	if (target instanceof Node) {
		return Array.from(target.childNodes)
	}
	throw new Error('Target is not an instance of Node')
}

const getAttribute = (target: unknown, name: string): string | null => {
	if (target instanceof Element) {
		return target.getAttribute(name)
	}
	throw new Error(`Target is not an instance of Element`)
}

const hasAttribute = (target: unknown, name: string): boolean => {
	if (target instanceof Element) {
		return target.hasAttribute(name)
	}
	throw new Error(`Target is not an instance of Element`)
}

const getStyle = (target: unknown): CSSStyleDeclaration => {
	if (target instanceof HTMLElement) {
		return target.style
	}
	throw new Error(`Target is not an instance of HTMLElement`)
}

const getClassName = (target: unknown): string => {
	if (target instanceof Element) {
		return target.className
	}
	throw new Error(`Target is not an instance of Element`)
}
