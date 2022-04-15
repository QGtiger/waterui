import { UseEvents } from "./src/decorator";
import { ModalState } from "./src/types";

@UseEvents()
export class ModalControl {
  public _forceShowModalName = 'forceShowModal'
  private forceShowModalIndex = 0

  // get forceShowModalName():string {
  //   while(this.modalMap.has(`${this._forceShowModalName}-${this.forceShowModalIndex}`)) {
  //     this.forceShowModalIndex++
  //   }
  //   this.forceShowModalIndex++
  //   return `${this._forceShowModalName}-${this.forceShowModalIndex}`
  // }

  initModal() {
    this.addEventsListener(ModalState.BEFORECLOSE, () => {

    })
  }
}