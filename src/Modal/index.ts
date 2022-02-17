import { AniConfig, AnyModalProps, InitModalComp, LfModalComponentImplements, MapUniqueKey, ReactComponent, RequiredShowModalConfig, UniqueKey } from './itypes/index';
import { ShowModalConfig } from "./itypes"
import { Queue } from './utils';
// @ts-ignore
import { LfModalComponent } from './src/modalClass.tsx';
import './src/declare'
import './declare'
import { UseEvent } from './src/decorator';
import { defaultShowModalConfig } from './src/constants';
import ReactDOM from 'react-dom'

@UseEvent()
export class ModalController {
  public defaultShowModalConfig: RequiredShowModalConfig = defaultShowModalConfig
  public _forceShowModalName = 'forceShowModal'
  private forceShowModalIndex = 0

  activeModalList: Queue<LfModalComponentImplements> = new Queue() // 当前显示的 弹窗队列
  queueModalList: Queue<LfModalComponentImplements> = new Queue() // 当前等待的 弹窗队列
  modalMap: Map<InitModalComp | UniqueKey, LfModalComponentImplements> = new Map() // 所有弹窗的 map

  get forceShowModalName():string {
    while(this.modalMap.has(`${this._forceShowModalName}-${this.forceShowModalIndex}`)) {
      this.forceShowModalIndex++
    }
    this.forceShowModalIndex++
    return `${this._forceShowModalName}-${this.forceShowModalIndex}`
  }

  constructor() {
  }

  setDefaultModalConfig(cfg: ShowModalConfig) {
    Object.assign(this.defaultShowModalConfig, cfg)
  }

  getRequiredModalConfig(cfg: ShowModalConfig): RequiredShowModalConfig {
    return {
      ...this.defaultShowModalConfig,
      ...cfg
    }
  }

  createModalComponent(comp: InitModalComp, props: AnyModalProps = {}, cfg: ShowModalConfig = {}, uk: MapUniqueKey): LfModalComponentImplements {
    const createdModal: LfModalComponentImplements = new LfModalComponent(comp, props, this.getRequiredModalConfig(cfg), uk)

    // if (createdModal.config.queue) {
    //   this.queueModalList.enqueue(createdModal)
    // } else {
    //   this.activeModalList.enqueue(createdModal)
    // }
    createdModal.$on(['beforeInit', 'inited', 'beforeShow', 'showed', 'beforeClose', 'closed', 'beforeDestroy', 'destroyed'], (e) => {
      this.$emit(e.type, e)
      const currModal = e.target
      if (e.type === 'closed') {
        if (currModal.config.destroyed) {
          this.modalMap.delete(currModal.uniqueKey)
          ReactDOM.unmountComponentAtNode(currModal.wrapperCont)
          currModal.wrapperCont.remove()
          currModal.LfModalComponentIns = null
        }
        this.activeModalList.dequeueOfItem(currModal)
        if (!this.activeModalList.size() && this.queueModalList.size()) {
          const dequeueModal = this.queueModalList.dequeue()
          dequeueModal?.showModal()
        }
      }
      if (e.type === 'showed') {
        
      }
      if (e.type === 'beforeShow') {
        // 确认 等待队列里面的 都会去 activeModal TODO 这里有点小问题，就是 会出现 连续两次 showModal 然后
        if (currModal.inQueue) {
          currModal.inQueue = false
          this.activeModalList.enqueue(this.queueModalList.dequeueOfItem(currModal))
        } else {
          this.activeModalList.enqueue(currModal)
        }
      }
    })
    return createdModal
  }

  setUniqueModal(modalName: UniqueKey, comp: InitModalComp, props: AnyModalProps = {}, cfg: ShowModalConfig = {}): LfModalComponentImplements {
    if (this.modalMap.has(modalName)) {
      console.error(`The modalname you entered "${modalName}" conflicts with the stored, Please "setUniqueModal" again for unique key.`)
      return
    }
    const handledModal: LfModalComponentImplements = this.createModalComponent(comp, props, cfg, modalName)
    handledModal.forceShowModalName = modalName
    this.modalMap.set(modalName, handledModal)
    return handledModal
  }

  /**
   * 初始化 Modal
   * @param comp ReactModal
   * @param props AnyProps
   * @param cfg ShowModalConfig forceShow 强制出现
   * @returns 
   */
  initModal(comp: InitModalComp, props: AnyModalProps = {}, cfg: ShowModalConfig = {}): LfModalComponentImplements {
    if (cfg.forceShow) {
      return this.setUniqueModal(this.forceShowModalName, comp, props, cfg)
    } else {
      if (this.modalMap.has(comp)) {
        return this.modalMap.get(comp)
      } else {
        const handledModal: LfModalComponent = this.createModalComponent(comp, props, cfg, comp)
        this.modalMap.set(comp, handledModal)
        return handledModal
      }
    }
    
  }

  getModalIns(uniquek: MapUniqueKey) {
    const _m = this.modalMap.get(uniquek)
    if (_m) return []
    return [  ]
  }

  /**
   * 显示弹窗
   * @param comp MapUniqueKey
   * @param props AnyModalProps
   * @param cfg ShowModalConfig
   * @returns LfModalComponentImplements
   */
  showModal(comp: MapUniqueKey, props: AnyModalProps = {}, cfg: ShowModalConfig = {}): LfModalComponentImplements {
    let currModal = this.modalMap.get(comp)
    const isUniqueKey = ['string', 'number'].includes(typeof comp)
    if (isUniqueKey) {
      if (currModal) {
        currModal.setPropsOrShowConfig(props, cfg, false)
      } else {
        console.error(`not exist Modal, please enter correct uniqueKey`)
        return
      }
    } else {
      if (currModal && !cfg.forceShow) {
        currModal.setPropsOrShowConfig(props, cfg, false)
      } else {
        // @ts-expect-error TODO 类型分割
        currModal = this.initModal(comp, props, cfg)
      }
    }
    const handledModal = currModal
    const currConfig = handledModal.config
    if (this.activeModalList.size() && currConfig.queue) {
      // activeModal 存在的话，就enqueue 到等到队列中
      handledModal.inQueue = true
      this.queueModalList.insertQueue(handledModal, currConfig.queueIndex)
    } else {
      handledModal.showModal(props, cfg)
    }
    return handledModal 
  }

  closeModal(uniqueKey: ReactComponent | UniqueKey, closeCfg: AniConfig) {
    const currModal = this.modalMap.get(uniqueKey)
    if (!currModal) {
      console.error(`not exist Modal, please enter correct uniqueKey`)
      return
    }
    currModal.closeModal(closeCfg)
  }
}

export const ModalCtrlIns = new ModalController()