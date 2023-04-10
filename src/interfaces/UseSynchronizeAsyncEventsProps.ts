import { SynchronizeHandle } from "./SynchronizeHandle"
import { TimeLapse } from "./TimeLapse"

export interface UseSynchronizeAsyncEventsProps<
  EventsObject extends Record<string | number | symbol, (...args: any) => any>
> {
  events: EventsObject
  timeLapse: TimeLapse
  synchronizeHandle?: SynchronizeHandle<
    keyof EventsObject,
    EventsObject[keyof EventsObject]
  >
}
