export interface IdentifiedEvent<
  Tag extends string | number | symbol,
  CallbackSignature extends (...args: any) => any
> {
  id: Tag
  callback: CallbackSignature
  props?: Parameters<CallbackSignature>
}
