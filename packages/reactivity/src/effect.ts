export function effect(fn, options?) {
  // 创建一个effect 只要依赖的属性变化就执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  _effect.run()
  return _effect
}

export let activeEffect

function preCleanEffect(effect) {
  effect._depLength = 0
  effect._trackId++
}

function postCleanEffect(effect) {
  if (effect.deps.length > effect._depLength) {
    for (let i = effect._depLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect)
    }
    effect.deps.length = effect._depLength
  }
}

class ReactiveEffect {
  deps = []
  _depLength = 0
  _trackId = 0
  public active = true
  // fn为用户编写的函数
  // 如果fn中依赖的数据发生变化后，就重新调用 run()
  constructor(
    public fn,
    public scheduler
  ) {}
  run() {
    if (!this.active) return this.fn()
    let lastEffect = activeEffect
    try {
      activeEffect = this
      preCleanEffect(this)
      return this.fn()
    } finally {
      activeEffect = lastEffect
      postCleanEffect(this)
    }
  }
  stop() {
    this.active = false
  }
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect)
  if (dep.size == 0) {
    dep.clearup()
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
    if (effect.scheduler) {
      effect.scheduler()
    }
  }
}
