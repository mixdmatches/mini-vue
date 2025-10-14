import { ShapeFlags } from '@mini-vue/shared'

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = renderOptions

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  const mountElement = (vNode, container) => {
    const { type, children, props, shapeFlag } = vNode
    let el = hostCreateElement(type)
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }
    hostInsert(el, container)
  }

  // 渲染，更新
  const patch = (n1, n2, container) => {
    if (n1 === n2) return
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container)
    }
  }

  // 多次调用进行虚拟节点的比较
  const render = (vNode, container) => {
    patch(container._vNode || null, vNode, container)
    container._vNode = vNode
  }

  return {
    render
  }
}
