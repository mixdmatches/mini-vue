import { isString, ShapeFlags } from '@mini-vue/shared'

export function createVNode(type, props, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  const vNode = {
    _v_isVNode: true,
    type,
    props,
    children,
    key: props?.key,
    el: null,
    shapeFlag
  }
  if (children) {
    if (Array.isArray(children)) {
      vNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      vNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    }
  }
  return vNode
}
