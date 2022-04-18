import { CSSProperties } from "react"
import { WTIModal } from "../modalClass"

export enum ModalState {
  BEFOREINIT = 'beforeInit',
  INITED = 'inited',
  BEFORESHOW = 'beforeShow',
  SHOWED = 'showed',
  BEFORECLOSE = 'beforeClose',
  CLOSED = 'closed',
  BEFOREDESTROY = 'beforeDestroy',
  DESTROYED = 'destroyed'
}

// 事件
export interface Event {
  type: ModalState,
  target: WTIModal
}

// 事件回调方法
export type EventCallBackFunc = (e?: Event) => any

/**
 * 事件回调
 */
export interface EventCallBack {
  call: EventCallBackFunc,
  context: any
}

export type EventsCallBackCenter = {
  [key in ModalState]?: Array<EventCallBack>
}

/**
 * 基本的 事件派生 抽象类
 */
export interface EventsDispatcher {
  _events: EventsCallBackCenter,
  event?: Event,
  addEventsListener: (type: ModalState | Array<ModalState>, call: EventCallBackFunc, context?: any) => any,
  onceEventsListener: (type: ModalState | Array<ModalState>, call: EventCallBackFunc, context?: any) => any,
  removeEventsListener: (type?: ModalState | Array<ModalState>, call?: EventCallBackFunc) => any,
  dispatchEvents: (type: ModalState | Array<ModalState>, event?: Event) => any
}

/**
 * UseModal 配置
 */
export type UseModalConfig = {
  coc: boolean, // click outside close
  fixedBody: boolean, // 是否 固定背景
  center: boolean, // 居中
  containerStyle: CSSProperties, // 外部容器 style 样式
  preloadResource?: string[], // 预加载 资源
  preloadResourceFunc?: {[x: string]: (res: string) => Promise<any>}, // 资源加载器， 默认 配置 others
  parallelMode?: boolean, // 并行加载
} & AniModalConfig

/**
 * modal 显示 配置
 */
export type ShowModalConfig = {
  destroyed: boolean; // 是否销毁
  appendDom: HTMLElement; // 添加到 页面dom 中
  queue: boolean; // 队列弹窗
  forceShow: boolean, // force for show 弹窗复用
} & UseModalConfig

export type AniConfig = {
  aniType?: 'transition' | 'animation',
  aniName: string,
}

export interface AniModalConfig {
  aniConfig?: AniConfig // animation config 配置
  closeAniConfig?: AniConfig,
  showAniConfig?: AniConfig
}

export type ReactComponent = React.FunctionComponentFactory<any> | React.ComponentClass;

export type AnyModalProps = {
  [k: string]: any
}

export type UniqueKey = string

export type UniqueKeyModal = UniqueKey | ReactComponent
