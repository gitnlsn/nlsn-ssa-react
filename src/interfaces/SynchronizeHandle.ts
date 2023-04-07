import { IdentifiedEvent } from "./IdentifiedEvent"

export type SynchronizeHandle<
  Tag extends string = string,
  CallbackSignature extends Function = Function
> = (events: Array<IdentifiedEvent<Tag, CallbackSignature>>) => void
