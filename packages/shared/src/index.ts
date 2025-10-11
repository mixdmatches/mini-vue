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
