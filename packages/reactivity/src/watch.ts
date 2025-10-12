import { isFunction, isObject, isReactive, isRef } from '@mini-vue/shared'
import { ReactiveEffect } from './effect'

export function watchEffect(source, options = {}) {
  return doWatch(source, null, options)
}

export function watch(source, callback, options = {}) {
  return doWatch(source, callback, options)
}

// seen是一个Set 用来记录遍历过的对象 避免循环引用
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) {
    return source
  }
  if (depth) {
    if (currentDepth >= depth) {
      return source
    }
    currentDepth++
  }
  if (seen.has(source)) {
    return source
  }
  seen.add(source)
  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen)
  }
  return source // 遍历会触发每个属性的get
}

function doWatch(source, callback, options) {
  const { deep, immediate } = options

  // source -> getter
  const reactiveGetter = source =>
    traverse(source, deep === false ? 1 : undefined)

  let getter
  if (isReactive(source)) {
    getter = () => reactiveGetter(source)
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isFunction(source)) {
    getter = source
  }

  let oldValue

  let clean
  const onCleanup = fn => {
    clean = () => {
      fn()
      clean = undefined
    }
  }
  const job = () => {
    if (callback) {
      const newValue = effect.run()
      if (clean) {
        clean()
      }
      callback(newValue, oldValue, onCleanup)
      oldValue = newValue
    } else {
      effect.run()
    }
  }

  const effect = new ReactiveEffect(getter, job)

  if (callback) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  const unWatch = () => {
    effect.stop()
  }

  return unWatch
}
