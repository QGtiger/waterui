import { useEffect, useLayoutEffect, EffectCallback, DependencyList, useRef } from 'react';
import useUnMount from '../useUnMount';
import { depsAreSame } from './depsAreSame';
import { BasicTarget, getTargetElement } from './domtarget';

export function createEffectWithTarget(useEffectType: typeof useEffect | typeof useLayoutEffect) {
  const useEffectWithTarget = (
    effect: EffectCallback,
    deps: DependencyList,
    target: BasicTarget<any> | BasicTarget<any>[]
  ) => {
    const {current} = useRef<{
      initialized: boolean,
      lastEle: Element[],
      deps: DependencyList,
      unmountCallback: ReturnType<EffectCallback>
    }>({
      initialized: false,
      lastEle: [],
      deps: deps,
      unmountCallback: () => {}
    })

    useEffectType(() => {
      const targets = Array.isArray(target) ? target : [target]
      const els: any[] = targets.map(item => getTargetElement(item))

      if (!current.initialized) {
        current.initialized = true

        current.lastEle = els
        current.deps = deps
        current.unmountCallback = effect()
      }

      if (
        els.length !== current.lastEle.length ||
        !depsAreSame(els, current.lastEle) ||
        !depsAreSame(deps, current.deps)
      ) {
        current.unmountCallback && current.unmountCallback()

        current.lastEle = els
        current.deps = deps
        current.unmountCallback = effect()
      }
    })

    useUnMount(() => {
      current.unmountCallback && current.unmountCallback()
      // for react-refresh
      current.initialized = false
    })
  }

  return useEffectWithTarget
}