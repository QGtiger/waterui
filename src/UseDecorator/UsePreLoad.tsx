import React, { useEffect, useRef, useState } from "react";
import { SpliceArrayItem } from "../Module/Utils/Array";
import LoadingComp from "../Components/loadingComponent/loading";
import { imgPreload, onPreloadResource } from "../Module/Loader/loader";
import { WrapPromiseFunc } from "../Module/Utils/utils";
import { UseForceUpdate } from "./UseForceUpdate";
import { PreLoadType } from "../types";

type AnyCompProps = {
  [k: string]: any
}

type PreloadFunc = (...arga: any[]) => Promise<AnyCompProps>


type ReactComponent = React.FunctionComponentFactory<any> | React.ComponentClass;

const noneArrowFunc = () => {}

const defaultUsePreloadConfig = {
  preloadResource: [],
  preloadResourceFunc: {
    others: imgPreload
  },
  parallelMode: false,
  loadingComp: LoadingComp,
  isLoadingInControl: false,
  preloadOnce: true
  // renderPromiseList: []
}

// (props) => {
//   useEffect(() => {
//     if (props.loaded === props.total) {
//       setTimeout(() => {
//         props.loadedResolve()
//       }, 1000)
//     }
//   }, [props.loaded])
//   return (
//     <span>{props.loaded}/{props.total}</span>
//   )
// },

/**
 * 组件资源预加载
 * @param preLoadCfg 
 * @returns 
 */
export function UsePreload(preLoadCfg: PreLoadType = defaultUsePreloadConfig) {
  const finalCfg: PreLoadType = Object.assign({}, defaultUsePreloadConfig, preLoadCfg, {
    preloadResourceFunc: Object.assign({}, defaultUsePreloadConfig.preloadResourceFunc, preLoadCfg.preloadResourceFunc)
  });
  return function(PreloadComponent: ReactComponent) {
    let _index = 0
    const ParamLoadingComp = finalCfg.loadingComp

    // 渲染队列， 里面有 loadState， 和 强制更新的 forceUpdateRef
    let forceUpdateRefArr: {
      index: number,
      loadState: {
        loaded: number,
        total: number,
        loadedResolve: () => void
      },
      forceUpdateRef: any
    }[] = []
    // 预加载所有资源
    const _PreloadPromiseAll = WrapPromiseFunc(function() {
      return new Promise<void>((resolve) => {
        const _resolve = () => {
          // reolve 掉的时候 去掉全部已经加载完成的 
          for (let i = forceUpdateRefArr.length - 1; i >= 0; i--) {
            let currItem = forceUpdateRefArr[i]
            if (currItem.loadState.loaded === currItem.loadState.total) {
              forceUpdateRefArr.splice(i, 1)
            }
          }
          resolve()
          // 这里是因为 resolove的时候后面逻辑还没有完成，所以需要延迟一下
          finalCfg.preloadOnce || (_PreloadPromiseAll.overWrite())
        }

        if (finalCfg.isLoadingInControl) {
          forceUpdateRefArr.forEach(item => {
            item.loadState.loadedResolve = _resolve
          })
        }
        onPreloadResource(finalCfg.preloadResource, finalCfg.parallelMode, finalCfg.preloadResourceFunc, (loaded: number, total: number) => {
          forceUpdateRefArr.forEach(item => {
            item.loadState.loaded = loaded
            // 强制更新一下
            item.forceUpdateRef && item.forceUpdateRef.current()
          })
        }, () => {
          !finalCfg.isLoadingInControl && _resolve()
        })
      })
    });
    const UseMemoSus = React.memo(function SuspensePrelaodComponent(props: AnyCompProps) {
      const isLoadedRef = useRef(false)
      if (!isLoadedRef.current) {
        _PreloadPromiseAll.read()
        isLoadedRef.current = true
      }
      return (
        <PreloadComponent {...props} />
      )
    })
    return React.memo(function(props: AnyCompProps) {
      const mIndexRef = useRef(-1)
      if (mIndexRef.current === -1) {
        const cIndex = _index ++
        mIndexRef.current = cIndex
        forceUpdateRefArr.push({
          index: cIndex,
          loadState: {
            loaded: 0,
            total: finalCfg.preloadResource.length,
            loadedResolve: noneArrowFunc
          },
          forceUpdateRef: null
        })
      }
      

      const _loadConfig = forceUpdateRefArr.find(item => item.index === mIndexRef.current) || {
        loadState: {
          loaded: finalCfg.preloadResource.length,
          total: finalCfg.preloadResource.length,
          loadedResolve: noneArrowFunc
        },
        forceUpdateRef: null
      }
      const [forceUpdateRef, FinalLoadingComp] = UseForceUpdate(function() {
        const _loadState = _loadConfig.loadState
        return (
          <ParamLoadingComp _index={mIndexRef.current} loaded={_loadState.loaded} total={_loadState.total} loadedResolve={_loadState.loadedResolve} />
        )
      })

      // 这里是为了只跑一次,forceUpdateRef 为 null 就赋值一次
      if (_loadConfig.forceUpdateRef === null) {
        _loadConfig.forceUpdateRef = forceUpdateRef
      }


      return (
        <React.Suspense fallback={<FinalLoadingComp />}>
          <UseMemoSus {...props} />
        </React.Suspense>
        
      )
    })
  }
}