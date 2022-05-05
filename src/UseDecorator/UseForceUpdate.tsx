import React from "react";
import { useCallback, useReducer, useRef } from "react";

type ReactComponent = React.FunctionComponentFactory<any> | React.ComponentClass;

export function UseForceUpdate(Comp: ReactComponent): [any, any] {
  const forceUpdateFunc = useRef<Function>();
  const finalComp = useCallback((props: any) => {
    const [, fUpdate] = useReducer((s) => s + 1, 0);
    forceUpdateFunc.current = fUpdate;
    return <Comp {...props} />;
  }, []);
  return [forceUpdateFunc, finalComp];
}