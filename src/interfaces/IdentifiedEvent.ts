import { EventCallback } from "./EventCallback"
import { Identifier } from "./Identifier"

export interface IdentifiedEvent<
  Tag extends string,
  CallbackSignature extends Function
> {
  id: Identifier<Tag>
  callback: EventCallback<CallbackSignature>
}
