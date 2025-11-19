import { ReactiveFlags } from '@mini-vue/reactivity/src/constants'

export const isObject = (value: unknown) => {
  return value !== null && typeof value === 'object'
}

export const isFunction = (value: unknown) => {
  return typeof value === 'function'
}

export const isReactive = (value: unknown) => {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

export const isRef = (value: unknown) => {
  return !!(value && value[ReactiveFlags.IS_REF])
}

export const isString = (value: unknown) => {
  return typeof value === 'string'
}

export const isVNode = (value: unknown) => {
  return (
    value &&
    typeof value === 'object' &&
    '_v_isVNode' in value &&
    value._v_isVNode
  )
}

export function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (value, key) => hasOwnProperty.call(value, key)
export * from './shapeFlag'
