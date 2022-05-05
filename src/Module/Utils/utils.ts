
export function WrapPromiseFunc(func: () => Promise<any>) {
  let status = 'pending';
  let result: any;
  let suspender = null
  let isOverWrite = false;
  let timer = null
  return {
    read() {
      if (!suspender) {
        suspender = func().then(
          (r) => {
            status = 'success';
            result = r;
          },
          (e) => {
            status = 'error';
            result = e;
          },
        );
      }
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        // 多个 read同时执行的时候可能会出错，这里就 加个50的延时吧
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
          if (isOverWrite) {
            isOverWrite = false
            status = 'pending';
            suspender = null
          }
        }, 50)
        return result;
      }
    },
    overWrite() {
      isOverWrite = true
      // status = 'pending';
      // suspender = null
    }
  };
}

/**
 * 弹窗阻止冒泡
 * @param e
 */
export const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
};

/**
 * 判断是否是 类组件还是方法组件
 * @param Component
 * @returns
 */
export function isReactClassComponent(Component: any) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

export function PromiseAwaitFunc<T>(func: Function, executeContext: any, propertyName: string, propertyValue: T[], allowedValue?: T[]) {
  return function(...args: any[]) {
    const currPropertyValue = executeContext[propertyName]
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
    executeContext[propertyName] = beforePropertyValue
    return func.apply(executeContext, args).then((r: any) => {
      executeContext[propertyName] = afterPropertyValue
      return r
    })
  }
}