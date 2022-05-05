import { CSSProperties } from "react";

export type AniConfig = {
  aniType?: 'transition' | 'animation',
  aniName: string,
}

export type ReactComponent = React.FunctionComponentFactory<any> | React.ComponentClass;

export interface AniModalConfig {
  aniConfig?: AniConfig // animation config 配置
  closeAniConfig?: AniConfig,
  showAniConfig?: AniConfig
}


export type PreLoadType = {
  preloadResource?: string[], // 预加载 资源
  preloadResourceFunc?: {[x: string]: (res: string) => Promise<any>}, // 资源加载器， 默认 配置 others
  parallelMode?: boolean, // 并行加载
  loadingComp?: ReactComponent,
  isLoadingInControl?: boolean, // 是否是 loading 组件控制
  preloadOnce?: boolean // 是否 一个组件 只预加载一次
  // renderPromiseList?: Array<PreloadFunc>, // 渲染 promise 列表
}

export type UseModalConfig = {
  coc: boolean, // click outside close
  fixedBody: boolean, // 是否 固定背景
  center: boolean, // 居中
  containerStyle: CSSProperties, // 外部容器 style 样式
  isOpen: boolean, // 是否打开
} & AniModalConfig;

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

export type modalInsType = {
  modalShow: () => Promise<any>;
  modalHide: () => Promise<any>;
};