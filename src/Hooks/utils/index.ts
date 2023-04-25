export function isObject(value: unknown) {
  return value !== null && typeof value === 'object'
}

export const isFunction = (value: unknown): value is Function => typeof value === 'function';

export const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)