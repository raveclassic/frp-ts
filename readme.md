# FRP-TS

[![Build Status](https://travis-ci.com/raveclassic/frp-ts.svg?branch=master)](https://travis-ci.com/raveclassic/frp-ts)
[![Coverage Status](https://coveralls.io/repos/github/raveclassic/frp-ts/badge.svg?branch=master)](https://coveralls.io/github/raveclassic/frp-ts?branch=master)
[![Dependencies](https://david-dm.org/raveclassic/frp-ts.svg)](https://david-dm.org/raveclassic/frp-ts)

## Overview

This library provides an **experimental** `TypeScript` implementation of an "Applicative Data-Driven Computation"
described by [Conal Elliot](http://conal.net/) in his [paper](http://conal.net/papers/data-driven/paper.pdf).

The implementation:

-   is a push-pull model with atomic updates (means it is glitch-free, no [diamond shape problem](https://stackoverflow.com/a/56523673/1961479)).
-   follows [calmm architecture](https://github.com/calmm-js/documentation/blob/master/introduction-to-calmm.md).
-   is based on and is ready to be used with the gorgeous [fp-ts](https://github.com/gcanti/fp-ts).

**Table of contents**

-   [Motivation](#motivation)
-   [Design](#api)
-   [Deep Dive](#deep--dive)
-   [Installation & Setup](#installation--setup)
-   [Integrations](#integrations)
-   [Changelog](#changelog)

## Motivation

Functional reactive programming is hard.
Coming up with a memory-leak-free, glitch-free, straightforward and intuitive implementation is even harder.
The goal of this library is to try to provide users with such implementation balancing between purity and ease of adoption
while still being fully type-safe, correct and `TypeScript`-oriented.

The library describes the concept of a "value-over-time".
Basically it's a value that may change over time and subscribers can listen to updates of that value.
Such values are _not_ described by `Behavior`s as a function of time from classical FRP, but by a mutable reactive `Atom`s.

On the other hand the library doesn't try to replace existing implementations of `Observer` pattern such as [rxjs](https://rxjs.dev/), [most](https://mostcore.readthedocs.io/en/latest/) or others.
Instead, it adopts some advanced FP concepts like `HKT` (higher kinded types) and `tagless final` to allow using properties and atoms with any implementation of `Observable`.
This is where [fp-ts](https://gcanti.github.io/fp-ts/) comes into play, but more on that later.

So if we refer to the paper, it highlights two main concepts for working with reactive data-driven computation: value extraction and change notification:

> Imperative programs implement data-driven computation using two
> mechanisms: value extraction and change notification. Value extraction allows retrieval of a “current value” (e.g., via an input widget’s access method). Notification allows various states (e.g., an
> output widget) to be updated, making them consistent with newly
> changed values.

The rest of the doc describes this API in details.

## Design

The library core consists of the following pieces which are borrowed from [calmm architecture](https://github.com/calmm-js/documentation/blob/master/introduction-to-calmm.md):

-   `Observable`, `Observer` and `Subscription` - the basic building blocks of `Observer`-pattern, which adhere [es-observables](https://github.com/tc39/proposal-observable).

-   `Property` - describes a reactive "value-over-time".
    `Property` extends `Observable` in the way that it _always_ has a value.
    `Property` allows getting its current value while still notifying its subscribers about changes of that value.
    A typical property could describe a value of an `input`, a count of clicks, current date etc.
    This is the main difference from `Observable` which just describes an occurence of some event.

-   `Atom` - describes a mutable reactive "value-over-time".
    `Atom` extends `Property` in the way that is allows mutating current value
    still being capable of everything `Property` is capable of - holding the value and notifying about its changes.

-   `Clock` - internal driver that makes things happen and allows notifications to actually work and updates to be delivered to listeners

## Deep Dive

This section of the doc aims to give a better understanding of how the things work.
So to achieve that we'll build up a simple counter, reviewing all pieces of the design one-by-one.

### `Clock`

Let's start from the `Clock` because it's required for everything else to work.
A `Clock` is conceptually a way to get the current time of the execution.
It may be the unix epoch time, the time from start of the program or just an incrementing counter.
`frp-ts` ships a default simple counter clock:

```typescript
import { newCounterClock } from 'frp-ts/lib/clock'

// we create a new counter clock
const counterClock = newCounterClock()
console.log(counterClock.now()) // logs 0
console.log(counterClock.now()) // logs 1
console.log(counterClock.now()) // logs 2

// or we can create our own clock base on Date
const dateClock = {
	now: () => Date.now(),
}

// or even a "virtual" clock which is "frozen" and requires manual time operation
// such clock may be useful in tests when testing events occurring in the same tick
const virtualClock = {
	time: -1,
	now() {
		return this.time
	},
	next() {
		this.time++
	},
}
```

A `Clock#now` is similar to `rxjs` [Scheduler#now](https://rxjs.dev/api/index/class/Scheduler#now).

Now we can work with `Atom` and `Property`.

### `Atom`

Let's skip `Property` and move straight to `Atom` because essentially `Property` is
just a readonly `Atom` and mutability is required for the next example.
So, `Atom` adds mutability to `Property`. Let's create one:

```typescript
import { newAtom } from 'frp-ts/lib/atom'
import { newCounterClock } from 'frp-ts/lib/clock'

// We create an atom that will allow us to get values, update its value manually and listen to updates.
// As mentioned earlier a `Atom` depends on a `Clock`
// so wee need to pass it directly as part of environment
// Yeah, that's a lot of boilerplate you may say, but more on that later. For now let's just pass the clock and initial value.
const counter = newAtom({ clock: newCounterClock() })(0)

// get the last value
console.log(counter.get()) // logs '0'

// let's manually set the value
counter.set(1)

// get the last value
console.log(counter.get()) // logs '1'

// or we can modify instead of setting
counter.modify((n) => n + 1)

// get the last value
console.log(counter.get()) // logs '2'
```

That's it. Pretty easy, huh? What about updates?

```typescript
// subscribe to updates
counter.subscribe({
	next: () => console.log(`value: ${counter.get()}`),
})

counter.set(3) // logs 'value: 3'
```

We're done but there are two important things about the callback:

-   it is in the form of `Observer`. This is because `frp-ts` implements [es-observables](https://github.com/tc39/proposal-observable) so that it is seemlessly compatible with other implementations. Also there's no support for plain functions as callbacks for the sake of API simplicity.
-   it is _not_ fired on subscription. This is because, although `Atom` (and `Property`) is _similar_ to rxjs [BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject), it is fundamentally different in the way it works - it only notifies subscribers if the value _is changed_.
-   it is _not_ supplied the changed value. This is how `frp-ts` solves glitches (diamond shape problem). There should always be a single source of truth for the value - either it is the callback's argument (like it's done in almost all reactive libraries) or the value of property/atom.

More on this later.

### `Property`

As it was said before that `Property` is a readonly `Atom`, or vice-versa `Atom` is a mutable `Property`, there's actually nothing more to add on `Property`.
Properties are introduced as a way to restrict API.
Sometimes we don't want to expose mutable access to our state and `Property` is a perfect fit for such situations.
Now let's update our counter to restrict arbitrary mutations of its state:

```typescript
// we'll need an interface to describe our counter more precisely
interface Counter extends Property<number> {
	readonly inc: () => void
}

// we'll also need a constructor that takes initial value
const newCounter = (initial: number): Counter => {
	// here we define local mutable state
	// again, we won't need to set up newAtom each time this way, more on this later
	const state = newAtom({ clock: newCounterClock() })(initial)
	// expose readonly API
	const inc = () => state.modify((n) => n + 1)
	return {
		subscribe: state.subscribe,
		get: state.get,
		inc,
	}
}

// now create counter and increment its value
const counter = newCounter(0)
counter.inc()

// note that no there's no direct access to internal mutable state of our counter anymore
```

### `Lens`

Besides being able to hold state and notify about state changes `Atom` is capable of another cool feature - lensing.
Although lenses are not a part of `frp-ts`, `Atom` supports them via an interface.
So `Lens` is a combination of a getter and an immutable setter. Its interface is pretty simple:

```typescript
interface Lens<S, A> {
	readonly get: (s: S) => A
	readonly set: (a: A) => (s: S) => S
}
```

Lenses are extremely powerful when it comes to immutable updates of deeply-nested structure.
Let's try to build some example with lenses.

```typescript
// let's define a nested structure
import { newCounterClock } from 'frp-ts/lib/clock'
import { newAtom, Lens } from 'frp-ts/lib/atom'
interface Person {
	readonly name: string
	readonly age: number
}
// and create a person
const mike = newAtom({ clock: newCounterClock() })({ name: 'Mike', age: 20 })

// now what if we have a user interface that allows changing person's name and age,
// for example a form with two inputs?
// if we want to stay immutable we would need to deal with nesting
// each time we need to update nested value as well as read it:
const setName = (name: string) => (person: Person): Person => ({ ...person, name })
const getName = (person: Person): string => person.name
const setAge = (age: number) => (person: Person): Person => ({ ...person, age })
const getAge = (person: Person): number => person.age

// then somewhere further in some kind of callback
const handleNameChange = (newName: string) => mike.modify(setName(newName))
const handleAgeChange = (newAge: number) => mike.modify(setAge(newAge))

// this would quickly result in a lot of boilerplate
// and here lenses come into play
const nameLens: Lens<Person, string> = {
	get: (person) => person.name,
	set: (name) => (person) => ({ ...person, name }),
}
const ageLens: Lens<Person, number> = {
	get: (person) => person.age,
	set: (age) => (person) => ({ ...person, age }),
}

// now we can call `view` method which returns an `Atom`
// "zoomed" to a field defined by lens
const mikeName = mike.view(nameLens)
// note that subscriptions also work out of the box
mike.subscribe({
	next: () => console.log('mike has changed'),
})
mikeName.subscribe({
	next: () => console.log('name has changed'),
})
console.log(mikeName.get()) // logs 'Mike'
mikeName.set('Patrik') // logs 'mike has changed' and 'name has changed'
console.log(mikeName.get()) // logs 'Patrik'
```

Cool, but that's not all.
As `view` method returns an `Atom`, then we can call `view` multiple times in a chain, and it will result in a "lens composition"!
This means that we can nest reads and writes infinitely in a safe and predictable manner.

`frp-ts` does not ship with any `Lens` implementation leaving it for an external library.
One of them is [monocle-ts](https://gcanti.github.io/monocle-ts/) and you can always build an adapter
around any other implementation which is not compatible with the supported interface.

## Installation & Setup

`frp-ts` is available as an `npm` package and requires `fp-ts` as peer dependency:

```
npm install frp-ts fp-ts
```

or

```
yarn add frp-ts fp-ts
```

After installation the library needs to be sort of set up.
We've already seen that akward creation of `Clock` before we're able to use `newAtom`.
That's indeed awkward and generally not should be done. We should always have a single global clock for an application.
It may be created as a part of the setup required for some parts of this library including producers -
some helpers also require `Clock`.

So We need to create an environment for some parts of the library to work.
This environment should contain a single global instance of `Clock`.
So in general there should be created a module exporting parametrized functions:

```typescript
// /src/utils.ts
import { newCounterClock } from 'frp-ts/lib/clock'
import { newAtom as getNewAtom } from 'frp-ts/lib/atom'
import {
	scan as getScan,
	fromObservable as getFromObservable,
	sample as getSample,
	sampleIO as getSampleIO,
} from 'frp-ts/lib/property'
import { Env } from 'frp-ts/lib/clock'

const e: Env = {
	clock: newCounterClock(),
}
export const newProducer = getNewAtom(e)
export const scan = getScan(e)
export const fromObservable = getFromObservable(e)
export const sample = getSample(e)
export const sampleIO = getSampleIO(e)
```

Now everything is ready, and the functions can be used directly from this module.

## Integrations

### `fp-ts`

The library is deeply integrated with [fp-ts](https://github.com/gcanti/fp-ts/).
It provides an instance of [Applicative](https://gcanti.github.io/fp-ts/modules/Applicative.ts.html) for `Property` and `pipeable` top-level functions.

## Changelog

Read more [here](./CHANGELOG.md)
