[![Build](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/build.yml/badge.svg)](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/build.yml)
[![Tests](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/tests.yml/badge.svg)](https://github.com/gitnlsn/nlsn-ssa-react/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/gitnlsn/nlsn-ssa-react/branch/master/graph/badge.svg?token=0gyw13RlNP)](https://codecov.io/gh/gitnlsn/nlsn-ssa-react)

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
import { useSSA, SynchronizeHandle } from "nlsn-ssa-react"

const customHook = () => {
  const onClick = () => console.log("clicked")
  const onFocus = () => console.log("focus")

  const defaultSynchronizeHandle: SynchronizeHandle = (events) => {
    if (events.length === 0) {
      return
    }

    const firstEvent = events[0]

    firstEvent.callback()
  }

  const { onClick: onClickSynced, onFocus: onFocusSynced } = useSSA({
    timeLapse: 100,
    events: {
      onClick,
      onFocus,
    },
  })

  return {
    // when onFocus and onClick are called simultaneousy
    // under the 100ms time lapse, only the first will be triggered
    onClick: onClickSynced,
    onFocus: onFocusSynced,
  }
}
```
