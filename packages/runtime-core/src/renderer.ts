import { VNode } from '@mini-vue/runtime-core'
import { isSameVNode, ShapeFlags } from '@mini-vue/shared'

/**
 * 创建一个渲染器
 * @param renderOptions 渲染器选项
 * @returns render
 */
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

  const mountElement = (vNode, container, anchor) => {
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
    hostInsert(el, container, anchor)
  }

  const unmountChild = children => {
    for (let i = 0; i < children.length; i++) {
      let child = children[i]
      unmount(child)
    }
  }

  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      // 初始化操作
      mountElement(n2, container, anchor)
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

  const patchKeyedChildren = (oldVNodeChildren1, newVNodeChildren2, el) => {
    let i = 0
    let oldLastIndex = oldVNodeChildren1.length - 1
    let newLastIndex = newVNodeChildren2.length - 1
    // [a,b,c] [a,b,d,c] 的情况，从头开始比
    while (i <= oldLastIndex && i <= newLastIndex) {
      const oldChild = oldVNodeChildren1[i]
      const newChild = newVNodeChildren2[i]

      if (isSameVNode(oldChild, newChild)) {
        patch(oldChild, newChild, el)
      } else {
        break
      }
      i++
    }
    // [d,b,c,a] [d,c,a] 的情况，从尾部开始比
    while (i <= oldLastIndex && i <= newLastIndex) {
      const oldChild = oldVNodeChildren1[oldLastIndex]
      const newChild = newVNodeChildren2[newLastIndex]

      if (isSameVNode(oldChild, newChild)) {
        patch(oldChild, newChild, el)
      } else {
        break
      }
      oldLastIndex--
      newLastIndex--
    }

    // 处理增加和删除的情况 [a,b,c] [a,b] | [c,a,b] [a,b]

    // a b
    // a b c -> i = 2, old = 1, new = 2 i > old && i <= new
    // a b
    // c a b -> i = 0, old = -1, new = 0 i > old && i <= new
    if (i > oldLastIndex) {
      if (i <= newLastIndex) {
        // 有插入的部分
        let nextPos = newLastIndex + 1
        let anchor = newVNodeChildren2[nextPos]?.el

        while (i <= newLastIndex) {
          patch(null, newVNodeChildren2[i], el, anchor)
          i++
        }
      }
    } else if (i > newLastIndex) {
      // a,b,c
      // a,b -> i = 2, old = 2 new = 1  i>new && i<=old
      // c,a,b
      // a,b  -> i = 0, old = 1 new = -1
      if (i <= oldLastIndex) {
        while (i <= oldLastIndex) {
          unmount(oldVNodeChildren1[i])
          i++
        }
      }
    } else {
      // 以上确认不变化的节点，并对插入和移除做了处理
      // 后面就是特殊的对比方式了
      let s1 = i
      let s2 = i

      const keyToNewIndexMap = new Map() // 做一个映射表用于快速查找
      for (let i = s2; i <= newLastIndex; i++) {
        const vNode = newVNodeChildren2[i]
        keyToNewIndexMap.set(vNode.key, i)
      }
      for (let i = s1; i <= oldLastIndex; i++) {
        const vNode = oldVNodeChildren1[i]
        const newIndex = keyToNewIndexMap.get(vNode.key)

        if (newIndex == undefined) {
          unmount(vNode)
        } else {
          patch(vNode, newVNodeChildren2[newIndex], el)
        }
      }

      let toBePatched = newLastIndex - s2 + 1 // 倒序插入的个数

      for (let i = toBePatched - 1; i >= 0; i--) {
        let newIndex = s2 + i
        let anchor = newVNodeChildren2[newIndex + 1]?.el
        let vNode = newVNodeChildren2[newIndex]
        if (!vNode.el) {
          // 在新列表中新增的元素
          patch(null, vNode, el, anchor)
        } else {
          hostInsert(vNode, el, el, anchor) // 接着倒序插入
        }
      }
    }
  }

  const patchChildren = (n1, n2, el) => {
    // text array null
    const c1 = n1.children
    const c2 = n2.children

    const oldShapeFlag = n1.shapeFlag
    const newShapeFlag = n2.shapeFlag

    // 1.新的是文本，老的是数组移除老的;
    // 2.新的是文本，老的也是文本，内容不相同替换
    // 3.老的是数组，，新的是数组，全量 diff 算法
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
          patchKeyedChildren(c1, c2, el)
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

  /**
   *
   * @param n1 oldVNode
   * @param n2 newVNode
   * @param container 父元素
   */
  const patchElement = (n1, n2, container) => {
    const el = (n2.el = n1.el)

    const oldProps = n1.props
    const newProps = n2.props

    patchProps(el, oldProps, newProps)
    patchChildren(n1, n2, el)
  }

  /**
   * 更新，渲染
   * @param n1 oldVNode
   * @param n2 newVNode
   * @param container 父元素
   */
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 === n2) return

    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    // 对元素处理
    processElement(n1, n2, container, anchor)
  }

  /**
   * 移除该节点
   * @param vNode 虚拟节点
   */
  const unmount = (vNode: VNode) => {
    hostRemove(vNode.el)
  }

  // 多次调用进行虚拟节点的比较
  const render = (vNode: VNode, container: Element & { _vNode: VNode }) => {
    if (vNode === null) {
      // 移除容器中的dom元素
      if (container._vNode) {
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
