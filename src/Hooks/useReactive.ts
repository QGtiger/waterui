import {  
  useRef
} from 'react'
import { useCreation } from './useCreation'
import useUpdate from './useUpdate'
import { isObject } from './utils'

// kv: 原对象:代理后对象
const proxyMap = new WeakMap()
// kv: 代理后对象:原对象
const rawMap = new WeakMap()

function observer<T extends Record<string, any>>(initialValue: T, cb: () => void): T {
  const existedProxy = proxyMap.get(initialValue)
  // 已经代理过了
  if (existedProxy) {
    return existedProxy
  }

  // 代理已经代理过的
  if (rawMap.has(initialValue)) {
    return initialValue
  }

  const proxy = new Proxy<T>(initialValue, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      return isObject(res) ? observer(res, cb) : res
    },

    set(target, key, val) {
      const ret = Reflect.set(target, key, val)
      cb()
      return ret
    },

    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key)
      cb()
      return ret
    }
  })

  proxyMap.set(initialValue, proxy)
  rawMap.set(proxy, initialValue)

  return proxy
}

/**
 * 响应式
 * @param initialState 
 * @returns 
 */
export function useReactive<T extends Record<string, any>>(initialState: T) : T {
  const update = useUpdate()
  const stateRef = useRef<T>(initialState)

  const state = useCreation(() => {
    return observer(stateRef.current, () => {
      update()
    })
  }, [])

  return state
}