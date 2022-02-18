import React, { CSSProperties, RefObject } from "react";
import { EventsControl } from "..";

/**
 * Modal 的生命周期
 */
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

export type AnyModalProps = {
  [k: string]: any
}

export interface AniModalConfig {
  aniConfig?: AniConfig // animation config 配置
  closeAniConfig?: AniConfig,
  showAniConfig?: AniConfig
}

export type ReactComponent = React.FunctionComponentFactory<any> | React.ComponentClass;

export type AniConfig = {
  aniType?: 'transition' | 'animation',
  aniName?: string,
}

interface BaseModalConfig {
  destroyed?: boolean; // 是否销毁
  appendDom?: HTMLElement; // 添加到 页面dom 中
  coc?: boolean; // click outside close
  fixedBody?: boolean; // 是否 固定背景
  center?: boolean; // 居中
  queue?: boolean; // 队列弹窗
  queueIndex?: number, // 等待队列的 queueIndex 
  forceShow?: boolean, // force for show 弹窗复用
  containerStyle?: CSSProperties
}

/**
 * showModal 配置项
 */
export type ShowModalConfig = BaseModalConfig & AniModalConfig 

export type RequiredShowModalConfig = {
  destroyed: boolean; // 是否销毁
  appendDom: HTMLElement; // 添加到 页面dom 中
  coc: boolean; // click outside close
  fixedBody: boolean; // 是否 固定背景
  center: boolean; // 居中
  queue: boolean; // 队列弹窗
  queueIndex?: number, // 等待队列的 queueIndex 
  forceShow: boolean, // force for show 弹窗复用
  containerStyle?: CSSProperties
} & AniModalConfig

// 事件
export type EventsTypes = 'beforeInit' | 'inited' | 'beforeShow' | 'showed' | 'beforeClose' | 'closed' | 'beforeDestroy' | 'destroyed'

export type EventInfer = {
  type: EventsTypes,
  maskCont: HTMLElement,
  wrapperAniCont: HTMLElement,
  target: LfModalComponentImplements
}

export type EventsCallBack = (e?: EventInfer, ...args: any) => void

export type EventsCallBackType = {
  call: EventsCallBack,
  thisObj?: any
}

export type EventsDispatchCenter = {
  [k: string]: Array<EventsCallBackType>
}

export interface EventsDispatchClass {
  _events: EventsDispatchCenter,
  event?: EventInfer,
  $on: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
  $once: (type: EventsTypes | Array<EventsTypes>, func: EventsCallBack, thisObj?: any) => void,
  $off: (type?: EventsTypes | Array<EventsTypes>, func?: EventsCallBack) => void,
  $emit: (type: EventsTypes | Array<EventsTypes>, event?: EventInfer) => void
}

type EventsDispatchReactComponent = EventsDispatchClass & React.Component

export interface LfModalClassComponentImplements extends EventsDispatchReactComponent {
  show: (props?: AnyModalProps, config?: ShowModalConfig) => Promise<void>,
  close: (config?: AniConfig) => Promise<void>
  circleState: ModalState,
  config: RequiredShowModalConfig,
  props: AnyModalProps,
  maskCont: RefObject<HTMLDivElement>,
  wrapperAniCont: RefObject<HTMLDivElement>
}

export interface LfModalComponentImplements extends EventsControl{
  forceShow: (props?: AnyModalProps, config?: ShowModalConfig) => Promise<void>,
  forceClose: (config?: AniConfig) => Promise<void>
  config: RequiredShowModalConfig,
  props: AnyModalProps
  wrapperCont: HTMLElement,
  uniqueKey?: UniqueKey | InitModalComp,
  inQueue: boolean // 是否在队列中
  forceShowModalName?: UniqueKey,
  setPropsOrShowConfig: (props?: AnyModalProps, config?: ShowModalConfig, isRerender?: boolean) => void
  LfModalComponentIns: LfModalClassComponentImplements
}



export type UniqueKey = string | number

export type InitModalComp = ReactComponent

export type MapUniqueKey = UniqueKey | InitModalComp