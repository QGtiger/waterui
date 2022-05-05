import { PreLoadType, UseModalConfig } from './index';

/**
 * modal 显示 配置
 */
export type ShowModalConfig = {
  destroyed: boolean; // 是否销毁
  appendDom: HTMLElement; // 添加到 页面dom 中
  queue: boolean; // 队列弹窗
  forceShow: boolean, // force for show 弹窗复用
} & Omit<UseModalConfig, 'isOpen'> & PreLoadType