import { addClass, addHandler, AniFactory, H5ScrollCtrl, promiseAwaitFunc } from "@lightfish/tools";
import { PromiseAwait, UseEvents } from "./decorator";
import { AniModalConfig, AnyModalProps, Event, ModalState, ReactComponent, ShowModalConfig, UniqueKeyModal, UseModalConfig } from "./types";
import ReactDom from 'react-dom'
import React, { createRef } from "react";
import { isReactClassComponent, makeObserverComp, onPreloadResource, stopPropagation, wrapPromise } from "./utils";
import './modalClass.css'
import LoadingComp from "../loadingComponent/loading";

function classnames(...args: any[]) {
  var classList = [];
  args.forEach(function (item) {
    if (typeof item === 'object') {
      for (var k in item) {
        var kv = item[k];

        if (kv) {
          classList.push(k);
        }
      }
    } else if (typeof item === 'string') {
      classList.push(item);
    }
  });
  return classList.join(' ');
}

type UseAniType = AniModalConfig & {
  autoAni?: boolean
}

type modalInsType = {
  modalShow: () => Promise<any>,
  modalHide: () => Promise<any>,
}

/**
 * 动画装饰器
 */
export function UseAni(common: UseAniType) {
  return function(Comp: ReactComponent) {
    return class extends React.Component<{
      getAniIns: (ins: AniFactory) => any
    }> {
      aniCont = createRef<HTMLDivElement>()
      aniFactory: AniFactory
      constructor(props: any) {
        super(props)
      }

      componentDidMount() {
        const { aniConfig, showAniConfig, closeAniConfig } = common
        this.aniFactory = new AniFactory(this.aniCont.current, showAniConfig || aniConfig, closeAniConfig || aniConfig)
        console.log('aniFactory =====>>>>>>', this.aniFactory)

        if (common.autoAni) {
          this.aniFactory.showAni()
        }

        typeof this.props.getAniIns === 'function' && this.props.getAniIns(this.aniFactory)
      }

      render() {
        return (
          <div ref={this.aniCont} className="useAni-cont">
            <Comp {...this.props} />
          </div>
        )
      }
    }
  }
}

const defaultUseModalConfig: UseModalConfig = {
  coc: false,
  fixedBody: false,
  center: true,
  containerStyle: {},
  preloadResource: [],
  preloadResourceFunc: {},
  aniConfig: {
    aniName: 'fade-in-linear',
    aniType: 'transition'
  }
}

export function UseModal(cfg: Partial<UseModalConfig>) {
  const finalCfg = Object.assign({}, defaultUseModalConfig, cfg)
  return function(ModalNode: ReactComponent) {
    const UseAniModal = UseAni({
      autoAni: false,
      ...finalCfg
    })(ModalNode)
    return class extends React.Component<{
      onGenerateBodyProps?: () => any,
      onGenerateMaskProps?: () => any,
      getModalIns?: (t: modalInsType) => any
    }, {
      visible: boolean
    }> {
      maskCont = createRef<HTMLDivElement>()
      wrapperAniCont = createRef<HTMLDivElement>()
      aniModalFactory: AniFactory

      constructor(props: any) {
        super(props)
        this.state = {
          visible: props.visible || false
        }

        // 如果是 类组件的话， 就在原型上面 加 closeModal 方法
        if (isReactClassComponent(ModalNode)) {
          ModalNode.prototype.closeModal = this.close.bind(this)
        }
      }

      /**
       * 弹窗显示 promiseAwaitFunc showPromise 完成才会
       * @returns 
       */
      show = promiseAwaitFunc(() => {
        return new Promise<void>(r => {
          finalCfg.fixedBody && H5ScrollCtrl.disabled()
          this.setState({
            visible: true
          })
          this.aniModalFactory.showAni(() => {
            r()
          })
        })
      })

      /**
       * 弹窗关闭
       * @returns 
       */
      close = promiseAwaitFunc(() => {
        return new Promise<void>(r => {
          this.aniModalFactory.hideAni(() => {
            finalCfg.fixedBody && H5ScrollCtrl.enabled()
            this.setState({
              visible: false
            })
            r()
          })
        })
      })

      /**
       * 弹窗实例的 属性
       */
      get modalInsProperties(): modalInsType {
        return {
          modalShow: this.show.bind(this),
          modalHide: this.close.bind(this)
        }
      }

      componentDidMount(): void {
        // 弹簧 实例给 抛出去
        this.props.getModalIns && this.props.getModalIns(this.modalInsProperties)
      }

      render(): React.ReactNode {
        const { visible } = this.state
        const { containerStyle, center } = finalCfg
        return (
          <div
            className={classnames("lf-modal-container", { show: visible })}
            style={containerStyle}
            ref={this.maskCont}
            {...this.props.onGenerateMaskProps && this.props.onGenerateMaskProps()}
          >
            <div
              className={classnames("modal-body-container", {
                "modal-center": center,
              })}
              ref={this.wrapperAniCont}
              {...this.props.onGenerateBodyProps && this.props.onGenerateBodyProps()}
            >
              <UseAniModal
                getAniIns={(aniFactory: AniFactory) => {
                  this.aniModalFactory = aniFactory
                }}
                {...this.props}
              />
            </div>
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
  modalCfg: ShowModalConfig
  uniqueKey: UniqueKeyModal
  _state: ModalState = ModalState.BEFOREINIT
  wrapperCont: HTMLElement
  modalIns: any // 弹窗最外层， 主要应用是 forceUpdate 强制更新
  realModalIns: modalInsType // 弹窗实例

  get state() {
    return this._state
  }

  get event(): Event {
    return {
      type: this.state,
      target: this
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

    // 这里就 简单这里 处理下吧
    setTimeout(() => {
      this.state = ModalState.INITED
    },0 )
  }

  destory() {
    this.realModalIns = null
    this.modalIns = null
    ReactDom.unmountComponentAtNode(this.wrapperCont)
    this.wrapperCont.remove()
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

  /**
   * 初始化 ModalBody 的事件 Props
   * @returns 
   */
  onGenerateBodyProps = () => {
    const preventWhenItsAni = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if ([ModalState.BEFORECLOSE, ModalState.BEFORESHOW].includes(this.state)) {
        e.stopPropagation()
      }
    }
    return {
      onClick: stopPropagation,
      onMouseDown: stopPropagation,
      onMouseUp: stopPropagation,
      onClickCapture: preventWhenItsAni,
      onMouseDownCapture: preventWhenItsAni,
      onMouseUpCapture: preventWhenItsAni
    }
  }

  /**
   * 初始化 ModalMask 的事件 Props
   * @returns 
   */
  onGenerateMaskProps = () => {
    const preventWhenItsAni = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if ([ModalState.BEFORECLOSE, ModalState.BEFORESHOW].includes(this.state)) {
        e.stopPropagation()
      }
    }
    return {
      onClickCapture: preventWhenItsAni,
      onMouseDownCapture: preventWhenItsAni,
      onMouseUpCapture: preventWhenItsAni,
      onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (this.modalCfg.coc) {
          this.forceClose()
        }
      }
    }
  }

  @PromiseAwait('state', [ModalState.BEFORECLOSE, ModalState.CLOSED], [ModalState.SHOWED])
  forceClose() {
    return new Promise<void>(async (resolve) => {
      await this.realModalIns.modalHide()
      resolve()
    })
  }

  @PromiseAwait<ModalState>('state', [ModalState.BEFORESHOW, ModalState.SHOWED], [ModalState.INITED, ModalState.CLOSED])
  forceShow(props?: AnyModalProps, cfg?: Partial<ShowModalConfig>) {
    return new Promise<void>(async (resolve) => {
      this.setPropsOrShowConfig(props, cfg)

      if (this.modalIns) {
        // 强制更新
        this.forceUpdate()
        await this.realModalIns.modalShow()
        resolve()
      } else {
        const wrapperCont = this.wrapperCont = document.createElement('div')
        const wrapperContParent = this.modalCfg.appendDom || document.body
        addClass(wrapperCont, 'lf-modal-wrapper')
        wrapperContParent.appendChild(wrapperCont)

        try {
          const Component = UseModal(this.modalCfg)(this.component)
          const preloadPromise = wrapPromise(onPreloadResource(this.modalCfg.preloadResource, this.modalCfg.parallelMode, this.modalCfg.preloadResourceFunc))
          const FtComp = makeObserverComp(() => {
            preloadPromise.read()
            return (
              <Component
                onGenerateBodyProps={this.onGenerateBodyProps}
                onGenerateMaskProps={this.onGenerateMaskProps}
                getModalIns={async (ins: any) => {
                  this.realModalIns = ins
                  await this.realModalIns.modalShow()
                  resolve()
                }}
                {...this.props}
              />
            )
          })
          

          Promise.resolve().then(() => {
            ReactDom.render(
                <React.Suspense fallback={<LoadingComp />}>
                  <FtComp
                    ref={el => {
                      this.modalIns = el
                    }}
                  />
                </React.Suspense>
            , wrapperCont, async () => {
              
            })
          })
        } catch (e) {
          console.error('render Errpr:', e)
        }
      }
    })
  }
}