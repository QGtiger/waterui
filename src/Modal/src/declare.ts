import { EventInfer, EventsCallBack, EventsDispatchCenter, EventsTypes } from '../itypes';

declare module './modalClass' {

  interface LfModalComponent {
    _events: EventsDispatchCenter,
    $on: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $once: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $off: (type?: EventsTypes | Array<EventsTypes>, func?: EventsCallBack) => void,
    $emit: (type: EventsTypes | Array<EventsTypes>, event?: EventInfer) => void
  }

  interface ModalControllerComponent<T, V> {
    _events: EventsDispatchCenter,
    $on: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $once: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
    $off: (type?: EventsTypes | Array<EventsTypes>, func?: EventsCallBack) => void,
    $emit: (type: EventsTypes | Array<EventsTypes>, event?: EventInfer) => void
  }

}
