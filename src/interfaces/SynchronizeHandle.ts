import { IdentifiedEvent } from "./IdentifiedEvent"

/**
 * SynchronizeHandle decides how to handle the stacked events
 *
 * Each event in the stack contains:
 * - the event name as `id`
 * - the event executable callback
 * - the props the event was called with
 */
export type SynchronizeHandle<
  Tag extends string | number | symbol,
  CallbackSignature extends (...args: any) => any
> = (events: Array<IdentifiedEvent<Tag, CallbackSignature>>) => void
