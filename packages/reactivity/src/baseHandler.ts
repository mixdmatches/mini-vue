import { track, trigger } from '@mini-vue/reactivity'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive__'
}

// proxy需要搭配Reflect来使用
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true
    // 取值时让响应式属性和effect映射起来
    // 依赖收集TODO
    track(target, key) // 收集这个对象上的属性和effect对应
    return Reflect.get(target, key, receiver)
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
