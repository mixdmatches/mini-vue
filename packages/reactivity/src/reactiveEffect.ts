import { activeEffect, trackEffect, triggerEffect } from '@mini-vue/reactivity'

// 创建一个收集器
const createDep = (clearup, key) => {
  const dep = new Map() as any
  dep.clearup = clearup
  dep.name = key
  return dep
}

let targetMap = new WeakMap()
export function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)

    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }

    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)))
    }
    // 把当前effect放dep映射表中，后续触发更新时，从映射表中取出effect执行
    trackEffect(activeEffect, dep)
  }
}

// 触发更新
export function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (dep) {
    triggerEffect(dep)
  }
}
