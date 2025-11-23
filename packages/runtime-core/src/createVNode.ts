import { isObject, isString, ShapeFlags } from '@mini-vue/shared'

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')
/**
 * 创建一个VNode虚拟节点
 * @param type 节点类型/ h1 ,p
 * @param props 节点身上的属性：style,class,onClick...
 * @param children 节点的子节点
 * @returns 虚拟节点
 */
export function createVNode(type, props, children?) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT
      : 0
  const vNode = {
    _v_isVNode: true,
    type,
    props,
    children,
    key: props?.key,
    el: null,
    shapeFlag,
    ref: props && props.ref
  }
  if (children) {
    // h('h1',[h('a','链接1'),h('a','链接2')])
    if (Array.isArray(children)) {
      vNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    } else if (isObject(children)) {
      vNode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    } else {
      // h1('h1','大标题')
      children = String(children)
      vNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    }
  }
  return vNode
}
