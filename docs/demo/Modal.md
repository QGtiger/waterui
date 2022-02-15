---
title: Modal
order: 1
nav:
  title: Demo
  order: 2
---

# Modal

> `@lightfish/waterui` 弹窗使用

```jsx
import React from 'react'
import { ModalCtrlIns, UseLfModal } from '@lightfish/waterui'

const a = (props) => {
  return (
    <div>{props.t}</div>
  )
}

// let aa = ModalCtrlIns.initModal(a, {t: 12313123}, {
//   coc: true
// })
// aa.$on(['showed'], function(e){
//   console.log('showed', e)
// })
// setTimeout(() => {
//   aa.closeModal()
// }, 1000)
// aa.showModal(null, {
//   showAniConfig: {
//     aniName: 'fade-in-linear',
//     animation: 'transition'
//   }
// })
// aa.showModal()

@UseLfModal({
    containerStyle: {
      overflow: 'hidden',
      position: 'static',
      background: 'none'
    },
  })
class AA extends React.Component {
  componentDidMount() {
    console.log('AA', this.props, this)
  }
  render() {
    return (
      <div>23333</div>
    )
  }
}

class BB extends React.Component {
  componentDidMount() {
    console.log('componentDidMount')
    // this.aIns.$on('showed', () => {
    //   console.log(123123123123123)
    // })
  }
  render() {
    return (
      <div>
        <AA visible={true} getModalIns={r=>{
          console.log('getModalIns')
          this.aIns=r
          console.log(r)
          this.aIns.$on('inited', () => {
            console.log(123123123123123)
          })
        }} />
      </div>
    )
  }
}

export default () => {
  function showModalTest() {
    const aIns = ModalCtrlIns.setUniqueModal('233', a, {
      t: 1111,
    }, {
      coc: true
    })
    ModalCtrlIns.showModal('233', {
      
    }, {
      closeAniConfig: {
        aniName: 'fade-in-linear'
      }
    })
    ModalCtrlIns.showModal('233', {}, {
      queue: true
    })
  }
  return (
    <div><BB /><p onClick={showModalTest}>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p>  </div>
  )
}
```