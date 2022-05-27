import { setStyles } from '@lightfish/tools';
import React, { forwardRef, useCallback, useImperativeHandle, useReducer, useRef } from 'react';
import { ReactComponent } from './types';

export function wrapPromise(promise: Promise<any>) {
  let status = 'pending';
  let result: any;
  let suspender = promise.then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      result = e;
    },
  );
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        return result;
      }
    },
  };
}

/**
 * 弹窗阻止冒泡
 * @param e
 */
export const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
};

export function makeObserverComp(Comp: ReactComponent) {
  return React.memo(
    forwardRef((props: any, ref) => {
      const [, fUpdate] = useReducer((s) => s + 1, 0);
      useImperativeHandle(ref, () => ({
        forceUpdate() {
          fUpdate();
        },
      }));
      return <Comp {...props} />;
    }),
  );
}

export function useForceUpdate(Comp: ReactComponent): [any, any] {
  const forceUpdateFunc = useRef<Function>();
  const finalComp = useCallback((props: any) => {
    const [, fUpdate] = useReducer((s) => s + 1, 0);
    forceUpdateFunc.current = fUpdate;
    return <Comp {...props} />;
  }, []);
  return [forceUpdateFunc, finalComp];
}

/**
 * 判断是否是 类组件还是方法组件
 * @param Component
 * @returns
 */
export function isReactClassComponent(Component: any) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

export const H5ScrollCtrl = (function () {
  var isLockScroll = false; // 是否已经锁定了

  var scrollCont = document.getElementsByTagName('html')[0];
  var currScrollTop = 0;
  var count = 0;
  return {
    disabled: function disabled() {
      ++count;
      if (isLockScroll) return;
      isLockScroll = true; // const html = document.getElementsByTagName("html")[0];
      // // 判断是不是 html在 滚动
      // if (html.scrollTop) {
      //   scrollCont = html;
      // }

      var scrollTop = scrollCont.scrollTop;
      currScrollTop = scrollTop;
      scrollCont.style.overflow = 'hidden';
      scrollCont.style.touchAction = 'none';
      // @ts-ignore
      scrollCont.style.top = '-'.concat(scrollTop, 'px');
      scrollCont.style.position = 'fixed';
      setStyles(scrollCont, {
        left: '0',
        right: '0',
      });
    },
    enabled: function enabled() {
      --count;
      if (!isLockScroll || count !== 0) return;
      isLockScroll = false;
      scrollCont.style.overflow = '';
      scrollCont.style.touchAction = 'auto';
      scrollCont.style.position = 'static';
      scrollCont.scrollTop = currScrollTop;
      scrollCont.style.top = 'auto';
      setStyles(scrollCont, {
        left: 'auto',
        right: 'auto',
      });
    },
  };
})();

/**
 * 队列
 */
export class Queue<T> {
  private items: any[];
  constructor() {
    // 存储数据
    this.items = [];
  }

  enqueue(item: T): boolean {
    if (!item) return false;
    if (this.items.indexOf(item) === -1) {
      // 入队
      this.items.push(item);
      return true
    }
    return false
  }

  /**
   * 插队
   */
  insertQueue(item: T, index?: number) {
    if (index === undefined || index === -1) {
      this.items.splice(this.items.length, 0, item);
    } else {
      this.items.splice(index, 0, item);
    }
    return this;
  }

  dequeueOfItem(item: T): T {
    const i = this.items.indexOf(item);
    if (i == -1) return;
    return this.items.splice(i, 1)[0];
  }

  dequeue(): T {
    // 出队
    return this.items.shift();
  }

  head(): T {
    // 获取队首的元素
    return this.items[0];
  }

  tail(): T {
    // 获取队尾的元素
    return this.items[this.items.length - 1];
  }

  clear() {
    // 清空队列
    this.items = [];
  }

  size() {
    // 获取队列的长度
    return this.items.length;
  }

  isEmpty() {
    // 判断队列是否为空
    return this.items.length === 0;
  }
}
