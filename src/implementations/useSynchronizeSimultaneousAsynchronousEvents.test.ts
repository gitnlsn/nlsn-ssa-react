import { renderHook, act } from "@testing-library/react-hooks"
import { useSynchronizeSimultaneousAsynchronousEvents } from "./useSynchronizeSimultaneousAsynchronousEvents"
import { IdentifiedEvent } from "../interfaces/IdentifiedEvent"
import { SynchronizeHandle } from "../interfaces/SynchronizeHandle"

jest.useFakeTimers()

describe("useSynchronizeAsyncEvents", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Usage", () => {
    it("using types demo", () => {
      const events = {
        sum: (a: number, b: number) => a + b,
        log: (text: string) => console.log(text),
        mocked: jest.fn(),
        anotherMocked: jest.fn(),
      }

      const { result } = renderHook(() =>
        useSynchronizeSimultaneousAsynchronousEvents({
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
                const logProps = capturedEvents[0].props as Parameters<
                  typeof events.log
                >
                const logCallback = capturedEvents[0]
                  .callback as typeof events.log
                // const logProps: [text: string]
                // const logCallback: (text: string) => void

                logCallback(...logProps)
                break

              case "sum":
                const sumProps = capturedEvents[0].props as Parameters<
                  typeof events.sum
                >
                const sumCallback = capturedEvents[0]
                  .callback as typeof events.sum
                // const sumProps: [a: any, b: any]
                // const sumCallback: (a: any, b: any) => any

                sumCallback(...sumProps)
                break

              case "mocked":
                const mockedProps = capturedEvents[0].props as Parameters<
                  typeof events.mocked
                >
                const mockedCallback = capturedEvents[0]
                  .callback as typeof events.mocked
                // const mockedProps: any
                // const sumCallback: (a: any, b: any) => any

                mockedCallback(...mockedProps)
                break

              case "anotherMocked":
                const anotherMockedProps = capturedEvents[0]
                  .props as Parameters<typeof events.mocked>
                const anotherMockedCallback = capturedEvents[0]
                  .callback as typeof events.mocked
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
  })

  describe("wrapper to add events to stack", () => {
    it("should handle empty events array", () => {
      expect(() => {
        renderHook(() =>
          useSynchronizeSimultaneousAsynchronousEvents({
            events: {},
            timeLapse: 100,
          })
        )
      }).not.toThrow()
    })

    it("should build synchronized events", () => {
      const { result } = renderHook(() =>
        useSynchronizeSimultaneousAsynchronousEvents({
          events: { foo: jest.fn(), bar: jest.fn() },
          timeLapse: 100,
        })
      )

      expect(result.current).toHaveProperty("foo")
      expect(result.current).toHaveProperty("bar")
    })

    it("should setTimeout with specified timeLapse", () => {
      const setTimeoutSpy = jest.spyOn(global, "setTimeout")

      const events = { first: jest.fn() }

      const { result } = renderHook(() =>
        useSynchronizeSimultaneousAsynchronousEvents({ events, timeLapse: 100 })
      )

      act(() => {
        result.current.first()
      })

      expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.anything(), 100)

      setTimeoutSpy.mockRestore()
    })

    it("should call event after timeout trigger", () => {
      const events = { first: jest.fn() }

      const { result } = renderHook(() =>
        useSynchronizeSimultaneousAsynchronousEvents({ events, timeLapse: 100 })
      )

      act(() => {
        result.current.first()
      })

      act(() => {
        jest.runAllTimers()
      })

      expect(events.first).toHaveBeenCalledTimes(1)
    })

    it("should inject callback props", () => {
      const events = { first: jest.fn() }

      const { result } = renderHook(() =>
        useSynchronizeSimultaneousAsynchronousEvents({ events, timeLapse: 100 })
      )

      act(() => {
        result.current.first("foo", "bar")
      })

      act(() => {
        jest.runAllTimers()
      })

      expect(events.first).toHaveBeenCalledTimes(1)
      expect(events.first).toHaveBeenCalledWith("foo", "bar")
    })

    it("should call custom synchronizeHandle", () => {
      const events = { someEvent: jest.fn() }

      const synchronizeHandle = jest.fn()

      const { result } = renderHook(() =>
        useSynchronizeSimultaneousAsynchronousEvents({
          events,
          timeLapse: 100,
          synchronizeHandle,
        })
      )

      act(() => {
        result.current.someEvent()
      })

      act(() => {
        jest.runAllTimers()
      })

      expect(synchronizeHandle).toHaveBeenCalledTimes(1)
    })

    it("should call custom implementation for synchronizeHandle", () => {
      const events = { someEvent: jest.fn(), otherEvent: jest.fn() }

      const synchronizeHandle = jest
        .fn<void, [Array<IdentifiedEvent<string, (...props: any) => any>>]>()
        .mockImplementationOnce((events) =>
          events.forEach((event) => event.callback(event.props))
        )

      const { result } = renderHook(() =>
        useSynchronizeSimultaneousAsynchronousEvents({
          events,
          timeLapse: 100,
          synchronizeHandle,
        })
      )

      act(() => {
        result.current.someEvent()
      })

      act(() => {
        result.current.otherEvent()
      })

      act(() => {
        jest.runAllTimers()
      })

      expect(events.someEvent).toHaveBeenCalledTimes(1)
      expect(events.otherEvent).toHaveBeenCalledTimes(1)
    })
  })
})
