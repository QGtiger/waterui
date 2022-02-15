import React from "react";
import { ModalControllerComponent, UseLfModal } from "./modalClass";


export const Test = UseLfModal({
  destroyed: true,
  appendDom: document.body,
  coc: false,
  fixedBody: true,
  center: true,
  queue: false,
  forceShow: false,
  containerStyle: {},
  aniConfig: {
    aniName: '',
    aniType: 'transition'
  }
})(function() {
  return (
    <div>123</div>
  )
})


@UseLfModal({
  destroyed: true,
  appendDom: document.body,
  coc: false,
  fixedBody: true,
  center: true,
  queue: false,
  forceShow: false,
  containerStyle: {},
  aniConfig: {
    aniName: '',
    aniType: 'transition'
  }
})
class TT extends ModalControllerComponent<any, any> {
  componentDidMount() {
  }
  render() {
    return (
      <div>2</div>
    )
  }
}


export class Test2 extends React.Component {
  render() {
    return (
      <>
        <Test
          getModalIns={(r) => {
          }}
        />
      </>
    )
  }
}