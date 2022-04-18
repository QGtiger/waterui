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
import React, { forwardRef, useImperativeHandle, useRef, useReducer } from 'react'
import { ModalCtrlIns, UseLfModal, WTIModal, UseAni, UseModal } from '@lightfish/waterui'

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

@UseAni({
  aniConfig: {
    aniType: 'transition',
    aniName: 'fade-in-linear'
  },
  autoAni: true
})
class CC extends React.Component {
  componentDidMount() {
    console.log('CC', this.props, this)
  }
  render() {
    return (
      <div>CCCC</div>
    )
  }
}

@UseModal({
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
        <AA visible={false} getModalIns={r=>{
          console.log('getModalIns')
          this.aIns=r
          setTimeout(() => {
            r.modalShow()
          }, 1000)
        }} />
      </div>
    )
  }
}

function fetchPosts() {
  console.log("fetch posts...");
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("fetched posts");
      resolve([
        {
          id: 0,
          text: "I get by with a little help from my friends"
        },
        {
          id: 1,
          text: "I'd like to be under the sea in an octupus's garden"
        },
        {
          id: 2,
          text: "You got that sand all over your feet"
        }
      ]);
    }, 1000);
  });
}

function fetchProfileData() {
  let postsPromise = fetchPosts();
  return {
    posts: wrapPromise(postsPromise)
  };
}

// Suspense integrations like Relay implement
// a contract like this to integrate with React.
// Real implementations can be significantly more complex.
// Don't copy-paste this into your project!
function wrapPromise(promise) {
  let status = "pending";
  let result;
  let suspender = promise.then(
    (r) => {
      status = "success";
      console.log('?????,', status)
      result = r;
    },
    (e) => {
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      console.log('curr status', status)
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        console.log(result)
        return result;
      }
    }
  };
}

const fetchData = fetchProfileData()

function SuspenseComp(props) {
  const list = fetchData.posts.read()
  console.log('SuspenseComp render', props)
  return (
    <div>
      {props.text || ''}
      {
        list.map(item => {
          return (
            <p key={item.id}>{item.text}</p>
          )
        })
      }
    </div>
  )
}

function makeObserverComp(Comp) {
  return React.memo(forwardRef((props, ref) => {
    const [, fUpdate] = useReducer((s) => s + 1, 0);
    const compRef = useRef()
    useImperativeHandle(ref, () => ({
      forceUpdate() {
        fUpdate()
      }
    }))
    return (
      <Comp {...props} />
    )
  }))
}
  
  let ttt = {
    text: '1111'
  }


    // {
    //   (function() {
    //     console.log('render ====>>>>', ttt)
    //     return (
    //       <React.Suspense fallback={123}>
    //         <SuspenseCompObserve {...ttt} ref={testRef} />
    //       </React.Suspense>
    //     )
    //   })()
    // }
export default () => {
  const [, fUpdate] = useReducer((s) => s + 1, 0);
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
  const testRef = useRef()
  const SuspenseCompObserve = makeObserverComp(SuspenseComp)
  window.parent.fUpdate = function(t) {
    ttt = {
      text: '2222'
    }
    console.log(ttt)
    fUpdate()
    // testRef.current.forceUpdate()
  }
  // setTimeout(() => {
  //   ttt = 'test123123'
  //   // testRef.current.forceUpdate()
  //   console.log(testRef, ttt)
  // }, 2000)

  window.parent.ttt =  new WTIModal((props) => {
    return (
      <div>
        <span onClick={(e) => {
          console.log(props.tt)
        }}>{props.tt}</span>
      </div>
    )
  }, {
    tt: '233'
  }, {
    appendDom: document.body,
    coc: true,
    fixedBody: false,
    aniConfig: {
      aniName: 'testfadein',
      aniType: 'animation'
    },
    preloadResource: Array(140).fill(1).map((_, i) => {
      return `http://qnpic.top/yoona${i}.jpg`
    })
  }, '123')
  return (
    <div>
    <CC getAniIns={el => {
    }}/>
    <BB /><p onClick={showModalTest}>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p><p>123</p>  </div>
  )
}
```