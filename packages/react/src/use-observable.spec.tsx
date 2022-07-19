import { Observable } from '@frp-ts/core'
import { useObservable } from './use-observable'
import { constVoid } from '@frp-ts/utils'
import { act, render } from '@testing-library/react'
import React from 'react'
import { newAdapter } from '@frp-ts/test-utils'

interface TestProps<T> {
	readonly source: Observable<T>
	readonly onValue: (value: T) => void
	readonly initial: T
}
function TestComponent<T>(props: TestProps<T>) {
	props.onValue(useObservable(props.source, props.initial))
	return null
}

describe('useObservable', () => {
	it('returns initial value', () => {
		const cb = jest.fn(constVoid)
		const [source] = newAdapter<string>()
		render(<TestComponent source={source} initial={'bar'} onValue={cb} />)
		expect(cb).toHaveBeenLastCalledWith('bar')
	})
	it('subscribes to events', () => {
		const cb = jest.fn(constVoid)
		const [source, next] = newAdapter<string>()
		render(<TestComponent source={source} initial={'initial'} onValue={cb} />)
		cb.mockClear()
		act(() => next('bar'))
		expect(cb).toHaveBeenLastCalledWith('bar')
	})
	it('unsubscribes on unmount', () => {
		const cb = jest.fn(constVoid)
		const [source, next] = newAdapter<string>()
		const tree = render(<TestComponent source={source} onValue={cb} initial={'initial'} />)
		cb.mockClear()
		tree.unmount()
		act(() => next('foo'))
		expect(cb).not.toHaveBeenCalled()
	})
	it('resubscribes on new source', () => {
		const cb = jest.fn(constVoid)
		const [sourceA, nextA] = newAdapter<string>()
		const [sourceB, nextB] = newAdapter<string>()
		const tree = render(<TestComponent source={sourceA} onValue={cb} initial={'initial'} />)
		tree.rerender(<TestComponent source={sourceB} onValue={cb} initial={'initial'} />)
		cb.mockClear()
		act(() => nextA('foo'))
		expect(cb).not.toHaveBeenCalled()
		act(() => nextB('bar'))
		expect(cb).toHaveBeenLastCalledWith('bar')
	})
	it('ignores next "initial"', () => {
		const cb = jest.fn(constVoid)
		const [source] = newAdapter<string>()
		const tree = render(<TestComponent source={source} onValue={cb} initial={'initial'} />)
		cb.mockClear()
		tree.rerender(<TestComponent source={source} onValue={cb} initial={'next'} />)
		expect(cb).toHaveBeenLastCalledWith('initial')
	})
	it('returns last seen value on next "initial"', () => {
		const cb = jest.fn(constVoid)
		const [source, next] = newAdapter<string>()
		const tree = render(<TestComponent source={source} onValue={cb} initial={'initial'} />)
		act(() => next('foo'))
		cb.mockClear()
		tree.rerender(<TestComponent source={source} onValue={cb} initial={'next'} />)
		expect(cb).toHaveBeenLastCalledWith('foo')
	})
})
