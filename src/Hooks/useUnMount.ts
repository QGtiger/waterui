import {
  useEffect, useRef
} from 'react'

export default function useUnMount(fn: () => void) {
  const ref = useRef<Function>()
  ref.current = fn
  useEffect(() => {
    return () => {
      ref.current?.()
    }
  }, [])
}