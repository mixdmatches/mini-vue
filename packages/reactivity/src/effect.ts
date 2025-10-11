import { DirtyLevels } from './constants'

export function effect(fn, options?) {
  // 创建一个effect 只要依赖的属性变化就执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  _effect.run()

  if (options) {
    Object.assign(_effect, options) // 用用户传递的选项覆盖默认选项
  }

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner // 外界可以自己重新run
}

export let activeEffect

function preCleanEffect(effect) {
  effect._depLength = 0
  effect._trackId++
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect)
  if (dep.size == 0) {
    dep.clearup()
  }
}

function postCleanEffect(effect) {
  if (effect.deps.length > effect._depLength) {
    for (let i = effect._depLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect)
    }
    effect.deps.length = effect._depLength
  }
}

export class ReactiveEffect {
  deps = []
  _depLength = 0
  _trackId = 0
  public active = true // 默认创建的effect是响应式
  _running = 0 //是否正在执行
  _dirtyLevel = DirtyLevels.Dirty // 默认是脏值
  // fn为用户编写的函数
  // 如果fn中依赖的数据发生变化后，就重新调用 run()
  constructor(
    public fn,
    public scheduler
  ) {}

  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty
  }
  public set dirty(value) {
    this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty
  }

  run() {
    this._dirtyLevel = DirtyLevels.NoDirty
    if (!this.active) return this.fn()
    let lastEffect = activeEffect
    try {
      activeEffect = this
      preCleanEffect(this)
      this._running++
      return this.fn()
    } finally {
      this._running--
      activeEffect = lastEffect
      postCleanEffect(this)
    }
  }
  stop() {
    if (this.active) {
      this.active = false
      preCleanEffect(this)
      postCleanEffect(this)
    }
  }
}

export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId)

    let oldDep = effect.deps[effect._depLength]
    if (oldDep !== dep) {
      if (oldDep) {
        cleanDepEffect(oldDep, effect)
      }
      effect.deps[effect._depLength++] = dep
    } else {
      effect._depLength++
    }
  }
}

export function triggerEffect(dep) {
  for (const effect of dep.keys()) {
    // 当前这个值不脏的话就触发更新将值变为脏值
    if (effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.Dirty
    }
    if (!effect._running) {
      if (effect.scheduler) {
        // 不是正在执行才能执行
        effect.scheduler()
      }
    }
  }
}
