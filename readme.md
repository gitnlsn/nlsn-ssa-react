[![Build](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/build.yml/badge.svg)](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/build.yml)
[![Tests](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/tests.yml/badge.svg)](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/gitnlsn/nlsn-ssa-react/branch/master/graph/badge.svg?token=0gyw13RlNP)](https://codecov.io/gh/gitnlsn/nlsn-ssa-react)
[![npm version](https://badge.fury.io/js/nlsn-ssa-react.svg)](https://badge.fury.io/js/nlsn-ssa-react)

# Description

Asynchronous events may be triggered almost simultaneously triggering callbacks that changes the same state leading to undesidered states.

This Library provides a react hook that wraps those events in a callback that adds them to a stack. The synchronizeHandle callback will be called over the stack of events at the end of the time lapse passage after the last event.

This way, if those asynchronous events occur almost simultaneouly given a timeLapse, a callback can be defined to decide how to handle that situation managing the callbacks.

Default synchronizeHandle triggers the first event on the stack and ignores the remaining.

# Usage

Install `nlsn-ssa-react` with npm or yarn.

```bash
# npm
npm install nlsn-ssa-react

# yarn
yarn add nlsn-ssa-react
```

Then you can use `SSA` with the following syntax.

```ts
import { renderHook, act } from "@testing-library/react-hooks"
import { useSSA } from "nlsn-ssa-react"

it("using types demo", () => {
  const events = {
    sum: (a: number, b: number) => a + b,
    log: (text: string) => console.log(text),
    mocked: jest.fn(),
    anotherMocked: jest.fn(),
  }

  const { result } = renderHook(() =>
    useSSA({
      events,
      timeLapse: 100,
      synchronizeHandle: (capturedEvents) => {
        if (capturedEvents.length === 0) {
          return
        }

        const firstEvent = capturedEvents[0]

        // At the mean time, we gotta force the type given we know the function name.
        const functionName = firstEvent.id

        switch (functionName) {
          case "log":
            const logProps = firstEvent.props as Parameters<typeof events.log>
            const logCallback = firsetEvent.callback as typeof events.log
            // const logProps: [text: string]
            // const logCallback: (text: string) => void

            logCallback(...logProps)
            break

          case "sum":
            const sumProps = firstEvent.props as Parameters<typeof events.sum>
            const sumCallback = firsetEvent.callback as typeof events.sum
            // const sumProps: [a: any, b: any]
            // const sumCallback: (a: any, b: any) => any

            sumCallback(...sumProps)
            break

          case "mocked":
            const mockedProps = firsetEvent.props as Parameters<
              typeof events.mocked
            >
            const mockedCallback = firstEvent.callback as typeof events.mocked
            // const mockedProps: any
            // const sumCallback: (a: any, b: any) => any

            mockedCallback(...mockedProps)
            break

          case "anotherMocked":
            const anotherMockedProps = firstEvent.props as Parameters<
              typeof events.mocked
            >
            const anotherMockedCallback =
              firsetEvent.callback as typeof events.mocked
            // const mockedProps: any
            // const sumCallback: (a: any, b: any) => any

            anotherMockedCallback(...mockedProps)
            break
        }
      },
    })
  )

  act(() => {
    result.current.mocked()
  })

  act(() => {
    result.current.anotherMocked()
  })

  act(() => {
    jest.runAllTimers()
  })

  expect(events.mocked).toHaveBeenCalledTimes(1)
  expect(events.anotherMocked).toHaveBeenCalledTimes(0)
})
```
