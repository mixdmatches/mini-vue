import {
  currentInstance,
  setCurrentInstance,
  unSetCurrentInstance
} from '@mini-vue/runtime-core'

export const enum LifeCycles {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u'
}

function createHook(type) {
  return (hook, target = currentInstance) => {
    if (target) {
      const hooks: any[] = target[type] || (target[type] = [])
      const wrapHook = () => {
        setCurrentInstance(target)
        hook.call(target)
        unSetCurrentInstance()
      }
      hooks.push(wrapHook)
    }
  }
}

export const onBeforeMount = createHook(LifeCycles.BEFORE_MOUNT)
export const onMounted = createHook(LifeCycles.MOUNTED)
export const onBeforeUpdate = createHook(LifeCycles.BEFORE_UPDATE)
export const onUpdated = createHook(LifeCycles.UPDATED)

export const invokeArray = fns => {
  for (let i = 0; i < fns.length; i++) {
    fns[i]()
  }
}
