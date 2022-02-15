import { AniConfig, AnyModalProps, EventInfer, EventsCallBack, EventsDispatchCenter, EventsDispatchClass, EventsTypes, LfModalClassComponentImplements, LfModalComponentImplements, MapUniqueKey, ReactComponent, RequiredShowModalConfig, UniqueKey } from '../itypes/index';
import { ModalState, ShowModalConfig } from "../itypes";
import { addClass, AniFactory, classnames, H5ScrollCtrl, isReactClassComponent } from '../utils';
import ReactDom from 'react-dom'
import React, { useReducer, useImperativeHandle, useState, useRef, createRef } from 'react';
import './modalClass.css'
import { useForceUpdate } from './tools';
import { PromiseAwait, PromiseAwaitFunc, UseEvent } from './decorator';
import { defaultShowModalConfig } from './constants';

export interface ModalControlState {
  visible: boolean;
}

export interface ModalControlProps {
  getModalIns?: (ins: LfModalClassComponentImplements) => void,
  closeFunc?: Function
  visible?: boolean
}

export class ModalControllerComponent<T, V> extends React.Component<T, V> {

}

/**
 * Modal 装饰器
 * @param cfg 配置项
 * @param events 
 * @param props 
 * @param isFulfillConfig 
 * @returns 
 */
export function UseLfModal(cfg: ShowModalConfig, events?: EventsDispatchCenter, props?: AnyModalProps, isFulfillConfig: boolean = false) {
  let config: RequiredShowModalConfig
  if (isFulfillConfig) {
    // @ts-expect-error
    config = cfg
  } else {
    config = {
      ...defaultShowModalConfig,
      ...cfg,
      fixedBody: false
    }
  }
  return function(ModalNode: ReactComponent) {
    return UseEvent(events)(class extends ModalControllerComponent<ModalControlProps, ModalControlState> implements LfModalClassComponentImplements {
      config: RequiredShowModalConfig;
      _circleState: ModalState = ModalState.BEFOREINIT;
      maskCont = createRef<HTMLDivElement>()
      wrapperAniCont = createRef<HTMLDivElement>()

      get circleState() {
        return this._circleState
      }

      set circleState(v: ModalState) {
        this._circleState = v
        this.$emit(v)
      }

      get showAniConfig() {
        const { aniConfig, showAniConfig } = this.config
        return showAniConfig || aniConfig || {}
      }

      get closeAniConfig() {
        const { aniConfig, closeAniConfig } = this.config
        return closeAniConfig || aniConfig || {}
      }
      
      show = PromiseAwaitFunc(() => {
        return new Promise<void>(r => {
          this.config.fixedBody && H5ScrollCtrl.disabled()
          this.setState({
            visible: true
          })
          this.aniFactory.showAni(() => {
            r()
          }, this.showAniConfig)
          
        })
      }, 'circleState', [ModalState.BEFORESHOW, ModalState.SHOWED], [ModalState.INITED, ModalState.CLOSED])
      
      close = PromiseAwaitFunc((cfg?: AniConfig) => {
        return new Promise<void>(r => {
          this.aniFactory.hideAni(() => {
            r()
            H5ScrollCtrl.enabled()
            this.setState({
              visible: false
            })
          }, cfg || this.closeAniConfig)
        })
      }, 'circleState', [ModalState.BEFORECLOSE, ModalState.CLOSED], [ModalState.SHOWED])

      constructor(props: any) {
        super(props)
        this.config = config
        this.state = {
          visible: this.props.visible || false
        }

        // 如果是 类组件的话， 就在原型上面 加 closeModal 方法
        if (isReactClassComponent(ModalNode)) {
          ModalNode.prototype.closeModal = this.close.bind(this)
        }
      }

      aniFactory: AniFactory
      componentDidMount() {
        this.props.getModalIns && this.props.getModalIns(this)
        this.circleState = ModalState.INITED
        const _wrapperAniCont = this.wrapperAniCont.current
        if (_wrapperAniCont) {
          // _wrapperAniCont.childNodes.length === 1 ? _wrapperAniCont.childNodes[0] :  _wrapperAniCont
          const finalAniCont: HTMLElement = this.wrapperAniCont.current
          const { aniConfig, showAniConfig, closeAniConfig } = this.config
          this.aniFactory = new AniFactory(finalAniCont, showAniConfig || aniConfig, closeAniConfig || aniConfig)
          // TODO show 的有点多了
          if (this.props.visible) {
            this.show()
          }
        }
      }

      componentWillUnmount(): void {
        this.setState = () => {}
      }

      clickContainer = (e) => {
        if ([ModalState.BEFORESHOW, ModalState.BEFORECLOSE].includes(this.circleState)) {
          e.stopPropagation()
          return
        }
        if (this.config.coc && this.wrapperAniCont.current && !this.wrapperAniCont.current.contains(e.target)) {
          if (typeof this.props.closeFunc === 'function') {
            this.props.closeFunc()
          } else {
            this.close()
          }
        }
      }

      render() {
        const { visible } = this.state
        const { appendDom, containerStyle, center } = config
        const appendBody = appendDom === document.body
        return (
          <div
            className={classnames("lf-modal-container", { show: visible })}
            style={Object.assign(
              {
                position: appendBody ? "fixed" : "absolute",
              },
              containerStyle
            )}
            ref={this.maskCont}
            onClick={this.clickContainer}
          >
            <div
              className={classnames("modal-body-container", {
                "modal-center": center,
              })}
              ref={this.wrapperAniCont}
            >
              <ModalNode
                {...this.props}
                {...props}
              />
            </div>
          </div>
        )
      }
    })
  }
}

/**
 * LfModal
 */
@UseEvent()
export class LfModalComponent implements LfModalComponentImplements {
  config: RequiredShowModalConfig
  props: AnyModalProps
  component: ReactComponent
  LfModalComponentIns: LfModalClassComponentImplements
  wrapperCont: HTMLElement // render HTMLElement
  _state: ModalState = ModalState.INITED
  uniqueKey?: MapUniqueKey;
  inQueue: boolean = false // 默认false

  get event(): EventInfer {
    return {
      type: this.state,
      maskCont: this.LfModalComponentIns?.maskCont.current,
      wrapperAniCont: this.LfModalComponentIns?.wrapperAniCont.current,
      target: this
    }
  }

  set event(v: any) {}

  get state(): ModalState {
    return this._state
  }

  set state(v: ModalState) {
    this._state = v
    // 触发事件
    this.$emit(v)
  }

  constructor(com: ReactComponent, props: AnyModalProps, config: RequiredShowModalConfig, uniqueKey: MapUniqueKey) {
    this.config = config
    this.props = props
    this.component = com
    this.uniqueKey = uniqueKey
  }

  setProps(props: AnyModalProps) {
    Object.assign(this.props, props)
  }

  /**
   * 设置showModalConfig
   * @param cfg 
   */
  setShowConfig(cfg: ShowModalConfig) {
    Object.assign(this.config, cfg)
  }

  setPropsOrShowConfig(props: AnyModalProps = {}, cfg: ShowModalConfig = {}, isRerender: boolean = true) {
    if (cfg.appendDom !== this.config.appendDom && cfg.appendDom && this.wrapperCont) {
      cfg.appendDom.appendChild(this.wrapperCont)
    }
    Object.assign(this.props, props)
    Object.assign(this.config, cfg)
    isRerender && this.LfModalComponentIns?.forceUpdate()

  }

  @PromiseAwait<ModalState>('state', [ModalState.BEFORESHOW, ModalState.SHOWED], [ModalState.INITED, ModalState.CLOSED])
  showModal(props?: AnyModalProps, showConfig?: ShowModalConfig) {
    return new Promise<void>(async (resolve) => {
      this.setPropsOrShowConfig(props, showConfig)
      console.log(!!this.LfModalComponentIns)
      if (!this.LfModalComponentIns) {
        const wrapperCont = this.wrapperCont = document.createElement('div')
        const wrapperContParent = this.config.appendDom
        addClass(wrapperCont, 'lf-modal-wrapper')
        wrapperContParent.appendChild(wrapperCont)
        // 让component 有着自己的 事件调度器吧
        const FtComp = UseLfModal(this.config, null, this.props, true)(this.component)
        try {
          Promise.resolve().then(() => {
            ReactDom.render(
              <FtComp
                getModalIns={(r)=> {
                  this.LfModalComponentIns = r
                }}
                closeFunc={this.closeModal.bind(this)}
              />
            , wrapperCont, async () => {
              await this.LfModalComponentIns?.show()
              resolve()
            })
          })
        } catch (e) {
          console.error('render Errpr:', e)
        }
      } else {
        await this.LfModalComponentIns.show()
        resolve()
      }
    })
  }

  @PromiseAwait('state', [ModalState.BEFORECLOSE, ModalState.CLOSED], [ModalState.SHOWED])
  closeModal(closeConfig?: AniConfig) {
    return new Promise<void>(async(r) => {
      if (this.LfModalComponentIns) {
        await this.LfModalComponentIns.close(closeConfig)
      }
      r()
    })
  }
}