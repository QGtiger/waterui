import React from "react";
import LoadingComp from "src/Components/loadingComponent/loading";
import { imgPreload } from "src/Module/Loader/loader";

type AnyCompProps = {
  [k: string]: any
}

type PreloadFunc = (...arga: any[]) => Promise<AnyCompProps>

type PreLoadType = {
  preloadResource?: string[], // 预加载 资源
  preloadResourceFunc?: {[x: string]: (res: string) => Promise<any>}, // 资源加载器， 默认 配置 others
  parallelMode?: boolean, // 并行加载
  renderPromiseList?: Array<PreloadFunc>, // 渲染 promise 列表
}

type ReactComponent = React.FunctionComponentFactory<any> | React.ComponentClass;

const defaultUsePreloadConfig = {
  preloadResource: [],
  preloadResourceFunc: {
    others: imgPreload
  },
  parallelMode: false,
  renderPromiseList: []
}

export function UsePreload(preLoadCfg: PreLoadType = defaultUsePreloadConfig) {
  const finalCfg = Object.assign({}, defaultUsePreloadConfig, preLoadCfg, {
    preloadResourceFunc: Object.assign({}, defaultUsePreloadConfig.preloadResourceFunc, preLoadCfg.preloadResourceFunc)
  });
  return function(PreloadComponent: ReactComponent) {
    // const _PreloadPromiseAll = Pro
    function SuspensePrelaodComponent() {

      return (
        <PreloadComponent />
      )
    }
    return function() {
      return (
        <React.Suspense fallback={<LoadingComp />}>
          <SuspensePrelaodComponent />
        </React.Suspense>
        
      )
    }
  }
}