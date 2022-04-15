import React, { forwardRef, useImperativeHandle, useReducer, useRef } from "react";
import { ReactComponent } from "./types";

export function makeObserverComp(Comp: ReactComponent) {
  return React.memo(forwardRef((props: any, ref) => {
    const [, fUpdate] = useReducer((s) => s + 1, 0);
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