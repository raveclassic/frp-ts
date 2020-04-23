# FRP-TS

[![Build Status](https://api.travis-ci.com/raveclassic/frp-ts.svg?bracnh=master)](https://api.travis-ci.com/raveclassic/frp-ts.svg?bracnh=master)
[![Coverage Status](https://coveralls.io/repos/github/raveclassic/frp-ts/badge.svg?branch=master)](https://coveralls.io/github/raveclassic/frp-ts?branch=master)
[![Dependencies](https://david-dm.org/raveclassic/frp-ts.svg)](https://david-dm.org/raveclassic/frp-ts.svg)

## Overview

This library provides an **experimental** `TypeScript` implementation of an "Applicative Data-Driven Computation" described by [Conal Elliot](http://conal.net/) in his [paper](http://conal.net/papers/data-driven/paper.pdf).

Based on and ready to be used with the gorgeous [fp-ts](https://github.com/gcanti/fp-ts).

**Table of contents**

-   [Introduction](#introduction)
    -   [Clock](#clock)
    -   [Getter](#getter)
    -   [Listener](#listener)
    -   [Notifier](#notifier)
    -   [Disposable](#disposable)
    -   [Source & Producer](#source--producer)
-   [Installation & Setup](#installation--setup)

## Introduction

As described in the paper:

> Imperative programs implement data-driven computation using two
> mechanisms: value extraction and change notification. Value extraction allows retrieval of a “current value” (e.g., via an input widget’s access method). Notification allows various states (e.g., an
> output widget) to be updated, making them consistent with newly
> changed values. Our representation of data-driven computations
> encapsulates these two mechanisms, building them in tandem using a familiar set of combinators.

The library core consists of the following pieces:

-   `Getter` - a function for getting the last value from a computation
    ```typescript
    interface Getter<A> {
    	(): A
    }
    ```
-   `Listener` - a callback for receiving update _notifications_ (not values) from a computation
    ```typescript
    interface Listener {
    	(): void
    }
    ```
-   `Disposable` - a function with no arguments that returns nothing that is mainly used to free resources
    ```typescript
    interface Disposable {
    	(): void
    }
    ```
-   `Notifier` - a function for listening for updates in a computation that accepts a `Listener` and returns a `Disposable`
    ```typescript
    interface Notifier {
    	(listener: Listener): Disposable
    }
    ```
-   `Source<A>` - combination of a `Getter<A>` and a `Notifier` which describes a `value that changes over time`
    ```typescript
    interface Source<A> {
    	readonly getter: Getter<A>
    	readonly notifier: Notifier
    }
    ```
-   `Clock` - makes things happen, allows notifications to actually work and deliver updates to listeners
-   `Producer<A>` - combination of a `Source<A>` and a setter to update its value imperatively, requires a `Clock` to work
    ```typescript
    interface Producer<A> {
    	readonly next: (a: A) => void
    	readonly source: Source<A>
    }
    ```

But let's review them one by one and to gain a better understanding of how the things work let's implement a counter.

### `Clock`

Let's start from the `Clock` because it's required for everything else to work. A `Clock` is conceptually a way to get current time of execution. It may be the unix epoch time, the time from start of the program or just an incrementing counter.
`frp-ts` ships a default simple counter clock

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

A `Clock#now` is similar to `Scheduler#now` in [rxjs](https://rxjs.dev/).

Now we can work with producers which we will need for next examples.

### `Getter`

A getter is a way to get the last/current value from the computation, for example the current value of a counter:

```typescript
import { newProducer } from 'frp-ts/lib/producer'
import { newCounterClock } from 'frp-ts/lib/clock'

// We create a producer that will allow us to get values, listen to updates and update its value manually
// As mentioned earlier a `Producer` depends on a `Clock`
// so wee need to pass it directly as part of environment
const counter = newProducer({ clock: newCounterClock() })(0)

// get the last value
console.log(counter.source.getter()) // logs '1'

// let's update the value
counter.next(1)

// get the last value
console.log(counter.source.getter()) // logs '2'
```

A getter is similar to `BehaviorSubject#getValue` in [rxjs](https://rxjs.dev/).

However only a getter is not enough to build reactive computations, we need some way to notify about changes in the counter.

### `Listener`

A listener is just a callback that receives nothing... It may seem strange at first but it is implemented this way intentionally and it will be explained later why (at least I will try).

```typescript
import { Listener } from 'frp-ts/lib/source'
const listener: Listener = () => console.log('I am called!')
```

### `Notifier`

A notifier is a way to tell subscribers/observers/whatever that some value has been changed. It accepts a callback that will be called when the value changes.

```typescript
import { newProducer } from 'frp-ts/lib/producer'
import { newCounterClock } from 'frp-ts/lib/clock'

// we create a producer
const counter = newProducer({ clock: newCounterClock() })(0)

// we create a listener to be notified about updates of our counter
const listener = () => console.log('The value has changed!', counter.source.getter())

// now we need to subscribe to notifications
counter.source.notifier(listener)

// and we're set up
// now let's update the counter
counter.next(1) // logs 'The value has changed! 1'
counter.next(2) // logs 'The value has changed! 2'
```

A notifier is similar to `Observable#subscribe` in [rxjs](https://rxjs.dev/).

### `Disposable`

It's always good to free resources and we should always remember to free them. For this exact purpose a `Notifier` returns a callback which should be called when we are no longer interested in receiving change notification and want to free resources. In other words a `Disposable`.

```typescript
import { newProducer } from 'frp-ts/lib/producer'
import { newCounterClock } from 'frp-ts/lib/clock'

// let's create a counter and a listener
const counter = newProducer({ clock: newCounterClock() })(0)
const listener = () => console.log('The value has changed!', counter.source.getter())

// now we store the output of notifier in a disposable
const dispose = counter.source.notifier(listener)

// try to update the counter
counter.next(1) // logs 'The value has changed! 1'

// now try to free our listener
dispose()

// and try to update the counter once again
counter.next(2) // nothing happens! we've disposed our listener

// but the actual value is still updated
console.log(counter.source.getter()) // logs 2
```

`Disposable` is similar to `Subscription#unsubscribe` in [rxjs](https://rxjs.dev/).

### `Source` & `Producer`

Now we are ready to grasp the most useful parts of the library - `Source` and `Producer`. But wait, we've already seen everything we need in previous examples: how to create producers, how to get and update the values inside them and finally how to listen to that changes.

However it may seem awkward to create a new clock for each producer. That's indeed awkward and generally not should be done. We should always have a single global clock for an application. It may be created as a part of the setup required for some parts of this library including producers - some helpers also require `Clock`. More on that later.

## Installation & Setup

`frp-ts` is available as an `npm` package and requires `fp-ts` as peer dependency:

```
npm install frp-ts fp-ts
```

or

```
yarn add frp-ts fp-ts
```

After installation the library needs to be sort of set up. We need to create an environment for some parts of the library to work. This environment should contain a single global instance of `Clock`. So in general there should be created a module exporting parametrized functions:

```typescript
// /src/utils.ts
import { newCounterClock } from 'frp-ts/lib/clock'
import { newProducer as getNewProducer } from 'frp-ts/lib/producer'
import {
	scan as getScan,
	fromObservable as getFromObservable,
	sample as getSample,
	sampleIO as getSampleIO,
} from 'frp-ts/lib/source'
import { Env } from 'frp-ts/lib/clock'

const e: Env = {
	clock: newCounterClock(),
}
export const newProducer = getNewProducer(e)
export const scan = getScan(e)
export const fromObservable = getFromObservable(e)
export const sample = getSample(e)
export const sampleIO = getSampleIO(e)
```

Now everything is ready, and the functions can be used directly from this module.

## Changelog

Read more [here](./CHANGELOG.md)
