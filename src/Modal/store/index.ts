import { makeObservable } from "./makeObservable";

type LfStore = {
  activeModal: any,
  queueModal: any
}

export const store: LfStore = {
  activeModal: makeObservable([]),
  queueModal: makeObservable([])
}

store.activeModal.observe((property: string, value: any) => {
  // 数组的 set 会 set两次，一次是修改 length
  if (property !== 'length') {
    console.log('activeModal push', value)
  }
  if (property === 'length' && value === 0) {
    
  }
})

store.queueModal.observe((property: string, value: any) => {
  // 数组的 set 会 set两次，一次是修改 length
  if (property !== 'length') {
    console.log('queueModal push', value)

  }
})