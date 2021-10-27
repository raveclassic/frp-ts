/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/ban-types */
import { JSXInternal } from './jsx'
export import ElementChild = JSXInternal.ElementChild
export import ElementChildren = JSXInternal.ElementChildren
import NativeElementChildren = JSXInternal.NativeElementChildren
import { Property, Subscription } from '@frp-ts/core'
import CSSProperties = JSXInternal.CSSProperties

type PrimitivePropertyValue = string | number | boolean | undefined | null | CSSProperties | EventListener
type PropertyValue = PrimitivePropertyValue | Property<PrimitivePropertyValue>
type Props = null | Record<PropertyKey, PropertyValue>

const SUBSCRIPTIONS = Symbol('Subscriptions')

export namespace h {
	export interface ComponentType<Props> {
		(props: Props): JSXInternal.Element
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export import JSX = JSXInternal

	export function createElement(
		type: string | ComponentType<Record<PropertyKey, unknown> | void>,
		props: Props,
		...children: readonly ElementChildren[]
	): JSX.Element {
		console.group('createElement')
		console.log('type', type)
		console.log('props', props)
		console.log('children', children)
		console.groupEnd()
		if (typeof type === 'string') {
			// HTML Element
			return createHTMLElement(type, props, ...children)
		}
		if (type === createFragment) {
			// Fragment <></>
			return createDocumentFragment(...children)
		}
		if (typeof type === 'function') {
			// ComponentType
			return type({ ...props, children })
		}
		throw new Error('cannot create component')
	}

	export const createFragment = () => {}
}

const setStyleAttribute = (target: HTMLElement, name: string, value: PropertyValue): boolean => {
	if (isNonNullable(value)) {
		if (isProperty(value)) {
			// reactive style attribute
			bindAttribute(target, name, value)
			return true
		} else if (typeof value === 'string') {
			// style: string
			target.style.cssText = value
		} else if (typeof value === 'object') {
			// style: CSSProperties
			for (const cssProperty in value) {
				// eslint-disable-next-line no-restricted-syntax
				const cssValue: unknown = (value as never)[cssProperty]
				// ignore null as `setAttribute` is called once per element instantiation
				if (typeof cssValue === 'string') {
					target.style.setProperty(cssProperty, cssValue)
				} else {
					throw new TypeError(
						`Style property "${cssProperty}" should have string type. Received ${JSON.stringify(cssValue)}`,
					)
				}
			}
		}
	} else {
		target.style.cssText = ''
	}
	return false
}

const setEventHandler = (target: HTMLElement, name: string, value: PropertyValue): boolean => {
	// event handler
	const trimmedName = name.slice(2).toLowerCase()
	// todo this wont work
	const handler: EventListener = (e) => {
		typeof value === 'function' && value(e)
	}
	if (isNonNullable(value)) {
		if (isProperty(value)) {
			// reactive event handler
			bindAttribute(target, name, value)
			return true
		} else {
			target.addEventListener(trimmedName, handler)
		}
	} else {
		target.removeEventListener(trimmedName, handler)
	}

	return false
}

const setClassName = (target: HTMLElement, name: string, value: PropertyValue): boolean => {
	if (isNonNullable(value)) {
		if (isProperty(value)) {
			// reactive className
			bindAttribute(target, name, value)
			return true
		} else {
			target.className = value.toString()
		}
	}
	return false
}

const setArbitraryProperty = (target: HTMLElement, name: string, value: PropertyValue): boolean => {
	if (isNonNullable(value)) {
		if (isProperty(value)) {
			// arbitrary reactive attribute
			bindAttribute(target, name, value)
			return true
		} else {
			target.setAttribute(name, value.toString())
		}
	} else {
		target.removeAttribute(name)
	}
	return false
}

/**
 * Binds `value` to the `target` under `name`.
 * If `value` is a `Property`, subscribes to changes
 * @returns {boolean} - inidicates whether the function requires cleanup due to possible subscriptions to {@link Property}
 */
const setAttribute = (target: HTMLElement, name: string, value: PropertyValue): boolean => {
	if (name === 'style') {
		return setStyleAttribute(target, name, value)
	} else if (name.startsWith('on')) {
		return setEventHandler(target, name, value)
	} else if (name === 'className') {
		return setClassName(target, name, value)
	} else {
		return setArbitraryProperty(target, name, value)
	}
}

const attachDisposer = (target: Node) => {
	// if this marker is connected, this means the target is also connected
	const childMarker = document.createTextNode('')
	const observer = new MutationObserver((list, observer) => {
		// Use traditional 'for loops' for IE 11
		for (const mutation of list) {
			if (mutation.type === 'childList') {
				console.log('A child node has been added or removed.')
			} else if (mutation.type === 'attributes') {
				console.log(`The ${mutation.attributeName ?? ''} attribute was modified.`)
			}
		}
	})
	observer.observe(target, {
		subtree: true,
		attributes: true,
		attributeOldValue: true,
		characterData: true,
		characterDataOldValue: true,
		childList: true,
	})
}

const createDocumentFragment = (...children: readonly ElementChildren[]): DocumentFragment => {
	const fragment = document.createDocumentFragment()
	append(fragment, children)
	return fragment
}

const createHTMLElement = (type: string, props: Props, ...children: readonly ElementChildren[]): HTMLElement => {
	const element = document.createElement(type)
	for (const name in props) {
		setAttribute(element, name, props[name])
	}
	append(element, children)
	return element
}

const bindAttribute = (target: HTMLElement, name: string, value: Property<PrimitivePropertyValue>): void => {
	const subscriptions = getSubscriptions(target)
	const update = () => setAttribute(target, name, value.get())
	subscriptions.add(value.subscribe({ next: update }))
	update()
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

const renderChild = (child: ElementChild, currentReactiveRoot: Node): Node => {
	if (isProperty(child)) {
		const fragment = document.createDocumentFragment()
		const startMarker = document.createTextNode('')
		const endMarker = document.createTextNode('')
		const node = renderChildren(child.get(), currentReactiveRoot)
		fragment.append(startMarker, node, endMarker)
		const subscription = child.subscribe({
			next: () => {
				const value = child.get()
				clearBetween(startMarker, endMarker)
				endMarker.parentNode?.insertBefore(renderChildren(value, currentReactiveRoot), endMarker)
			},
		})
		console.log('adding subscription to', currentReactiveRoot)
		const subscriptions = getSubscriptions(currentReactiveRoot)
		subscriptions.add(subscription)
		return fragment
	} else if (child instanceof Node) {
		return child
	} else if (isNonNullable(child)) {
		return document.createTextNode(child.toString())
	} else {
		return document.createDocumentFragment()
	}
}

const renderChildren = (children: NativeElementChildren, reactiveRoot: Node): Node => {
	if (isElementChild(children)) {
		// single child
		return renderChild(children, reactiveRoot)
	} else {
		// multiple children
		const fragment = document.createDocumentFragment()
		fragment.append(...children.map((child) => renderChildren(child, reactiveRoot)))
		return fragment
	}
}
const append = (target: Element | DocumentFragment, children: NativeElementChildren) => {
	target.append(renderChildren(children, target))
}

const isElementChild = (value: NativeElementChildren): value is ElementChild => !Array.isArray(value)
const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => typeof value === 'object'
const isProperty = (value: unknown): value is Property<unknown> => isRecord(value) && typeof value['get'] === 'function'
const isNonNullable = <T>(value: NonNullable<T> | null | undefined): value is NonNullable<T> =>
	value !== null && value !== undefined

// eslint-disable-next-line no-restricted-syntax
const getField = <Value>(target: object, key: PropertyKey): Value | undefined => (target as never)[key]

const getSubscriptions = (target: Node): Set<Subscription> => {
	let subscriptions = getField<Set<Subscription>>(target, SUBSCRIPTIONS)
	if (subscriptions === undefined) {
		subscriptions = new Set()
	}
	return subscriptions
}
