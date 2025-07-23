export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive__'
}

// proxy需要搭配Reflect来使用
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
}
