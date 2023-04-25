import { useRef } from "react"
import { useEffectWithTarget } from "./useEffectWithTarget"
import { BasicTarget, getTargetElement } from "./utils/domtarget"

type noop = (...p: any) => void

type TargetType = BasicTarget<HTMLElement | Element | Window | Document>

type OptionsType<T extends TargetType = TargetType> = {
  target: T,
  capture?: boolean // 是否在 捕获阶段执行
  once?: boolean // 是否至执行一次
  passive?: boolean // 防止默认事件 导致页面卡顿
}

function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options: OptionsType<HTMLElement>
): void
function useEventListener<K extends keyof ElementEventMap>(
  eventName: K,
  handler: (ev: ElementEventMap[K]) => void,
  options: OptionsType<Element>
): void
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (ev: WindowEventMap[K]) => void,
  options: OptionsType<Window>
): void
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (ev: WindowEventMap[K]) => void,
  options: OptionsType<Window>
): void
function useEventListener(eventName: string, handler: noop, options: OptionsType): void

function useEventListener(eventName: string, handler: noop, options: OptionsType){
  const handlerRef = useRef(handler)
  useEffectWithTarget(() => {
    const targetElement = getTargetElement(options.target, window)
    if (!targetElement?.addEventListener) return

    const eventListener = (e: Event) => {
      return handlerRef.current(e)
    }

    targetElement.addEventListener(eventName, eventListener, {
      capture: options.capture,
      once: options.once,
      passive: options.passive
    })

    return () => {
      targetElement.removeEventListener(eventName, eventListener, {
        capture: options.capture
      })
    }
  },
    [options.capture, options.once, options.passive, eventName],
    options.target
  )
}

export default useEventListener

