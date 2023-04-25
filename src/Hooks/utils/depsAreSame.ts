import type {DependencyList} from 'react'

/**
 * 判断是否 依赖相同
 * @param oldDeps 
 * @param deps 
 * @returns 
 */
export function depsAreSame(oldDeps: DependencyList, deps: DependencyList) {
  if (oldDeps === deps) return true

  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false
  }

  return true
}