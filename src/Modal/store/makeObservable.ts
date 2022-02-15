import { ReactComponent } from './../itypes/index';
import React, { useReducer, useImperativeHandle } from 'react'
// 用symbol 做一个唯一变量
let _observer_ = Symbol('[[observer]]');

type ObservableCallBackk = (property?: any, value?: any) => void

/**
 * makeObservable
 * @param target any 先简单用any吧
 * @returns 
 */
export function makeObservable(target: any) {
  // 初始化 target 上自己的 _observer_ list
  target[_observer_] = [];

  // 将 handler push 到 唯一数组 target[_observer_]
  target.observe = function(cb: ObservableCallBackk) {
    this[_observer_].push(cb);
  };

  // 用Proxy做代理
  return new Proxy(target, {
    set(target, property, value, receiver) {
      //@ts-ignore 用Reflect 将操作转发给对象
      let success = Reflect.set(...arguments);
      if (success) {
        // 调用所有 handler
        target[_observer_].forEach((cb: ObservableCallBackk) => cb(property, value));
      }
      return success;
    }
  });
}
