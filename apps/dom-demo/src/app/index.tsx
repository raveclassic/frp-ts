import { For, h, If, indexKey, render } from '@frp-ts/dom'
import { clock, atom } from '@frp-ts/core'

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})
//
const Counter = () => {
	const counter = newAtom(0)
	const increment = () => counter.modify((v) => v + 1)
	return (
		<>
			<div>{counter}</div>
			<button onClick={increment}>increment</button>
		</>
	)
}
//
// interface FooProps {
// 	readonly children: ElementChildren
// }
// const Foo = (props: FooProps) => {
// 	return <div>foo: {props.children}</div>
// }
//
// interface AppProps {
// 	readonly foo: string
// 	readonly children: ElementChildren
// }
// export const App = (props: AppProps) => {
// 	return (
// 		<div>
// 			{props.foo}
// 			{props.children}
// 			<div>
// 				counter1: <Counter />
// 			</div>
// 			<div>
// 				counter2: <Counter />
// 			</div>
// 			<Foo>{props.children}</Foo>
// 		</div>
// 	)
// }
//
// function PropertyAttribute() {
// 	const value = newAtom<string>('red')
// 	const handleColorClick = () => value.modify((value) => (value === 'red' ? 'blue' : 'red'))
// 	const showNested = newAtom(false)
// 	const handleNestedClick = () => showNested.modify((value) => !value)
// 	return (
// 		<div style={newAtom(undefined)} className={newAtom(undefined)}>
// 			<Bind>
// 				{property.combine(showNested, (showNested) =>
// 					showNested ? <div>TRUE: {showNested}</div> : <div>FALSE: {showNested}</div>,
// 				)}
// 			</Bind>
// 			<>
// 				{property.combine(showNested, (showNested) =>
// 					showNested ? <div>TRUE: {showNested}</div> : <div>FALSE: {showNested}</div>,
// 				)}
// 			</>
// 			<>{() => 123}</>
// 			{value}
// 			<button onClick={handleColorClick}>toggle color</button>
// 			<If value={showNested} then={() => <div>then: {value}</div>} else={() => <div>else</div>} />
// 			<div>showNested: {value}</div>
// 			<button onClick={handleNestedClick}>toggle nested</button>
// 		</div>
// 	)
// }
//
// const Foo2 = () => {
// 	return undefined
// }
//
// const ForDemo = () => {
// 	const list = newAtom([1, 2, 3])
// 	setInterval(() => {
// 		list.set([1, Math.random(), 3])
// 	}, 1000)
// 	return (
// 		<For value={list} key={(item, index) => index}>
// 			{(item) => <div>Item: {item}</div>}
// 		</For>
// 	)
// }
//
// // render
// render(
// 	<>
// 		<ForDemo />
// 	</>,
// 	document.getElementById('root'),
// )

const Test = () => {
	const items = newAtom(['first', 'second', 'third'])
	const handleChange = () => {
		items.set(['first', 'second ' + Math.random(), 'third'])
	}
	const isVisible = newAtom(true)
	const handleToggle = () => {
		isVisible.modify((value) => !value)
	}
	return (
		<div id={'test'}>
			<button onClick={handleChange}>Change</button>
			<button onClick={handleToggle}>
				Toggle
				{/*Test: <If name={'If: Button'} value={isVisible} then={() => 'Hide'} else={() => 'Show'} />*/}
			</button>
			<If
				name={'If: List'}
				value={isVisible}
				then={() => {
					return (
						<For items={items} getKey={(item) => `key: ${item}`}>
							{(item) => {
								return <div>Item: {item}</div>
							}}
						</For>
					)
				}}
			/>
		</div>
	)
}

render(<Test />, document.getElementById('root'))

// const fragment = document.createDocumentFragment()
// const first = document.createTextNode('first')
// console.log('first parent', first.parentNode)
// fragment.append(first, document.createTextNode('second'))
// console.log('first parent', first.parentNode)
// const root = document.getElementById('root')
// root?.append(fragment)
// console.log('first parent', first.parentNode)
// console.log('fragment children', Array.from(fragment.children))
// // fragment.append(document.createTextNode('third'))
// // console.log('fragment children', Array.from(fragment.children))
// console.log('first child', fragment.firstChild)
// // root?.removeChild(fragment)
// // root?.removeChild(fragment)

// console.log('ATTRIBUTE_NODE', Node.ATTRIBUTE_NODE)
// console.log('CDATA_SECTION_NODE', Node.CDATA_SECTION_NODE)
// console.log('COMMENT_NODE', Node.COMMENT_NODE)
// console.log('DOCUMENT_FRAGMENT_NODE', Node.DOCUMENT_FRAGMENT_NODE)
// console.log('DOCUMENT_NODE', Node.DOCUMENT_NODE)
// console.log('DOCUMENT_POSITION_CONTAINED_BY', Node.DOCUMENT_POSITION_CONTAINED_BY)
// console.log('DOCUMENT_POSITION_CONTAINS', Node.DOCUMENT_POSITION_CONTAINS)
// console.log('DOCUMENT_POSITION_DISCONNECTED', Node.DOCUMENT_POSITION_DISCONNECTED)
// console.log('DOCUMENT_POSITION_FOLLOWING', Node.DOCUMENT_POSITION_FOLLOWING)
// console.log('DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC', Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC)
// console.log('DOCUMENT_POSITION_PRECEDING', Node.DOCUMENT_POSITION_PRECEDING)
// console.log('DOCUMENT_TYPE_NODE', Node.DOCUMENT_TYPE_NODE)
// console.log('ELEMENT_NODE', Node.ELEMENT_NODE)
// console.log('ENTITY_NODE', Node.ENTITY_NODE)
// console.log('ENTITY_REFERENCE_NODE', Node.ENTITY_REFERENCE_NODE)
// console.log('NOTATION_NODE', Node.NOTATION_NODE)
// console.log('PROCESSING_INSTRUCTION_NODE', Node.PROCESSING_INSTRUCTION_NODE)
// console.log('TEXT_NODE', Node.TEXT_NODE)
