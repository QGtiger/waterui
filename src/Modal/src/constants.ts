import { RequiredShowModalConfig } from './../itypes/index';

/**
 * 初始化配置
 */
export const defaultShowModalConfig:RequiredShowModalConfig = {
  destroyed: true,
  appendDom: document.body,
  coc: false,
  fixedBody: true,
  center: true,
  queue: false,
  forceShow: false,
  containerStyle: {},
  aniConfig: {
    aniName: 'slide-top',
    aniType: 'transition'
  }
}