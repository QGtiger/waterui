import { Component } from "react"


// 事件
interface Event {
  type: string,
  target?: any,
  data?: any
}

// 事件回调方法
export type EventCallBackFunc = Function

/**
 * 事件回调
 */
export interface EventCallBack {
  call: EventCallBackFunc,
  context: any
}

export type EventsCallBackCenter = {
  [key: string]: Array<EventCallBack>
}

export class EventDispatcher<EventsKeyName extends string> {
  _events: EventsCallBackCenter = Object.create(null)

  /**
   * 添加事件
   * @param type 事件名， 可以是 数组形式的
   * @param call 事件回调
   * @param context 事件回调的 this指向
   */
  addEventsListener(type: EventsKeyName | EventsKeyName[], call: EventCallBackFunc, context?: any) {
    if (Array.isArray(type)) {
      type.map(t => {
        this.addEventsListener(t, call, context)
      })
    } else {
      (this._events[type] || (this._events[type] = [])).push({
        call,
        context
      })
    }
  }

  /**
   * 只会 运行一次，这里注意下， 传入的数组的话，只会运行其中的某一个事件就会清楚
   * @param type 事件名
   * @param call 
   * @param context 
   * @returns 
   */
  onceEventsListener(type: EventsKeyName | EventsKeyName[], call: EventCallBackFunc, context?: any) {
    const on = (...args: any[]) => {
      this.removeEventsListener(type, on)
      // @ts-ignore
      call.apply(context, args)
    }
    this.addEventsListener(type, on)
    return this
  }

  /**
   * 清除事件
   * @param type 
   * @param call 
   * @returns 
   */
  removeEventsListener(type?: EventsKeyName | EventsKeyName[], call?: EventCallBackFunc) {
    if (!type) {
      // 这里 需要需要修改用 delete
      // this._events = Object.create(null)
      for (let k in this._events) {
        delete this._events[k]
      }
      return this
    }
    if (Array.isArray(type)) {
      type.map(t => {
        this.removeEventsListener(t, call)
      })
      return this
    }
    const cbs = this._events[type]
    if (!cbs || !cbs.length) {
      return this
    }
    // 没有 call function 就是 全部清除
    if (!call) {
      this._events[type] = []
      return this
    }
    let i = cbs.length
    while(i--) {
      const cb = cbs[i]
      if (cb.call === call) {
        cbs.splice(i, 1)
        // 万一人家 加了好几次 一个回调， 这个 应该不会有任这样做吧 
        // break
      }
    }
    return this
  }

  /**
   * 派发事件
   * @param type 
   * @param event 
   * @returns 
   */
  dispatchEvents(type: EventsKeyName | EventsKeyName[], event?: any)  {
    if (Array.isArray(type)) {
      type.map(t => {
        this.dispatchEvents(t, event)
      })
      return this
    }
    const cbs = this._events[type]
    if (cbs && cbs.length) {
      cbs.map((item: EventCallBack) => {
        const _this = item.context
        // @ts-ignore
        item.call.apply(_this, [event || this.event])
      })
    }
  }
}

export class EventDispatchComponent<T,V> extends Component<T, V> {
  _events: EventsCallBackCenter = Object.create(null)

  /**
   * 添加事件
   * @param type 事件名， 可以是 数组形式的
   * @param call 事件回调
   * @param context 事件回调的 this指向
   */
  addEventsListener(type: string | string[], call: EventCallBackFunc, context?: any) {
    if (Array.isArray(type)) {
      type.map(t => {
        this.addEventsListener(t, call, context)
      })
    } else {
      (this._events[type] || (this._events[type] = [])).push({
        call,
        context
      })
    }
  }

  /**
   * 只会 运行一次，这里注意下， 传入的数组的话，只会运行其中的某一个事件就会清楚
   * @param type 事件名
   * @param call 
   * @param context 
   * @returns 
   */
  onceEventsListener(type: string | string[], call: EventCallBackFunc, context?: any) {
    const on = (...args: any[]) => {
      this.removeEventsListener(type, on)
      // @ts-ignore
      call.apply(context, args)
    }
    this.addEventsListener(type, on)
    return this
  }

  /**
   * 清除事件
   * @param type 
   * @param call 
   * @returns 
   */
  removeEventsListener(type?: string | string[], call?: EventCallBackFunc) {
    if (!type) {
      // 这里 需要需要修改用 delete
      // this._events = Object.create(null)
      for (let k in this._events) {
        delete this._events[k]
      }
      return this
    }
    if (Array.isArray(type)) {
      type.map(t => {
        this.removeEventsListener(t, call)
      })
      return this
    }
    const cbs = this._events[type]
    if (!cbs || !cbs.length) {
      return this
    }
    // 没有 call function 就是 全部清除
    if (!call) {
      this._events[type] = []
      return this
    }
    let i = cbs.length
    while(i--) {
      const cb = cbs[i]
      if (cb.call === call) {
        cbs.splice(i, 1)
        // 万一人家 加了好几次 一个回调， 这个 应该不会有任这样做吧 
        // break
      }
    }
    return this
  }

  /**
   * 派发事件
   * @param type 
   * @param event 
   * @returns 
   */
  dispatchEvents(type: string | string[], data?: any)  {
    if (Array.isArray(type)) {
      type.map(t => {
        this.dispatchEvents(t, data)
      })
      return this
    }
    const cbs = this._events[type]
    if (cbs && cbs.length) {
      cbs.map((item: EventCallBack) => {
        const _this = item.context
        
        item.call.apply(_this, [{
          type, data
        }])
      })
    }
  }
}