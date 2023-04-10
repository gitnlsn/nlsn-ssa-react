import { useCallback, useEffect, useMemo, useState } from "react"
import { IdentifiedEvent } from "../interfaces/IdentifiedEvent"
import { defaultSynchronizeHandle } from "./defaultSynchronizeHandle"
import { UseSynchronizeAsyncEventsProps } from "../interfaces/UseSynchronizeAsyncEventsProps"

/**
 * Asynchronous events (eg. UI events) may be triggered almost simultaneously
 * triggering callbacks that changes the same state leading to undesidered states.
 *
 * This hook wraps those events in a callback that adds them to a stack.
 * The synchronizeHandle callback will be called over the stack of events
 * at the end of the time lapse passage after the last event.
 *
 * This way, if those asynchronous events occur almost simultaneouly given a timeLapse,
 * a callback can be defined to decide how to handle that situation.
 *
 * Default synchronizeHandle triggers the first event on the stack.
 */
export const useSynchronizeSimultaneousAsynchronousEvents = <
  EventsObject extends Record<string | number | symbol, (...args: any) => any>
>({
  events,
  timeLapse,
  synchronizeHandle = defaultSynchronizeHandle,
}: UseSynchronizeAsyncEventsProps<EventsObject>): EventsObject => {
  type CapturedEvent = IdentifiedEvent<string, EventsObject[keyof EventsObject]>

  const [capturedEvents, setCapturedEvents] = useState<Array<CapturedEvent>>([])

  const clearCapturedEvents = useCallback(() => {
    setCapturedEvents([])
  }, [setCapturedEvents])

  const addEvent = useCallback(
    (event: CapturedEvent) => {
      setCapturedEvents((current) => [...current, event])
    },
    [setCapturedEvents]
  )

  // Creates array with add events wrapper
  const synchronizedEvents: EventsObject = useMemo(
    () =>
      Object.keys(events).reduce<EventsObject>((acc, next) => {
        const callback = events[next as keyof EventsObject]
        return {
          ...acc,
          [next as keyof EventsObject]: (...props: any) =>
            addEvent({
              id: next,
              callback,
              props,
            }),
        }
      }, {} as EventsObject),
    [events, addEvent]
  )

  // As soon as an event is added to the queue,
  // a timeout is set to trigger the synchronizeHandle function
  useEffect(() => {
    if (capturedEvents.length > 0) {
      const timeoutId = setTimeout(() => {
        if (capturedEvents.length === 0) {
          console.warn(
            "useSynchronizeAsyncEvents: synchronizeHandle called on empty array of events after ."
          )
          return
        }
        synchronizeHandle(capturedEvents)
        clearCapturedEvents()
      }, timeLapse)

      return () => clearTimeout(timeoutId)
    }
  }, [capturedEvents, clearCapturedEvents])

  return synchronizedEvents
}
