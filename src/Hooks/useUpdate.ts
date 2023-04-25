import { useCallback, useState } from 'react';

export default function useUpdate() {
  const [, setUpdate] = useState({})

  return useCallback(() => {
    setUpdate({})
  }, [])
}