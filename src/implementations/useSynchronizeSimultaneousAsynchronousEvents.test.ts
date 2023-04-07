import { renderHook, act } from "@testing-library/react-hooks"
import { useSynchronizeSimultaneousAsynchronousEvents } from "./useSynchronizeSimultaneousAsynchronousEvents"
import { IdentifiedEvent } from "../interfaces/IdentifiedEvent"
import { SynchronizeHandle } from "../interfaces/SynchronizeHandle"

jest.useFakeTimers()

describe("useSynchronizeAsyncEvents", () => {
  afterEach(() => {
    jest.clearAllMocks()
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
        .fn<void, [Array<IdentifiedEvent<string, Function>>]>()
        .mockImplementationOnce((events) =>
          events.forEach((event) => event.callback())
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
