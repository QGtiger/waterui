import { EventCallBackFunc, EventsCallBackCenter, ModalState } from "./src/types";

declare module './index' {
  interface ModalControl {
    _events: EventsCallBackCenter,
    event?: Event,
    addEventsListener: (type: ModalState | Array<ModalState>, call: EventCallBackFunc, context?: any) => any,
    onceEventsListener: (type: ModalState | Array<ModalState>, call: EventCallBackFunc, context?: any) => any,
    removeEventsListener: (type?: ModalState | Array<ModalState>, call?: EventCallBackFunc) => any,
    dispatchEvents: (type: ModalState | Array<ModalState>, event?: Event) => any
  }
}

declare module './src/modalClass' {
  interface WTIModal {
    _events: EventsCallBackCenter,
    addEventsListener: (type: ModalState | Array<ModalState>, call: EventCallBackFunc, context?: any) => any,
    onceEventsListener: (type: ModalState | Array<ModalState>, call: EventCallBackFunc, context?: any) => any,
    removeEventsListener: (type?: ModalState | Array<ModalState>, call?: EventCallBackFunc) => any,
    dispatchEvents: (type: ModalState | Array<ModalState>, event?: Event) => any
  }
}