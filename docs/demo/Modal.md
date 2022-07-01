---
title: Modal
order: 1
nav:
  title: Demo
  order: 2
---

# Modal

> `@lightfish/waterui` 弹窗使用.
### showModal

> 其中主要使用的是实例对象 `ModalControlIns` 上面的 `showModal` 方法，其中 showModal 入参有三个，第一个就是要 显示 modalKey，第二个是 弹窗的 props， 第三个是这个弹窗的配置项。



| 入参           | 意义                     |
| -------------- | :----------------------- |
| UniqueKeyModal | ReactComponent \| string |
| props          | AnyModalProps 默认{}     |
| modalCfg       | 弹窗配置项具体如下       |



| modalCfg 弹窗配置   | 基本信息和默认项                                             | 默认值                                                       |
| ------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| destroyed           | 是否被销毁                                                   | true                                                         |
| appendDom           | 弹窗到哪个元素下                                             | document.body                                                |
| queue               | 是否是队列弹窗                                               | false                                                        |
| forceShow           | 用于弹窗复用                                                 | false                                                        |
| coc                 | 点击弹窗外部是否关闭                                         | false                                                        |
| fixedBody           | 显示弹窗是否固定背景                                         | true                                                         |
| center              | 是否居中布局                                                 | true                                                         |
| containerStyle      | 外部 container 样式                                          | {}                                                           |
| aniConfig           | 弹窗默认动画                                                 | {<br>    aniName: 'fade-in-linear',<br>    aniType: 'transition',<br>} |
| showAniConfig       | 弹窗显示动画                                                 | 如上                                                         |
| closeAniConfig      | 弹窗关闭动画                                                 | 如上                                                         |
| preloadResource     | 资源预加载                                                   | []                                                           |
| preloadResourceFunc | 资源预加载方法,内置了图片的预加载                            | {}                                                           |
| parallelMode        | 资源是否并行加载                                             | false                                                        |
| loadingComp         | 资源预加载显示的 loading， loadingComp<br>props 上有loaded， total, loadedResolve<br>loadedResolve 是用于想loadingComp 自身控制<br>资源是否全部加载完成的回调方法 | 默认自带的loading 组件                                       |
| isLoadingInControl  | 和loadedResolve 一起使用                                     | false                                                        |
| preloadOnce         | 资源是否只加载一次                                           | true                                                         |

> 基本的 showModal 简单使用如下


```jsx
import React from 'react';
import { ModalControlIns } from '@lightfish/waterui';

window.ModalControlIns = ModalControlIns

const TT = (props) => {
      return (
        <div>test {props.test}</div>
      )
    }

export default () => {
  function showTestModal() {
    // 默认方法组件会给 props 上挂载一个 closeModal 进行内部调用关闭
    ModalControlIns.showModal(TT, {
      test: 'showTestModal'
    }, {
      coc: true,
      cc: true,
      destroyed: false,
      aniConfig: {
        aniName: 'demo-fade-in',
        aniType: 'animation'
      }
    })
  }

  function showClassCompModal() {
    // 默认 class 组件 会直接在原型上 挂一个 closeModal 方法
    ModalControlIns.showModal(class extends React.Component{

      componentDidAniEnd() {
        console.log(123123123)
      }

      render() {
        return (
          <div onClick={this.closeModal}>test {this.props.test}</div>
        )
      }
    }, {
      test: 'showClassCompModal'
    }, {
      coc: true,
      destroyed: false,
    })
  }
  return (
    <div>
      <button onClick={showTestModal}>显示function弹窗</button>
      <button onClick={showClassCompModal}>显示class component弹窗</button>
    </div>
  )
}
```

### initModal

> 初始化 一个弹窗实例, 你可以对这个弹窗在各个 生命周期 进行监听处理， 如下 我再弹窗做动画前， 修改了 props


```jsx
import React from 'react';
import { ModalControlIns } from '@lightfish/waterui';                 

ModalControlIns.addEventsListener('beforeShow', (e) => {
  console.log('ModalControlIns', e)
})

export default () => {
  const [modalIns, setModalIns] = React.useState(null)

  function onInitModal() {
    setModalIns(ModalControlIns.initModal((props) => {
      return (
        <div onClick={props.closeModal}>test {props.test}</div>
      )
    }, {
      test: 'onInitModal'
    }))
  }

  function onListenCircleState() {
    if (!modalIns) {
      alert('no modalIns')
      return
    }
    modalIns.onceEventsListener('beforeShow', (e) => {
      console.log(e)
      e.target.setProps({
        test: 'before test'
      })
    })
    modalIns.forceShow()
  }
  return (
    <div>
      <button onClick={onInitModal}>初始化一个弹窗实例</button>
      <button onClick={onListenCircleState}>监听弹窗实例, 并打开弹窗</button>
    </div>
  )
}
```

### setUniqueModal
> `setUniqueModal`设置 唯一弹窗，这里是避免在日常开始代码编写中 频繁引入 外部文件，导致页面相对冗杂，这边就 推荐使用`setUniqueModal`进行设置 字符串key 来对应具体的某一个弹窗，你可以统一在 新建一个文件 进行管理。

```ts
// 弹窗和生命周期
enum ModalState {
  BEFOREINIT = 'beforeInit', // 暂不使用
  INITED = 'inited',
  BEFORESHOW = 'beforeShow',
  SHOWED = 'showed',
  BEFORECLOSE = 'beforeClose',
  CLOSED = 'closed',
  BEFOREDESTROY = 'beforeDestroy', // 暂不使用
  DESTROYED = 'destroyed' // 暂不使用
}
```