import { ShowModalConfig } from '../types/WModal';
import { UseEvents } from './src/decorator';
import { WTIModal } from './src/modalClass';
import {
  ModalState,
  ReactComponent,
  AnyModalProps,
  UniqueKeyModal,
  UniqueKey,
} from './src/types';
import { Queue } from './src/utils';

const defaultModalControllerConfig: ShowModalConfig = {
  destroyed: true,
  appendDom: document.body,
  queue: false,
  forceShow: false,

  coc: false,
  fixedBody: true,
  center: true,
  containerStyle: {},
  aniConfig: {
    aniName: 'fade-in-linear',
    aniType: 'transition',
  },
  parallelMode: false,
  preloadResource: [],
  preloadResourceFunc: {}
};

@UseEvents()
export class ModalControl {
  private defaultShowModalConfig: ShowModalConfig = defaultModalControllerConfig;

  private activeModalList: Queue<WTIModal> = new Queue(); // 当前显示的 弹窗队列
  private queueModalList: Queue<WTIModal> = new Queue(); // 当前等待的 弹窗队列
  private modalMap: Map<UniqueKeyModal, WTIModal> = new Map(); // 所有弹窗的 map

  public _forceShowModalName = 'forceShowModal';
  private forceShowModalIndex = 0;

  get forceShowModalName(): string {
    while (this.modalMap.has(`${this._forceShowModalName}-${this.forceShowModalIndex}`)) {
      this.forceShowModalIndex++;
    }
    this.forceShowModalIndex++;
    return `${this._forceShowModalName}-${this.forceShowModalIndex}`;
  }

  setDefaultModalConfig(cfg: Partial<ShowModalConfig>) {
    Object.assign(this.defaultShowModalConfig, cfg);
  }

  getSingleDefaultModalConfig(cfg: Partial<ShowModalConfig>) {
    return {
      ...this.defaultShowModalConfig,
      ...cfg,
    };
  }

  createModalIns(
    comp: ReactComponent,
    props: AnyModalProps,
    modalcfg: Partial<ShowModalConfig>,
    uk: UniqueKeyModal,
  ) {
    const WitModalIns = new WTIModal(comp, props, this.getSingleDefaultModalConfig(modalcfg), uk);
    WitModalIns.addEventsListener(
      [
        ModalState.BEFOREINIT,
        ModalState.INITED,
        ModalState.BEFORESHOW,
        ModalState.SHOWED,
        ModalState.BEFORECLOSE,
        ModalState.CLOSED,
        ModalState.BEFOREDESTROY,
        ModalState.DESTROYED,
      ],
      (e) => {
        const target = e.target;
        const { modalCfg, uniqueKey } = target;
        // 关闭
        if (e.type === ModalState.CLOSED) {
          if (modalCfg.destroyed) {
            this.modalMap.delete(uniqueKey);
            target.destory();
          }
          this.onDequeueActiveModalList(target);
        }

        // @ts-ignore
        this.dispatchEvents(e.type, e)
      },
    );
    return WitModalIns;
  }

  /**
   * 设置 唯一 弹窗
   * @param uk 唯一标志
   * @param comp 弹窗
   * @param props 弹窗props
   * @param modalcfg 弹窗配置
   * @returns
   */
  setUniqueModal(
    uk: UniqueKey,
    comp: ReactComponent,
    props: AnyModalProps,
    modalcfg: Partial<ShowModalConfig>,
  ) {
    if (this.modalMap.has(uk)) {
      console.error(
        `The modalname you entered "${uk}" conflicts with the stored, Please "setUniqueModal" again for unique key.`,
      );
      return;
    }
    const handledModal: WTIModal = this.createModalIns(comp, props, modalcfg, uk);
    this.modalMap.set(uk, handledModal);
    return handledModal;
  }

  /**
   * 初始化 WTIModal
   * @param comp
   * @param props
   * @param modalcfg
   * @returns
   */
  initModal(
    comp: ReactComponent,
    props: AnyModalProps = {},
    modalcfg: Partial<ShowModalConfig> = {},
  ) {
    // forceShow 为true 弹窗复用
    if (modalcfg.forceShow) {
      return this.setUniqueModal(this.forceShowModalName, comp, props, modalcfg);
    } else {
      if (this.modalMap.has(comp)) {
        return this.modalMap.get(comp);
      } else {
        const handledModal: WTIModal = this.createModalIns(comp, props, modalcfg, comp);
        this.modalMap.set(comp, handledModal);
        return handledModal;
      }
    }
    this.addEventsListener(ModalState.BEFORECLOSE, () => {});
  }

  /**
   * 添加到 当前显示弹窗队列中
   * @param m
   */
  private onEnqueueActiveModalList(m: WTIModal) {
    if (this.activeModalList.enqueue(m)) {
      m.forceShow()
    }
    
  }

  private onDequeueActiveModalList(m: WTIModal) {
    this.activeModalList.dequeueOfItem(m);
    if (!this.activeModalList.size() && this.queueModalList.size()) {
      this.onEnqueueActiveModalList(this.queueModalList.dequeue());
    }
  }

  private onEnqueueQueueModalList(m: WTIModal) {
    this.queueModalList.enqueue(m);
  }

  private onModalShow(modal: WTIModal) {
    if (!modal.modalCfg.queue) {
      this.onEnqueueActiveModalList(modal);
    } else {
      if (this.activeModalList.size()) {
        this.onEnqueueQueueModalList(modal);
      } else {
        this.onEnqueueActiveModalList(modal);
      }
    }
  }

  /**
   * 显示弹窗，这里注意下 如果forceShow 为true 则会复用
   * @param ukm 唯一标志
   * @param props
   * @param modalCfg
   * @returns
   */
  showModal(
    ukm: UniqueKeyModal,
    props: AnyModalProps = {},
    modalCfg: Partial<ShowModalConfig> = {},
  ) {
    // 弹窗复用
    if (modalCfg.forceShow) {
      const currModal = this.modalMap.get(ukm);
      const multiplexModalComponent =
        typeof ukm === 'string' ? currModal && currModal.component : ukm;
      if (!multiplexModalComponent) {
        console.error(`并没有找到弹窗组件，请检查弹窗名称是否正确，或者弹窗是否已经被销毁。`);
        return;
      }

      const modalIns = this.initModal(multiplexModalComponent, props, modalCfg);
      this.onModalShow(modalIns);
      return modalIns;
    } else {
      const currModal = this.modalMap.get(ukm);

      if (currModal) {
        currModal.setPropsOrShowConfig(props, modalCfg);
        this.onModalShow(currModal);
        return currModal;
      } else {
        if (typeof ukm === 'string') {
          console.error(`并没有找到弹窗组件，请检查弹窗名称是否正确，或者弹窗是否已经被销毁。`);
          return;
        } else {
          const modalIns = this.initModal(ukm, props, modalCfg);
          this.onModalShow(modalIns);
          return modalIns;
        }
      }
    }
  }
}

export const ModalControlIns = new ModalControl();

export namespace WtModal {
  export const ModalController = ModalControl;
}
