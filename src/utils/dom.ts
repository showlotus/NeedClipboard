type EventFunc = (
  target: Element | Document | Window,
  type: string,
  listener: (ev: Event) => any,
  options?: boolean | AddEventListenerOptions | undefined
) => any

type NoTargetEventFunc = (
  type: string,
  listener: (ev: Event) => any,
  options?: boolean | AddEventListenerOptions | undefined
) => any

export const bindEvent: EventFunc = (target, type, listener, options) => {
  target.addEventListener(type, listener, options)
}

export const unbindEvent: EventFunc = (target, type, listener, options) => {
  target.removeEventListener(type, listener, options)
}

export const bindDocEvent: NoTargetEventFunc = (type, listener, options) => {
  bindEvent(document, type, listener, options)
}

export const unbindDocEvent: NoTargetEventFunc = (type, listener, options) => {
  unbindEvent(document, type, listener, options)
}
