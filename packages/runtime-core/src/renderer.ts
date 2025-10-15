import { isSameVNode, ShapeFlags } from '@mini-vue/shared'

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
    let el = (vNode.el = hostCreateElement(type))
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

  const unmountChild = children => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      unmount(child)
    }
  }

  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container)
    } else {
      patchElement(n1, n2, container)
    }
  }

  const patchProps = (el, oldProps, newProps) => {
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }
    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  const patchChildren = (n1, n2, el) => {
    debugger
    const c1 = n1.children
    const c2 = n2.children

    const oldShapeFlag = n1.shapeFlag
    const newShapeFlag = n2.shapeFlag

    // 1.新的是文本，老的是数组移除老的;
    // 2.新的是文本，老的也是文本，内容不相同替换
    // 3.老的是数组，，新的是数组，注量 diff 算法
    // 4.老的是数组,新的不是数组，移除老的子节点
    // 5.老的是文本，新的是空
    // 6.老的是文本，新的是数组

    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChild(c1)
      }

      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 全量diff算法，两个数组对比
        } else {
          unmountChild(c1)
        }
      } else {
        if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el)
        }
      }
    }
  }

  const patchElement = (n1, n2, container) => {
    const el = (n2.el = n1.el)

    const oldProps = n1.props
    const newProps = n2.props

    patchProps(el, oldProps, newProps)
    patchChildren(n1, n2, container)
  }

  // 渲染，更新
  const patch = (n1, n2, container) => {
    if (n1 === n2) return

    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    // 对元素处理
    processElement(n1, n2, container)
  }

  const unmount = vNode => {
    hostRemove(vNode.el)
  }

  // 多次调用进行虚拟节点的比较
  const render = (vNode, container) => {
    if (vNode === null) {
      // 移除容器中的dom元素
      if (container._vNode) {
        console.log(container._vNode)
        unmount(vNode)
      }
    }
    patch(container._vNode || null, vNode, container)
    container._vNode = vNode
  }

  return {
    render
  }
}
