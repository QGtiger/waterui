import { addClass, AniFactory } from "@lightfish/tools";
import { PromiseAwait, UseEvents } from "./decorator";
import { AniModalConfig, AnyModalProps, Event, ModalState, ReactComponent, ShowModalConfig, UniqueKeyModal } from "./types";
import ReactDom from 'react-dom'
import React, { createRef } from "react";
import { makeObserverComp } from "./utils";

/**
 * 动画装饰器
 */
export function UseAni(common: AniModalConfig) {
  return function(Comp: ReactComponent) {
    return class extends React.Component<{
      getAniIns: Function
    }> {
      aniCont = createRef<HTMLDivElement>()
      aniFactory: AniFactory
      constructor(props: any) {
        super(props)
      }

      componentDidMount() {
        const { aniConfig, showAniConfig, closeAniConfig } = common
        this.aniFactory = new AniFactory(this.aniCont.current, showAniConfig || aniConfig, closeAniConfig || aniConfig)
        typeof this.props.getAniIns === 'function' && this.props.getAniIns(this.aniFactory)
      }

      render() {
        return (
          <div ref={this.aniCont}>
            <Comp {...this.props} />
          </div>
        )
      }
    }
  }
}


@UseEvents()
export class WTIModal {
  component: ReactComponent
  props: AnyModalProps
  modalCfg: AnyModalProps
  uniqueKey: UniqueKeyModal
  _state: ModalState = ModalState.INITED
  wrapperCont: HTMLElement
  modalIns: any

  get state() {
    return this._state
  }

  get event(): Event {
    return {
      type: this.state
    }
  }

  set state(v: ModalState) {
    this._state = v
    this.dispatchEvents(v)
  }

  constructor(comp: ReactComponent, props: AnyModalProps, modalCfg: ShowModalConfig, uniqueKey: UniqueKeyModal) {
    this.component = comp
    this.props = props
    this.modalCfg = modalCfg
    this.uniqueKey = uniqueKey
  }

  setProps(props: AnyModalProps) {
    Object.assign(this.props, props)
    this.forceUpdate()
  }

  /**
   * modalCfg reset
   * @param cfg 
   */
  setShowConfig(cfg: Partial<ShowModalConfig>) {
    Object.assign(this.modalCfg, cfg)
  }

  /**
   * 设置 Modal 的 props 和ModalCfg
   * @param props 
   * @param cfg 
   * @param isRerender 
   */
  setPropsOrShowConfig(props: AnyModalProps = {}, cfg: Partial<ShowModalConfig> = {}, isRerender: boolean = true) {
    // if (cfg.appendDom !== this.modalCfg.appendDom && cfg.appendDom) {
    //   cfg.appendDom.appendChild(this.wrapperCont)
    // }
    this.setProps(props)
    this.setShowConfig(cfg)
    // isRerender && this.LfModalComponentIns?.forceUpdate()

  }

  /**
   * 强制更新
   */
  forceUpdate() {
    if (this.modalIns) {
      this.modalIns.forceUpdate()
    }
  }

  @PromiseAwait<ModalState>('state', [ModalState.BEFORESHOW, ModalState.SHOWED], [ModalState.INITED, ModalState.CLOSED])
  forceShow(props?: AnyModalProps, cfg?: Partial<ShowModalConfig>) {
    return new Promise<void>(async (resolve) => {
      this.setPropsOrShowConfig(props, cfg)

      if (this.modalIns) {
        this.modalIns.forceUpdate()
      } else {
        const wrapperCont = this.wrapperCont = document.createElement('div')
        const wrapperContParent = this.modalCfg.appendDom
        addClass(wrapperCont, 'lf-modal-wrapper')
        wrapperContParent.appendChild(wrapperCont)

        try {
          const Component = this.component
          const FtComp = makeObserverComp(() => {
            return (
              <Component
                {...this.props}
              />
            )
          })
          

          Promise.resolve().then(() => {
            ReactDom.render(
              <FtComp
                ref={el => {
                  this.modalIns = el
                }}
              />
            , wrapperCont, async () => {
              // await this.LfModalComponentIns?.show()
              resolve()
            })
          })
        } catch (e) {
          console.error('render Errpr:', e)
        }
      }
    })
  }
}