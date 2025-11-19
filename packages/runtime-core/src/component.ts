import { reactive } from '@mini-vue/runtime-dom'
import { hasOwn, isFunction } from '@mini-vue/shared'

export function createComponentInstance(vNode) {
  const instance = {
    data: null, // 状态
    vNode, // 组件的虚拟节点
    subTree: null, // 子树
    isMounted: false, // 是否挂在完成
    update: null, // 组件更新的函数
    props: {},
    attrs: {},
    propsOptions: vNode.type.props, // 用户声明的哪些属性是组件属性
    component: null,
    proxy: {} // 用来代理props attrs data
  }
  return instance
}

/**
 * 初始化属性
 * @param instance
 * @param rawProps
 */
const initProps = (instance, rawProps) => {
  const props = {}
  const attrs = {}
  const propsOptions = instance.propsOptions || {}
  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key]
      if (key in propsOptions) {
        props[key] = value // props不需要深度代理
      } else {
        attrs[key] = value
      }
    }
  }
  instance.attrs = attrs
  instance.props = reactive(props)
}

const publicProperty = {
  $attrs: instance => instance.attrs
}

const handler = {
  get(target, key) {
    const { data, props } = target
    // proxy.name -> data.name
    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    }
    const getter = publicProperty[key] // 通过不同的策略访问对应的方法
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    const { data, props } = target
    // proxy.name -> data.name
    if (data && hasOwn(data, key)) {
      data[key] = value
    } else if (props && hasOwn(props, key)) {
      console.warn('props are readonly')
      return false
    }
    return true
  }
}

export function setupComponent(instance) {
  const { vNode } = instance

  // 赋值属性
  initProps(instance, vNode.props)

  // 赋值代理对象
  instance.proxy = new Proxy(instance, handler)

  const { data, render } = vNode.type
  instance.render = render
  if (data && !isFunction(data)) {
    console.warn('data option must be a function')
  } else if (isFunction(data)) {
    // data中可以拿到props
    instance.data = reactive(data())
  }
}
