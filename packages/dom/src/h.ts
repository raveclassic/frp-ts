import { JSXInternal } from './jsx'
import { Property } from '@frp-ts/core'
import { cleanup } from './context'
export import PrimitiveElementChild = JSXInternal.PrimitiveElementChild
export import ElementChild = JSXInternal.ElementChild
export import ElementChildren = JSXInternal.ElementChildren
import NativeElementChildren = JSXInternal.NativeElementChildren
import CSSProperties = JSXInternal.CSSProperties
import Primitive = JSXInternal.Primitive
import { constVoid } from '@frp-ts/utils'

type PrimitivePropertyValue = Primitive | CSSProperties | EventListener
type PropertyValue = PrimitivePropertyValue | Property<PrimitivePropertyValue>
type Props = null | Record<PropertyKey, PropertyValue>
type NativeElement = HTMLElement | SVGElement

export interface ComponentType<Props> {
	(props: Props): JSXInternal.Element
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace h {
	export import JSX = JSXInternal

	export function createElement(
		type: string | ComponentType<Record<PropertyKey, unknown> | void>,
		props: Props,
		...children: readonly ElementChildren[]
	): JSX.Element {
		// console.group('createElement')
		// console.log('type', type)
		// console.log('props', props)
		// console.log('children', children)
		// console.groupEnd()
		if (typeof type === 'string') {
			// HTML Element
			return createNativeElement(type, props, ...children)
		}
		if (type === Fragment) {
			// Fragment <></>
			return createDocumentFragment(...children)
		}
		if (typeof type === 'function') {
			// ComponentType
			const filteredChildren = children.filter(isNonNullableOrVoid)
			if (filteredChildren.length === 0) {
				return props === null ? type() : type(props)
			} else {
				type({
					...props,
					children: filteredChildren.length === 1 ? filteredChildren[0] : filteredChildren,
				})
			}
		}
	}

	export const Fragment: ComponentType<FragmentProps> = constVoid
}

export interface FragmentProps {
	readonly children?: ElementChildren
}
export const Fragment = h.Fragment

export const render = (element: PrimitiveElementChild, target?: Element | null): void => {
	if (target && element !== null && element !== undefined) {
		target.append(element instanceof Node ? element : element.toString())
	}
}

const processStyle = (target: NativeElement, name: string, value: PrimitivePropertyValue): void => {
	if (isNonNullableOrVoid(value)) {
		if (typeof value === 'string') {
			// style: string
			target.style.cssText = value
		} else if (typeof value === 'object') {
			// style: CSSProperties
			for (const cssProperty in value) {
				// eslint-disable-next-line no-restricted-syntax
				const cssValue: unknown = (value as never)[cssProperty]
				if (typeof cssValue === 'string') {
					target.style.setProperty(cssProperty, cssValue)
				} else {
					if (isNonNullableOrVoid(cssValue)) {
						throw new TypeError(
							`Style property "${cssProperty}" should have string type or be undefined or null. Received ${JSON.stringify(
								cssValue,
							)}`,
						)
					}
				}
			}
		}
	} else {
		target.style.cssText = ''
	}
}

interface EventProxy extends Record<string, EventListener> {}
const EVENT_PROXY = new WeakMap<object, EventProxy>()
const getEventProxy = (target: object): EventProxy => {
	let proxy = EVENT_PROXY.get(target)
	if (!proxy) {
		proxy = {}
		EVENT_PROXY.set(target, proxy)
	}
	return proxy
}
function handleEvent(this: NativeElement, event: Event): void {
	const handler = getEventProxy(this)[event.type]
	handler?.(event)
}
const processEventHandler = (target: NativeElement, name: string, value: PrimitivePropertyValue): void => {
	const trimmedName = name.slice(2).toLowerCase()
	if (isNonNullableOrVoid(value)) {
		if (typeof value === 'function') {
			getEventProxy(target)[trimmedName] = value
			target.addEventListener(trimmedName, handleEvent)
		}
	} else {
		delete getEventProxy(target)[trimmedName]
		target.removeEventListener(trimmedName, handleEvent)
	}
}

const processClassName = (target: NativeElement, name: string, value: PrimitivePropertyValue): void => {
	if (target instanceof SVGElement) {
		processArbitraryAttribute(target, 'class', value)
	} else {
		target.className = isNonNullableOrVoid(value) ? value.toString() : ''
	}
}

const processArbitraryAttribute = (target: NativeElement, name: string, value: PrimitivePropertyValue): void => {
	if (isNonNullableOrVoid(value)) {
		target.setAttribute(name, value.toString())
	} else {
		target.removeAttribute(name)
	}
}

const processAttribute = (target: NativeElement, name: string, value: PrimitivePropertyValue): void => {
	if (name === 'style') {
		processStyle(target, name, value)
	} else if (name.startsWith('on')) {
		processEventHandler(target, name, value)
	} else if (name === 'className') {
		processClassName(target, name, value)
	} else {
		processArbitraryAttribute(target, name, value)
	}
}

const processProp = (target: NativeElement, name: string, value: PropertyValue): void => {
	if (isProperty(value)) {
		const update = () => processAttribute(target, name, value.get())
		cleanup(value.subscribe({ next: update }).unsubscribe)
		update()
	} else {
		processAttribute(target, name, value)
	}
}

const createDocumentFragment = (...children: readonly ElementChildren[]): DocumentFragment => {
	const fragment = document.createDocumentFragment()
	append(fragment, children)
	return fragment
}

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
let isSvg = false
export const svg = <Result>(factory: () => Result): Result => {
	const current = isSvg
	isSvg = true
	const result = factory()
	isSvg = current
	return result
}

const createNativeElement = (type: string, props: Props, ...children: readonly ElementChildren[]): NativeElement => {
	const element = isSvg ? document.createElementNS(SVG_NAMESPACE, type) : document.createElement(type)
	for (const name in props) {
		processProp(element, name, props[name])
	}
	append(element, children)
	return element
}

/**
 * @see https://github.com/luwes/sinuous/blob/master/packages/sinuous/h/src/remove-nodes.js
 */
const clearBetween = (startMarker: Node, endMarker: Node): void => {
	const parent = startMarker.parentNode
	let cursor: ChildNode | null = startMarker.nextSibling
	while (cursor && cursor !== endMarker) {
		const next = cursor.nextSibling
		// Is needed in case the child was pulled out the parent before clearing.
		if (parent === cursor.parentNode) {
			cursor.remove()
		}
		cursor = next
	}
}

const renderChild = (child: ElementChild): Node | undefined => {
	if (isProperty(child)) {
		const fragment = document.createDocumentFragment()
		const startMarker = document.createTextNode('')
		const endMarker = document.createTextNode('')
		fragment.append(startMarker)
		const rendered = renderChildren(child.get())
		if (rendered) {
			if (rendered instanceof Node) {
				fragment.append(rendered)
			} else {
				fragment.append(...rendered)
			}
		}
		fragment.append(endMarker)
		const subscription = child.subscribe({
			next: () => {
				const value = child.get()
				clearBetween(startMarker, endMarker)
				if (endMarker.parentNode) {
					const rendered = renderChildren(value)
					if (rendered) {
						if (rendered instanceof Node) {
							endMarker.parentNode.insertBefore(rendered, endMarker)
						} else {
							const fragment = document.createDocumentFragment()
							fragment.append(...rendered)
							endMarker.parentNode.insertBefore(fragment, endMarker)
						}
					}
				}
			},
		})
		cleanup(subscription.unsubscribe)
		return fragment
	} else if (child instanceof Node) {
		return child
	} else if (isNonNullableOrVoid(child) && typeof child !== 'boolean') {
		return document.createTextNode(child.toString())
	}
}

const renderChildren = (children: NativeElementChildren): Node | readonly Node[] | undefined => {
	if (isElementChild(children)) {
		// single child
		return renderChild(children)
	} else {
		// multiple children
		const result: Node[] = []
		for (const child of children) {
			const rendered = renderChildren(child)
			if (rendered) {
				if (rendered instanceof Node) {
					result.push(rendered)
				} else {
					result.push(...rendered)
				}
			}
		}
		return result
	}
}

const append = (target: Element | DocumentFragment, children: NativeElementChildren): void => {
	const rendered = renderChildren(children)
	if (rendered) {
		if (rendered instanceof Node) {
			target.append(rendered)
		} else {
			target.append(...rendered)
		}
	}
}

const isElementChild = (value: NativeElementChildren): value is ElementChild => !Array.isArray(value)
const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => typeof value === 'object' && value !== null
const isProperty = (value: unknown): value is Property<unknown> => isRecord(value) && typeof value['get'] === 'function'
type NonNullableOrVoid<T> = T extends null | undefined | void ? never : T
const isNonNullableOrVoid = <T>(value: NonNullableOrVoid<T> | null | undefined | void): value is NonNullableOrVoid<T> =>
	value !== null && value !== undefined
