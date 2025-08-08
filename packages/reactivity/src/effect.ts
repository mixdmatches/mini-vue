export function effect(fn, options?) {
  // 创建一个effect 只要依赖的属性变化就执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })
  _effect.run()
  return _effect
}

export let activeEffect

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
      return this.fn()
    } finally {
      activeEffect = lastEffect
    }
  }
  stop() {
    this.active = false
  }
}

export function trackEffect(effect, dep) {
  dep.set(effect, effect._trackId)
  effect.deps[effect._depLength++] = dep
}

export function triggerEffect(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler()
    }
  }
}
