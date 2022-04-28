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
import React, { forwardRef, useImperativeHandle, useRef, useReducer } from 'react';
import { ModalControlIns, UseLfModal, WtModal } from '@lightfish/waterui';

window.WtModal = WtModal;

const a = (props) => {
  return <div>{props.t}</div>;
};

// let aa = ModalControlIns.initModal(a, {t: 12313123}, {
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

function fetchPosts() {
  console.log('fetch posts...');
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('fetched posts');
      resolve([
        {
          id: 0,
          text: 'I get by with a little help from my friends',
        },
        {
          id: 1,
          text: "I'd like to be under the sea in an octupus's garden",
        },
        {
          id: 2,
          text: 'You got that sand all over your feet',
        },
      ]);
    }, 1000);
  });
}

function fetchProfileData() {
  let postsPromise = fetchPosts();
  return {
    posts: wrapPromise(postsPromise),
  };
}

// Suspense integrations like Relay implement
// a contract like this to integrate with React.
// Real implementations can be significantly more complex.
// Don't copy-paste this into your project!
function wrapPromise(promise) {
  let status = 'pending';
  let result;
  let suspender = promise.then(
    (r) => {
      status = 'success';
      console.log('?????,', status);
      result = r;
    },
    (e) => {
      status = 'error';
      result = e;
    },
  );
  return {
    read() {
      console.log('curr status', status);
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        console.log(result);
        return result;
      }
    },
  };
}

const fetchData = fetchProfileData();

  const isResolve = React.useRef()

function SuspenseComp(props) {
  const resolveCur = React.useRef()
  React.useEffect(() => {
    console.log(isResolve)
    if (!isResolve.current) {
      setTimeout(() => {
        
        isResolve.current = true
        console.log(isResolve, resolveCur.current)
        resolveCur.current()
      }, 6000)
      throw new Promise((r) => {
        resolveCur.current = r
      })
    }
    
  }, [])
  const list = fetchData.posts.read();
  console.log('SuspenseComp render', props);
  return (
    <div>
      {props.text || ''}
      {list.map((item) => {
        return <p key={item.id}>{item.text}</p>;
      })}
    </div>
  );
}

function makeObserverComp(Comp) {
  return React.memo(
    forwardRef((props, ref) => {
      const [, fUpdate] = useReducer((s) => s + 1, 0);
      const compRef = useRef();
      useImperativeHandle(ref, () => ({
        forceUpdate() {
          fUpdate();
        },
      }));
      return <Comp {...props} />;
    }),
  );
}

let ttt = {
  text: '1111',
};


export default () => {
  const [, fUpdate] = useReducer((s) => s + 1, 0);
  function showModalTest() {
    const aIns = ModalControlIns.setUniqueModal(
      '233',
      a,
      {
        t: 1111,
      },
      {
        coc: true,
        preloadResource: ['http://qnpic.top/yoona2.jpg']
      },
    );
    ModalControlIns.showModal(
      '233',
      {},
      {
        closeAniConfig: {
          aniName: 'fade-in-linear',
        },
      },
    );
    ModalControlIns.showModal(
      '233',
      {},
      {
        queue: true,
      },
    );
  }
  const testRef = useRef();
  const SuspenseCompObserve = makeObserverComp(SuspenseComp);
  window.parent.fUpdate = function (t) {
    ttt = {
      text: '2222',
    };
    console.log(ttt);
    fUpdate();
    // testRef.current.forceUpdate()
  };
  // setTimeout(() => {
  //   ttt = 'test123123'
  //   // testRef.current.forceUpdate()
  //   console.log(testRef, ttt)
  // }, 2000)
  return (
    <div>
    <React.Suspense fallback={1211231233}>
      <SuspenseCompObserve {...ttt} ref={testRef} />
    </React.Suspense>
      <p onClick={showModalTest}>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>
      <p>123</p>{' '}
    </div>
  );
};
```
