import { reactive, track, trigger } from '@mini-vue/reactivity'
import { isObject } from '@mini-vue/shared'
import { ReactiveFlags } from './constants'

// proxy需要搭配Reflect来使用
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true
    // 取值时让响应式属性和effect映射起来
    track(target, key) // 收集这个对象上的属性和effect对应
    let res = Reflect.get(target, key, receiver)
    if (isObject(res)) {
      // 当取得值是对象时再次代理
      return reactive(res)
    }
    return res
  },
  set(target, key, value, receiver) {
    let oldValue = target[key]
    let result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      // 触发更新
      trigger(target, key, value, oldValue)
    }
    return result
  }
}
