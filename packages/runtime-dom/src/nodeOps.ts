// 对节点元素的增删改查
export const nodeOps = {
  insert: (el: Element, parent: Element, anchor: Element) => {
    console.log(el, parent, anchor)

    parent.insertBefore(el, anchor || null)
  },
  remove(el: Element) {
    const parent = el.parentNode
    parent && parent.removeChild(el)
  },
  createElement: type => document.createElement(type),
  createText: text => document.createTextNode(text),
  setText(node: Element, text) {
    node.nodeValue = text
  },
  setElementText(el, text) {
    el.textContent = text
  },
  parentNode: node => node.parentNode,
  nextSibling: node => node.nextSibling
}
