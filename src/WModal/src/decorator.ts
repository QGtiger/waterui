import { Event, EventCallBack, EventCallBackFunc, EventsCallBackCenter, EventsDispatcher, ModalState } from './types/index';

export function UseEvents(events?: EventsCallBackCenter) {
  return function<T extends { new(...args: any[]): {} }>(Target: T) {
    return class extends Target implements EventsDispatcher {
      _events: EventsCallBackCenter = events || Object.create(null)
      // event?: Event
      constructor(...args: any[]) {
        super(...args)
      }

      /**
       * 添加事件
       * @param type 事件名， 可以是 数组形式的
       * @param call 事件回调
       * @param context 事件回调的 this指向
       */
      addEventsListener(type: ModalState | ModalState[], call: EventCallBackFunc, context?: any) {
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
      onceEventsListener(type: ModalState | ModalState[], call: EventCallBackFunc, context?: any) {
        const on = (...args: any[]) => {
          this.removeEventsListener(type, on)
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
      removeEventsListener(type?: ModalState | ModalState[], call?: EventCallBackFunc) {
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
            break
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
      dispatchEvents(type: ModalState | ModalState[], event?: Event)  {
        if (Array.isArray(type)) {
          type.map(t => {
            this.dispatchEvents(t, event)
          })
          return this
        }
        const cbs = this._events[type]
        if (cbs && cbs.length) {
          cbs.map((item: EventCallBack) => {
            const _this = item.context || this
            // @ts-ignore
            item.call.apply(_this, [event || this.event])
          })
        }
      }
    }
  }
}

/**
 * 简便一点
 * @param propertyName 依赖属性name
 * @param propertyValue 前后调用属性值
 * @param allowedValue 允许调用 属性值
 * @returns 
 */
export function PromiseAwait<T>(propertyName: string, propertyValue: T[], allowedValue?: T[]) {
  return function(target: any, property: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value
    descriptor.value = async function(...args: any[]) {
      const currPropertyValue = this[propertyName]
      const beforePropertyValue = propertyValue[0]
      const afterPropertyValue = propertyValue[1]
      if (currPropertyValue === beforePropertyValue) {
        console.error(`当前 Promise 并未 async`)
        return
      }
      if (allowedValue && !allowedValue.includes(currPropertyValue)) {
        console.error('当前并不能调用 state：', currPropertyValue)
        return
      }
      this[propertyName] = beforePropertyValue
      await func.apply(this, args)
      // setTimeout(() => {
      this[propertyName] = afterPropertyValue
      // }, 0)
    }
  }
}