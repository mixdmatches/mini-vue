import { isString, ShapeFlags } from '@mini-vue/shared'

export type VNode = {
  _v_isVNode: Boolean
  type: String | VNode
  props: Object
  children: String | VNode
  key: String | Number
  el: null | Element
  shapeFlag: number
}
/**
 * 创建一个VNode虚拟节点
 * @param type 节点类型/ h1 ,p
 * @param props 节点身上的属性：style,class,onClick...
 * @param children 节点的子节点
 * @returns 虚拟节点
 */
export function createVNode(type, props, children?): VNode {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  const vNode: VNode = {
    _v_isVNode: true,
    type,
    props,
    children,
    key: props?.key,
    el: null,
    shapeFlag
  }
  if (children) {
    // h('h1',[h('a','链接1'),h('a','链接2')])
    if (Array.isArray(children)) {
      vNode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    } else {
      // h1('h1','大标题')
      children = String(children)
      vNode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    }
  }
  return vNode
}
