import { addClass } from '@lightfish/tools';
import {
  AnyModalProps,
  Event,
  ModalState,
  ReactComponent,
  UniqueKeyModal,
} from './types';
import ReactDom from 'react-dom';
import React, { createRef } from 'react';
import {
  makeObserverComp
} from './utils';
import './modalClass.css';
import { UseModal } from '../../UseDecorator/UseModal';
import { UsePreload } from '../../UseDecorator/UsePreLoad';
import { modalInsType, ModalStateStr } from '../../types';
import { ShowModalConfig } from '../../types/WModal';
import { EventDispatcher } from '../../Module/EventsDispatcher';

// @UseEvents()


export class WTIModal extends EventDispatcher<ModalStateStr> {
  component: ReactComponent;
  props: AnyModalProps;
  modalCfg: ShowModalConfig;
  uniqueKey: UniqueKeyModal;
  _state: ModalState = ModalState.INITED;
  wrapperCont: HTMLElement;
  modalIns: any; // 弹窗最外层， 主要应用是 forceUpdate 强制更新
  realModalIns: modalInsType; // 弹窗实例

  get state() {
    return this._state;
  }

  get event(): Event {
    return {
      type: this.state,
      target: this,
    };
  }

  set state(v: ModalState) {
    this._state = v;
    this.dispatchEvents(v);
  }

  constructor(
    comp: ReactComponent,
    props: AnyModalProps,
    modalCfg: ShowModalConfig,
    uniqueKey: UniqueKeyModal,
  ) {
    super()
    this.component = comp;
    this.props = props;
    this.modalCfg = modalCfg;
    this.uniqueKey = uniqueKey;
  }

  destory() {
    this.realModalIns = null;
    this.modalIns = null;
    // TODO 这里 外部还是可以使用 使用 实例对象方法。
    // this.removeEventsListener()
    this.wrapperCont.remove();
    ReactDom.unmountComponentAtNode(this.wrapperCont);
  }

  setProps(props: AnyModalProps) {
    Object.assign(this.props, props);
    this.forceUpdate();
  }

  /**
   * modalCfg reset
   * @param cfg
   */
  setShowConfig(cfg: Partial<ShowModalConfig>) {
    Object.assign(this.modalCfg, cfg);
  }

  /**
   * 设置 Modal 的 props 和ModalCfg
   * @param props
   * @param cfg
   * @param isRerender
   */
  setPropsOrShowConfig(
    props: AnyModalProps = {},
    cfg: Partial<ShowModalConfig> = {},
    isRerender: boolean = true,
  ) {
    // if (cfg.appendDom !== this.modalCfg.appendDom && cfg.appendDom) {
    //   cfg.appendDom.appendChild(this.wrapperCont)
    // }
    this.setProps(props);
    this.setShowConfig(cfg);
    this.forceUpdate()
  }

  /**
   * 强制更新
   */
  forceUpdate() {
    if (this.modalIns) {
      this.modalIns.forceUpdate();
    }
  }

  forceClose() {
    if (!this.realModalIns) {
      console.error('modalIns is not exist');
      return
    }
    return new Promise<void>(async (resolve) => {
      await this.realModalIns.modalHide();
      resolve();
    });
  }

  forceShow(props?: AnyModalProps, cfg?: Partial<ShowModalConfig>) {
    return new Promise<void>(async (resolve, reject) => {
      this.setPropsOrShowConfig(props, cfg);

      if (this.modalIns) {
        // 强制更新
        this.forceUpdate();
        await this.realModalIns.modalShow();
        resolve();
      } else {
        const wrapperCont = (this.wrapperCont = document.createElement('div'));
        const wrapperContParent = this.modalCfg.appendDom || document.body;
        addClass(wrapperCont, 'lf-modal-wrapper');
        wrapperContParent.appendChild(wrapperCont);

        try {
          const Component = UseModal(this.modalCfg)(this.component);
          const PreLoadComponent = UsePreload(this.modalCfg)(Component);

          const FtComp = makeObserverComp(() => {
            return (
              <PreLoadComponent
                getModalIns={async (ins: any) => {
                  this.realModalIns = ins;
                  this.onAsyncState()
                  await this.realModalIns.modalShow();
                  resolve();
                }}
                {...this.props}
              />
            );
          });

          Promise.resolve().then(() => {
            ReactDom.render(
              <FtComp
                ref={(el) => {
                  this.modalIns = el;
                }}
              />,
              wrapperCont,
              async () => {},
            );
          });
        } catch (e) {
          console.error('render Error:', e);
          reject(e);
        }
      }
    });
  }

  onAsyncState() {
    // @ts-ignore
    this.realModalIns.addEventsListener('stateChange', (e) => {
      this.state = e.data;
    })
  }
}
