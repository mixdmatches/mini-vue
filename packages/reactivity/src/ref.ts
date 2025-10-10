import { createDep } from '@mini-vue/reactivity'
import {
  activeEffect,
  trackEffect,
  triggerEffect
} from 'packages/reactivity/src/effect'
import { toReactive } from 'packages/reactivity/src/reactive'

export function ref(value) {
  return createRef(value)
}

function createRef(value) {
  return new RefImpl(value)
}

class RefImpl {
  public _v_isRef = true
  public _value // 用来保存ref值
  public dep // 收集对应的effect

  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue
      this._value = newValue
      triggerRefValue(this)
    }
  }
}

export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))
    )
  }
}

export function triggerRefValue(ref) {
  let dep = ref.dep
  if (dep) {
    triggerEffect(dep)
  }
}

class ObjectRefImpl {
  public _v_isRef = true

  constructor(
    public object,
    public key
  ) {}

  get value() {
    return this.object[this.key]
  }
  set value(newValue) {
    this.object[this.key] = newValue
  }
}

export function toRef(state, key) {
  return new ObjectRefImpl(state, key)
}

export function toRefs(state) {
  const res = {}
  for (const key in state) {
    res[key] = toRef(state, key)
  }
  return res
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      let res = Reflect.get(target, key, receiver)
      return res._v_isRef ? res.value : res
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      if (oldValue._v_isRef) {
        oldValue.value = value
        return true
      } else {
        return Reflect.set(target, key, value, receiver)
      }
    }
  })
}
