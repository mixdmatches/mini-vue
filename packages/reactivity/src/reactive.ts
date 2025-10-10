import { isObject } from '@mini-vue/shared'
import { ReactiveFlags, mutableHandlers } from './baseHandler'
const reactiveMap = new Map()

function createReactiveObject(target) {
  if (!isObject(target)) return target

  // 禁止已经是响应的对象再次代理
  if (target[ReactiveFlags.IS_REACTIVE]) return target

  const existProxy = reactiveMap.get(target)
  if (existProxy) return existProxy

  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}

export function reactive(target) {
  debugger
  return createReactiveObject(target)
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
