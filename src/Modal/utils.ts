import { CSSProperties } from "react";
import { AniConfig } from "./itypes";

/**
 * classnames 简化版本
 * @returns 
 */
 export function classnames(...args: Array<any>) {
  // var args = Array.prototype.slice.call(arguments)
  var classList:Array<string> = []
  args.forEach(function(item){
    if (typeof item === 'object') {
      for(var k in item) {
        var kv = item[k]
        if (kv) {
          classList.push(k)
        }
      }
    } else if (typeof item === 'string') {
      classList.push(item)
    }
  })
  return classList.join(' ')
}

/**
 * 判断是否是 类组件还是方法组件
 * @param Component 
 * @returns 
 */
export function isReactClassComponent(Component:any) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

var whitespaceRE = /\s+/

/**
 * 添加 Dom class
 * @param {Element} el 
 * @param {String} cls 
 * @returns 
 */
export function addClass(el:HTMLElement, cls:string) {
  if (!el) {
    console.error(`can't add class ${cls} from undefined`)
    return
  }
  if (!cls || !(cls = cls.trim())) {
    return
  }
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) {
        return el.classList.add(c);
      });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * 移除Dom class
 * @param {Element} el 
 * @param {String} cls 
 * @returns 
 */
export function removeClass(el:HTMLElement, cls:string) {
  if (!el) {
    console.error(`can't remove class ${cls} from undefined`)
    return
  }
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) {
        return el.classList.remove(c);
      });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/**
 * 设置 Dom 内联样式
 * @param {Element} el 
 * @param {Object} styles 
 * @returns 
 */
export function setStyles (el:HTMLElement, styles: CSSProperties) {
  if (!el) {
    console.error(`can't set styles from undefined`)
    return
  }
  if (!styles) return
  var stylesKeys = Object.keys(styles)
  if (stylesKeys.length) {
    stylesKeys.forEach(function (item: any) {
      el.style[item] = styles[item]
    })
  }
}

/**
 * 添加事件
 * @param {Element} element 
 * @param {String} type 
 * @param {Function} callback 
 */
 export function addHandler(element: any, type:string, callback:Function) {
  if (!element) {
    console.error(`can't addHandler ${type} from undefined`)
    return
  }
  if (element.addEventListener) {
      if (type.slice(0,2) === 'on') type = type.slice(2)
      element.addEventListener(type, callback, false)
  } else {
      if (type.slice(0,2) !== 'on') type = 'on' + type
      element.attachEvent(type, callback)
  }
}

/**
 * remove 事件
 * @param {Element} element 
 * @param {String} type 
 * @param {Function} callback 
 */
export function removeHandler(element: any, type:string, callback:Function) {
  if (!element) {
    console.error(`can't removeHandler ${type} from undefined`)
    return
  }
  if (element.addEventListener) {
      if (type.slice(0,2) === 'on') type = type.slice(2)
      element.removeEventListener(type, callback, false)
  } else {
      if (type.slice(0,2) !== 'on') type = 'on' + type
      element.datachEvent(type, callback)
  }
}

/**
 * H5 页面的 防止滚动
 */
export const H5ScrollCtrl = (function () {
  let isLockScroll = false // 是否已经锁定了
  let scrollCont = document.body;
  let currScrollTop = 0;
  return {
    disabled() {
      if (isLockScroll) return
      isLockScroll = true
      const html = document.getElementsByTagName("html")[0];
      // 判断是不是 html在 滚动
      if (html.scrollTop) {
        scrollCont = html;
      }
      const scrollTop = scrollCont.scrollTop;
      currScrollTop = scrollTop;

      scrollCont.style.overflow = "hidden";
      scrollCont.style.touchAction = "none";
      scrollCont.style.top = `-${scrollTop}px`;
      scrollCont.style.position = "fixed";
      setStyles(scrollCont, {
        left: 0,
        right: 0
      })
    },
    enabled() {
      if (!isLockScroll) return
      isLockScroll = false
      scrollCont.style.overflow = "";
      scrollCont.style.touchAction = "auto";
      scrollCont.style.position = "static";
      scrollCont.scrollTop = currScrollTop;
      scrollCont.style.top = "auto";
      setStyles(scrollCont, {
        left: 'auto',
        right: 'auto'
      })
    },
  };
})();

/**
 * 队列
 */
 export class Queue<T> {
  private items: any[]
  constructor() {
    // 存储数据
    this.items = [];
  }

  enqueue(item: T) {
    if (!item) return
    // 入队
    this.items.push(item);
  }

  /**
   * 插队
   */
  insertQueue(item: T, index?: number) {
    if (index === undefined && index === -1) {
      this.items.splice(this.items.length, 0, item)
    } else {
      this.items.splice(index, 0, item)
    }
    return this
  }

  dequeueOfItem(item: T): T {
    const i = this.items.indexOf(item)
    if (i == -1) return
    return this.items.splice(i, 1)[0]
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


/**
 * 简单的使用 requestAnimationFrame 方法做定时器
 * @param fn 
 * @param delay 
 * @returns 
 */
 export function setTimeoutFunc(fn:Function, delay=1000) {
  let lt = 0
  let requestId: number
  let remainTime = 0
  const final = {
    start: function() {
      const now = Date.now()
      requestId = requestAnimationFrame(this.start.bind(this))
      if (now - lt < 100)  {
        remainTime += (now-lt)
        if (remainTime >= delay) {
          fn()
          cancelAnimationFrame(requestId)
          return
        }
      }
      lt = now
    },
    stop: function() {
      cancelAnimationFrame(requestId)
    }
  }
  final.start()
  return final
}



interface AniFactoryConfigInfer {
  transitionProp: 'transition'
  animationProp: 'aniamtion'
  transitionEndEvent: string,
  animationEndEvent: string
  getTimeout: Function
  getTransitionInfo: Function
  whenTransitionEnd: Function
}

type AniFactoryType = 'transition' | 'animation'

export const AniFactoryConfig = (function() {

  var transitionProp = 'transition' // transiton 动画
  var animationProp = 'animation' // animation 动画
  var transitionEndEvent = 'transitionend'; // transitionend 事件 用于动画结束的时候去除动画 class
  var animationEndEvent = 'animationend'; // animationend 事件 用于动画结束的时候去除动画 class
  
  // 以下是兼容浏览器方法。
  if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
  ) {
      transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
  ) {
    animationEndEvent = 'webkitAnimationEnd';
  }

  /**
   * 转化成 number 毫秒
   * @param s 
   * @returns 
   */
  function toMs(s: string) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  /**
   * 获取一段动画的 timeout 时间节点
   * @param delays 
   * @param durations 
   * @returns 
   */
  function getTimeout(delays: Array<string>, durations: Array<string>) {
    while (delays.length < durations.length) {
      delays = delays.concat(delays)
    }

    return Math.max.apply(null, durations.map((curr, index) => {
      return toMs(curr) + toMs(delays[index])
    }))
  }

  // 获取当前动画的信息，如delay duration
  function getTransitionInfo(el: HTMLElement, expectedType: AniFactoryType) {
    var styles = window.getComputedStyle(el)

    var type = expectedType // 默认值
    var timeout = 0
    var propCount = 0
    
    if (expectedType === 'animation') {
      var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ')
      var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ')
      var animationTimeout = getTimeout(animationDelays, animationDurations)
      if (animationTimeout > 0) {
        timeout = animationTimeout
        propCount = animationDurations.length
      }
    } else {
      var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ')
      var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ')
      var transitionTimeout = getTimeout(transitionDelays, transitionDurations)
      if (transitionTimeout > 0) {
        timeout = transitionTimeout
        propCount = transitionDurations.length
      }
    }

    return {
      type: type, // 当前动画类型，是transiton 动画 还是 animation动画
      timeout: timeout,
      propCount: propCount
    }
  }

  // 以下是重要代码，是在动画结束的时候，执行回调function
  function whenTransitionEnd (el: HTMLElement, expectedType: AniFactoryType, cb?: Function) {
    var ref = getTransitionInfo(el, expectedType)
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    var event = expectedType === transitionProp ? transitionEndEvent : animationEndEvent;
    var runOnce = true
    var end = function () {
        el.removeEventListener(event, end)
        if (runOnce) {
          runOnce = false
          cb && cb();
        }
    };
    el.addEventListener(event, end);
    setTimeout(function () {
      end()
    }, timeout + 1);
  }

  return {
    transitionProp,
    animationProp,
    transitionEndEvent,
    animationEndEvent,
    getTimeout,
    getTransitionInfo,
    whenTransitionEnd
  }
})()

/**
 * 结合transition 和 animation 的 动画工厂
 */
export class AniFactory {
  target: HTMLElement
  isStartDisplayNone: boolean // 是否开始的时候就是 display none
  showAniCfg: AniConfig
  closeAniCfg: AniConfig

  /**
   * 
   * @param target 目标Dom
   * @param scfg show
   * @param ccfg close
   */
  constructor(target: HTMLElement, scfg: AniConfig = {}, ccfg:AniConfig = {}) {
    this.target = target
    this.showAniCfg = scfg
    this.closeAniCfg = ccfg
    this.isStartDisplayNone = getComputedStyle(target).display === 'none'
  }

  // clearAllAniCls() {
  //   const {target, aniCls} = this
  //   removeClass(target, `${aniCls} ${aniCls}-enter ${aniCls}-leave ${aniCls}-enter ${aniCls}-leave-to ${aniCls}-enter-active ${aniCls}-leave-active`)
  // }

  showAni(cb: Function = () => {}, aniCfg?: AniConfig) {
    return new Promise<void>(r => {
      const {target, showAniCfg, isStartDisplayNone} = this
      const finalConfig = aniCfg || showAniCfg
      const { aniName: aniCls = '', aniType } = finalConfig
      if (aniType === 'animation') {
        isStartDisplayNone && (target.style.display = 'block')
        addClass(target, `${aniCls} ${aniCls}-enter`)
        AniFactoryConfig.whenTransitionEnd(target, aniType, () => {
          cb && cb()
          r()
        })
      } else {
        var showStartClsName = aniCls + '-enter'
        var showActiveClsName = aniCls + '-enter-active'

        addClass(target, showStartClsName)
        isStartDisplayNone && (target.style.display = 'block')
        setTimeoutFunc(() => {
          addClass(target, showActiveClsName)
          setTimeoutFunc(() => {
            removeClass(target, showStartClsName)
            AniFactoryConfig.whenTransitionEnd(target, aniType, function() {
              removeClass(target, showStartClsName + ' ' + showActiveClsName)
              typeof cb === 'function' && cb()
              r()
            })
          }, 10)
        }, 50)
      }
    })
  }

  hideAni(cb: Function = () => {}, aniCfg?: AniConfig) {
    return new Promise(r => {
      const {target, closeAniCfg} = this
      const finalConfig = aniCfg || closeAniCfg
      const { aniName: aniCls = '', aniType } = finalConfig
      if (aniType === 'animation') {
        addClass(target, `${aniCls}-leave`)
        AniFactoryConfig.whenTransitionEnd(target, aniType, cb)
      } else {
        var hiddenStartClsName = aniCls + '-leave-to'
        var hiddenActiveClsName = aniCls + '-leave-active'
        addClass(target, hiddenActiveClsName) // hidden 的动画，就相对简单，只需要加上动画就行了，因为没有 display none 的干扰
        addClass(target, hiddenStartClsName)
        AniFactoryConfig.whenTransitionEnd(target, aniType, function() {
          removeClass(target, hiddenStartClsName + ' ' + hiddenActiveClsName)
          typeof cb === 'function' && cb()
        })
      }
    })
  }
}
