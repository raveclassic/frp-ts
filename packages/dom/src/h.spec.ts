import { h, svg } from './h'
import { constVoid } from '@frp-ts/utils'
import { atom, clock } from '@frp-ts/core'
import { CURRENT_CONTEXT, disposeContext } from './context'
import { domUtils } from '@frp-ts/test-utils'

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

describe('h', () => {
	beforeEach(() => {
		disposeContext(CURRENT_CONTEXT)
	})
	describe('createElement', () => {
		describe('native element', () => {
			describe('create element', () => {
				it('creates native element', () => {
					const div = h.createElement('div', null)
					expect(div).toBeInstanceOf(HTMLDivElement)
				})
				it('creates native svg element', () => {
					const element = svg(() => h.createElement('svg', null, undefined))
					expect(element).toBeInstanceOf(SVGSVGElement)
				})
			})
			describe('children', () => {
				describe('string', () => {
					it('renders text node', () => {
						const div = h.createElement('div', null, 'foo')
						expect(domUtils.getChildNodes(div)).toEqual([document.createTextNode('foo')])
					})
					it('renders text node for initial Property value', () => {
						const div = h.createElement('div', null, newAtom('foo'))
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode('foo'),
							document.createTextNode(''),
						])
					})
					it('updates text node for Property updates', () => {
						const children = newAtom('foo')
						const div = h.createElement('div', null, children)
						children.set('bar')
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode('bar'),
							document.createTextNode(''),
						])
					})
				})
				describe('node', () => {
					it('renders node', () => {
						const child = h.createElement('div', null)
						const div = h.createElement('div', null, child)
						expect(domUtils.getChildNodes(div)).toEqual([child])
					})
				})
				describe('null', () => {
					it('skips content', () => {
						const div = h.createElement('div', null, null)
						expect(domUtils.getChildNodes(div)).toEqual([])
					})
					it('skips initial Property value', () => {
						const div = h.createElement('div', null, newAtom(null))
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
					it('removes content for Property updates', () => {
						const children = newAtom<string | null>('foo')
						const element = h.createElement('div', null, children)
						children.set(null)
						expect(domUtils.getChildNodes(element)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
				})
				describe('undefined', () => {
					it('skips content', () => {
						const div = h.createElement('div', null, undefined)
						expect(domUtils.getChildNodes(div)).toEqual([])
					})
					it('skips initial Property value', () => {
						const div = h.createElement('div', null, newAtom(undefined))
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
					it('removes content for Property updates', () => {
						const children = newAtom<string | undefined>('foo')
						const element = h.createElement('div', null, children)
						children.set(undefined)
						expect(domUtils.getChildNodes(element)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
				})
				describe('"false"', () => {
					it('skips content', () => {
						const div = h.createElement('div', null, false)
						expect(domUtils.getChildNodes(div)).toEqual([])
					})
					it('skips initial Property value', () => {
						const div = h.createElement('div', null, newAtom(false))
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
					it('removes content for Property updates', () => {
						const children = newAtom<string | false>('foo')
						const element = h.createElement('div', null, children)
						children.set(false)
						expect(domUtils.getChildNodes(element)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
				})
				describe('"true"', () => {
					it('skips content', () => {
						const div = h.createElement('div', null, true)
						expect(domUtils.getChildNodes(div)).toEqual([])
					})
					it('skips initial Property value', () => {
						const div = h.createElement('div', null, newAtom(true))
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
					it('removes content for Property updates', () => {
						const children = newAtom<string | true>('foo')
						const element = h.createElement('div', null, children)
						children.set(true)
						expect(domUtils.getChildNodes(element)).toEqual([
							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
				})
				describe('number', () => {
					it('renders text node', () => {
						const div = h.createElement('div', null, 123)
						expect(domUtils.getChildNodes(div)).toEqual([document.createTextNode('123')])
					})
					it('renders text node for initial Property value', () => {
						const div = h.createElement('div', null, newAtom(123))
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode('123'),
							document.createTextNode(''),
						])
					})
					it('updates text node for Property updates', () => {
						const children = newAtom(123)
						const div = h.createElement('div', null, children)
						children.set(456)
						expect(domUtils.getChildNodes(div)).toEqual([
							document.createTextNode(''),
							document.createTextNode('456'),
							document.createTextNode(''),
						])
					})
				})
				describe('all at once', () => {
					it('renders content', () => {
						const child = h.createElement('div', null, undefined)
						const element = h.createElement('div', null, ['string', 123, null, undefined, child])
						expect(domUtils.getChildNodes(element)).toEqual([
							document.createTextNode('string'),
							document.createTextNode('123'),
							child,
						])
					})
					it('renders content for Property initial value', () => {
						const stringValue = newAtom('string')
						const numberValue = newAtom(123)
						const nullValue = newAtom(null)
						const undefinedValue = newAtom(undefined)
						const element = h.createElement('div', null, [
							stringValue,
							numberValue,
							nullValue,
							undefinedValue,
						])
						expect(domUtils.getChildNodes(element)).toEqual([
							document.createTextNode(''),
							document.createTextNode('string'),
							document.createTextNode(''),

							document.createTextNode(''),
							document.createTextNode('123'),
							document.createTextNode(''),

							document.createTextNode(''),
							document.createTextNode(''),

							document.createTextNode(''),
							document.createTextNode(''),
						])
					})
					it('updates content for Property updates', () => {
						const stringValue = newAtom('string')
						const numberValue = newAtom(123)
						const nullValue = newAtom<string | null>(null)
						const undefinedValue = newAtom<string | undefined>(undefined)
						const element = h.createElement('div', null, [
							stringValue,
							numberValue,
							nullValue,
							undefinedValue,
						])
						stringValue.set('foo')
						numberValue.set(456)
						nullValue.set('null')
						undefinedValue.set('undefined')
						expect(domUtils.getChildNodes(element)).toEqual([
							document.createTextNode(''),
							document.createTextNode('foo'),
							document.createTextNode(''),

							document.createTextNode(''),
							document.createTextNode('456'),
							document.createTextNode(''),

							document.createTextNode(''),
							document.createTextNode('null'),
							document.createTextNode(''),

							document.createTextNode(''),
							document.createTextNode('undefined'),
							document.createTextNode(''),
						])
					})
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
					describe('html elements', () => {
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
					describe('svg elements', () => {
						describe('string', () => {
							it('sets string value', () => {
								const element = svg(() => h.createElement('svg', { className: 'foo' }))
								expect(getAttribute(element, 'class')).toBe('foo')
							})
							it('sets initial Property value', () => {
								const className = newAtom('foo')
								const element = svg(() => h.createElement('svg', { className }))
								expect(getAttribute(element, 'class')).toBe('foo')
							})
							it('updates value', () => {
								const className = newAtom('foo')
								const element = svg(() => h.createElement('svg', { className }))
								className.set('bar')
								expect(getAttribute(element, 'class')).toBe('bar')
							})
						})
						describe('undefined', () => {
							it('skips value', () => {
								const element = svg(() => h.createElement('svg', { className: undefined }))
								expect(getAttribute(element, 'class')).toBe(null)
							})
							it('skips initial Property value', () => {
								const className = newAtom(undefined)
								const element = svg(() => h.createElement('svg', { className }))
								expect(getAttribute(element, 'class')).toBe(null)
							})
							it('removes attribute', () => {
								const className = newAtom<undefined | string>('foo')
								const delement = svg(() => h.createElement('svg', { className }))
								className.set(undefined)
								expect(getAttribute(delement, 'class')).toBe(null)
							})
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
		describe('fragment', () => {})
		describe('component', () => {
			it('passes empty object as props for null props value and single undefined child', () => {
				const foo = jest.fn(constVoid)
				h.createElement(foo, null, undefined)
				expect(foo).toHaveBeenLastCalledWith({})
			})
			it('passes props as is', () => {
				const foo = jest.fn(constVoid)
				h.createElement(foo, { prop: 123 }, undefined)
				expect(foo).toHaveBeenLastCalledWith({ prop: 123 })
			})
			it('passes single child from a list of props as is', () => {
				const foo = jest.fn(constVoid)
				h.createElement(foo, null, 123)
				expect(foo).toHaveBeenLastCalledWith({ children: 123 })
			})
			it('passes multiple children as a prop', () => {
				const foo = jest.fn(constVoid)
				h.createElement(foo, null, 123, 'bar')
				expect(foo).toHaveBeenLastCalledWith({ children: [123, 'bar'] })
			})
			it('passes null/undefined children', () => {
				const foo = jest.fn(constVoid)
				h.createElement(foo, null, null, undefined)
				expect(foo).toHaveBeenLastCalledWith({
					children: [null, undefined],
				})
			})
			it('returns component output', () => {
				const child = h.createElement('div', null, 'child')
				const foo = () => child
				const result = h.createElement(foo, null)
				expect(result).toBe(child)
			})
			it('passes Property in props and children as is', () => {
				const Component = jest.fn(constVoid)
				const prop = newAtom('foo')
				h.createElement(Component, { prop }, prop)
				expect(Component).toHaveBeenLastCalledWith({ prop, children: prop })
			})
		})
	})
})

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
