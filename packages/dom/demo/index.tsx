import { Bind, ElementChildren, h, If, render } from '../src'
import { clock, atom, property } from '@frp-ts/core'

const newAtom = atom.newAtom({
	clock: clock.newCounterClock(),
})

const Counter = () => {
	const counter = newAtom(0)
	const increment = () => counter.set(counter.get() + 1)
	return (
		<>
			<div>{counter}</div>
			<button onClick={increment}>increment</button>
		</>
	)
}

interface FooProps {
	readonly children: ElementChildren
}
const Foo = (props: FooProps) => {
	return <div>foo: {props.children}</div>
}

interface AppProps {
	readonly foo: string
	readonly children: ElementChildren
}
export const App = (props: AppProps) => {
	return (
		<div>
			{props.foo}
			{props.children}
			<div>
				counter1: <Counter />
			</div>
			<div>
				counter2: <Counter />
			</div>
			<Foo>{props.children}</Foo>
		</div>
	)
}

function PropertyAttribute() {
	const value = newAtom<string>('red')
	const handleColorClick = () => value.modify((value) => (value === 'red' ? 'blue' : 'red'))
	const showNested = newAtom(false)
	const handleNestedClick = () => showNested.modify((value) => !value)
	return (
		<div>
			<Bind>
				{property.combine(showNested, (showNested) =>
					showNested ? <div>TRUE: {showNested}</div> : <div>FALSE: {showNested}</div>,
				)}
			</Bind>
			{value}
			<button onClick={handleColorClick}>toggle color</button>
			<If value={showNested} then={() => <div>then: {value}</div>} else={() => <div>else</div>} />
			<div>showNested: {value}</div>
			<button onClick={handleNestedClick}>toggle nested</button>
		</div>
	)
}

// render
render(
	<>
		<App foo={'foo'}>Child</App>
		<PropertyAttribute />
	</>,
	document.getElementById('root'),
)
