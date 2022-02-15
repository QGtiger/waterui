import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useReducer } from "react";
import { ReactComponent } from "../itypes";


export function makeObserverComp(Comp: ReactComponent) {
  return React.memo(forwardRef((props: any, ref) => {
    const [, fUpdate] = useReducer((s) => s + 1, 0);
    const compRef = useRef()
    useImperativeHandle(ref, () => ({
      forceUpdate() {
        fUpdate()
      },
      compRef: compRef.current
    }))
    return (
      <Comp {...props} ref={compRef} />
    )
  }))
}

export function useForceUpdate(Comp: ReactComponent): [any, any] {
  const forceUpdateFunc = useRef<Function>()
  const finalComp = (props: any) => {
    const [, fUpdate] = useReducer((s) => s + 1, 0);
    forceUpdateFunc.current = fUpdate
    return (
      <Comp {...props} />
    )
  }
  return [forceUpdateFunc, finalComp]
}