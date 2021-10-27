import { ElementChildren, h } from '../src/h'
import { clock, atom } from '@frp-ts/core'

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

const PropertyAttribute = () => {
	const value = newAtom<string>('red')
	const handleClick = () => value.set(value.get() === 'red' ? 'blue' : 'red')
	return (
		<div color={value}>
			{value}
			<div>nested{value}</div>
			<button onClick={handleClick}>click</button>
		</div>
	)
}

// render
const root = document.getElementById('root')
if (root) {
	// const app = (
	// 	<div>
	// 		app
	// 		<span data-foo={'123'}>span with attributes</span>
	// 		<li></li>
	// 		<span style={'color: red'}>span</span>
	// 	</div>
	// )
	// const app = (
	// 	<div>
	// 		<span style={'color: red'}>style: string</span>
	// 		<span style={{ color: 'blue' }}>style: object</span>
	// 		<span draggable={true}>draggable</span>
	// 	</div>
	// )
	root.append(<PropertyAttribute />)
}
