import { AniFactory, classnames, H5ScrollCtrl } from "@lightfish/tools";
import React, { createRef } from "react";
import { modalInsType, ModalState, ReactComponent, UseModalConfig } from "../types";
import { UseAni } from "./UseAni";
import { UsePreload } from "./UsePreLoad";
import "./UseModal.css"
import { isReactClassComponent, PromiseAwaitFunc, stopPropagation } from "../Module/Utils/utils";
import { EventDispatchComponent } from "../Module/EventsDispatcher";

const defaultUseModalConfig: UseModalConfig = {
  isOpen: false,
  center: true,
  coc: false,
  cc: false,
  containerStyle: {},
  fixedBody: true,
  aniConfig: {
    aniType: 'animation',
    aniName: 'demo-fade-in'
  }
}

/**
 * 初始化 ModalBody 的事件 Props
 * @returns
 */
const onGenerateBodyProps = (pop: any) => {
  const preventWhenItsAni = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ([ModalState.BEFORECLOSE, ModalState.BEFORESHOW].includes(pop.circleState)) {
      e.stopPropagation();
    }
  };
  return {
    onClick: stopPropagation,
    onMouseDown: stopPropagation,
    onMouseUp: stopPropagation,
    onClickCapture: preventWhenItsAni,
    onMouseDownCapture: preventWhenItsAni,
    onMouseUpCapture: preventWhenItsAni,
  };
};

/**
 * 初始化 ModalMask 的事件 Props
 * @returns
 */
const onGenerateMaskProps = (pop: any, maskClickCb: Function, maskClickCaptureCb: Function=() => {}) => {
  const preventWhenItsAni = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ([ModalState.BEFORECLOSE, ModalState.BEFORESHOW].includes(pop.circleState)) {
      e.stopPropagation();
    } else {
      maskClickCaptureCb(e)
    }
  };
  return {
    onClickCapture: preventWhenItsAni,
    onMouseDownCapture: preventWhenItsAni,
    onMouseUpCapture: preventWhenItsAni,
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      maskClickCb && maskClickCb(e);
    },
  };
};

export function UseModal(useModalCfg: Partial<UseModalConfig>) {
  const finalCfg = Object.assign({}, defaultUseModalConfig, useModalCfg, {
    containerStyle: Object.assign({}, defaultUseModalConfig.containerStyle, useModalCfg.containerStyle)
  })
  return function(ModalNode: ReactComponent) {
    const UseAniModal = UseAni({
      autoAni: false,
      ...finalCfg,
    })(ModalNode);
    return class extends EventDispatchComponent<{
      closeModal: () => void,
      getModalIns: (t: modalInsType) => any,
    }, {
      visible: boolean;
    }> {
      maskCont = createRef<HTMLDivElement>();
      wrapperAniCont = createRef<HTMLDivElement>();
      aniModalFactory: AniFactory;
      _circleState: ModalState = ModalState.INITED;

      constructor(props: any) {
        super(props);
        this.state = {
          visible: finalCfg.isOpen
        }

        // 如果是 类组件的话， 就在原型上面 加 closeModal 方法
        if (isReactClassComponent(ModalNode)) {
          ModalNode.prototype.closeModal = this.modalHide;
        }
      }

      get circleState() {
        return this._circleState
      }

      set circleState(v) {
        if (this._circleState === v) return;
        this._circleState = v;
        this.dispatchEvents(v)
        this.dispatchEvents('stateChange', v)
      }

      /**
       * 弹窗实例的 属性
       */
      get modalInsProperties() {
        return {
          modalShow: this.modalShow.bind(this),
          modalHide: this.modalHide.bind(this),
        };
      }

      componentDidMount(): void {
        // 弹窗操作方法 给 抛出去
        this.props.getModalIns && this.props.getModalIns(this);
        if (finalCfg.isOpen) {
          this.modalShow();
        }
      }

      /**
       * 弹窗显示 promiseAwaitFunc showPromise 完成才会
       * @returns
       */
      modalShow = PromiseAwaitFunc(() => {
        return new Promise<void>((r) => {
          finalCfg.fixedBody && H5ScrollCtrl.disabled();
          this.setState({
            visible: true,
          });
          this.aniModalFactory.showAni(() => {
            r();
          });
        });
      }, this, 'circleState', [ModalState.BEFORESHOW, ModalState.SHOWED], [ModalState.INITED, ModalState.CLOSED]);

      /**
       * 弹窗关闭
       * @returns
       */
      modalHide = PromiseAwaitFunc(() => {
        return new Promise<void>((r) => {
          this.aniModalFactory.hideAni(() => {
            finalCfg.fixedBody && H5ScrollCtrl.enabled();
            this.setState({
              visible: false,
            });
            r();
          });
        });
      }, this, 'circleState', [ModalState.BEFORECLOSE, ModalState.CLOSED], [ModalState.SHOWED]);

      render(): React.ReactNode {
        const { visible } = this.state;
        const { containerStyle, center } = finalCfg;
        const {getModalIns, ...otherProps} = this.props
        return (
          <div
            className={classnames('lf-modal-container', { show: visible })}
            style={containerStyle}
            ref={this.maskCont}
            {...onGenerateMaskProps(this, () => {
              if (finalCfg.coc) {
                this.modalHide()
              }
            }, (e: React.MouseEvent) => {
              if (finalCfg.cc) {
                this.modalHide()
              }
            })}
          >
            <div
              className={classnames('modal-body-container', {
                'modal-center': center,
              })}
              ref={this.wrapperAniCont}
              {...onGenerateBodyProps(this)}
            >
              <UseAniModal
                getAniIns={(aniFactory: AniFactory) => {
                  this.aniModalFactory = aniFactory;
                }}
                closeModal={this.modalHide}
                {...otherProps}
              />
            </div>
          </div>
        )
      } 
    }
  }
}