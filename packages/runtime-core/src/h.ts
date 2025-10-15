import { isObject, isVNode } from '@mini-vue/shared'
import { createVNode } from './createVNode'

export function h(type, propsOrChildren?, children?) {
  let length = arguments.length

  if (length === 2) {
    // h(h1,虚拟节点 | 属性)
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 虚拟节点
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      } else {
        // 属性
        return createVNode(type, propsOrChildren)
      }
    }
    return createVNode(type, null, propsOrChildren)
  } else {
    if (length > 3) {
      children = Array.from(arguments).splice(2)
      if (length === 3 && isVNode(children)) {
        children = [children]
      }
    }
    return createVNode(type, propsOrChildren, children)
  }
}
