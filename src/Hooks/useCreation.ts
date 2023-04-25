import type {DependencyList} from 'react'
import { useRef } from 'react'
import {depsAreSame} from './utils/depsAreSame'

export function useCreation<T>(factory: () => T, deps: DependencyList) {
  const { current } = useRef({
    initialized: false,
    obj: undefined as undefined | T,
    deps: deps
  })

  if (!current.initialized || !depsAreSame(current.deps, deps)) {
    current.initialized = true
    current.deps = deps
    current.obj = factory()
  }

  return current.obj as T
}