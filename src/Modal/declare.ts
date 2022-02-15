import { EventInfer } from './itypes/index';
import { EventsCallBack, EventsDispatchCenter, EventsTypes } from './itypes';

declare module './index' {
  interface ModalController {
    _events: EventsDispatchCenter,
    $on: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $once: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $off: (type?: EventsTypes | Array<EventsTypes>, func?: EventsCallBack) => void,
    $emit: (type: EventsTypes | Array<EventsTypes>, event?: EventInfer) => void
  }

  interface EventsControl {
    _events: EventsDispatchCenter,
    $on: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $once: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $off: (type?: EventsTypes | Array<EventsTypes>, func?: EventsCallBack) => void,
    $emit: (type: EventsTypes | Array<EventsTypes>, event?: EventInfer) => void
  }
}
