import { EventInfer, EventsCallBackType } from './../itypes/index';
import { EventsCallBack, EventsDispatchCenter, EventsDispatchClass, EventsTypes } from "../itypes";

export function PromiseAwaitFunc<T>(func, propertyName: string, propertyValue: T[], allowedValue?: T[]) {
  return function(...args: any[]) {
    const currPropertyValue = this[propertyName]
    const beforePropertyValue = propertyValue[0]
    const afterPropertyValue = propertyValue[1]
    if (currPropertyValue === beforePropertyValue) {
      console.error(`await for promise's callback.`)
      return
    }
    if (allowedValue && !allowedValue.includes(currPropertyValue)) {
      console.error('弹窗当前生命周期:', currPropertyValue)
      return
    }
    this[propertyName] = beforePropertyValue
    return func.apply(this, args).then(() => {
      this[propertyName] = afterPropertyValue
    })
  }
}

export function PromiseAwait<T>(propertyName: string, propertyValue: T[], allowedValue?: T[]) {
  return function(target: any, property: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value
    descriptor.value = async function(...args: any[]) {
      const currPropertyValue = this[propertyName]
      const beforePropertyValue = propertyValue[0]
      const afterPropertyValue = propertyValue[1]
      if (currPropertyValue === beforePropertyValue) {
        console.error(`the ${property} is not promise call back.`)
        return
      }
      if (allowedValue && !allowedValue.includes(currPropertyValue)) {
        console.error('something for everything is bad:', currPropertyValue)
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

export function UseEvent(events?: EventsDispatchCenter) {
  return function<T extends { new(...args: any[]): {} }>(Target: T) {
    return class extends Target implements EventsDispatchClass {
      _events: EventsDispatchCenter = events || Object.create(null)
      event: EventInfer;
      constructor(...args: any) {
        super(...args)
        // this._events = events || Object.create(null)
      }
  
      $on(type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) {
        if (Array.isArray(type)) {
          type.map(t => {
            this.$on(t, func, thisObj)
          })
        } else {
          (this._events[type] || (this._events[type] = [])).push({
            call: func,
            thisObj: thisObj
          })
        }
      }
  
      $once(type: EventsTypes | EventsTypes[], func: EventsCallBack, thisObj?: any) {
        const on = () => {
          this.$off(type, on)
          // @ts-ignore
          func.apply(thisObj, arguments)
        }
        this.$on(type, on)
        return this
      }
  
      $off (type?: EventsTypes | EventsTypes[] | undefined, func?: EventsCallBack | undefined) {
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
            this.$off(t, func)
          })
          return this
        }
        const cbs = this._events[type]
        if (!cbs || !cbs.length) {
          return this
        }
        if (!func) {
          this._events[type] = []
          return this
        }
        let i = cbs.length
        while(i--) {
          const cb = cbs[i]
          if (cb.call === func) {
            cbs.splice(i, 1)
            break
          }
        }
        return this
      }
  
      $emit(type: EventsTypes | EventsTypes[], event?: EventInfer)  {
        if (Array.isArray(type)) {
          type.map(t => {
            this.$emit(t, event)
          })
          return this
        }
        const cbs = this._events[type]
        if (cbs && cbs.length) {
          cbs.map((item: EventsCallBackType) => {
            const _this = item.thisObj || this
            item.call.apply(_this, [event || this.event])
          })
        }
      }
    }
  }
}

