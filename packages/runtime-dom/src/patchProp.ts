// 主要对节点元素的属性操作 class style event 普通属性
import { patchStyle } from './modules/style'
import { patchClass } from './modules/class'
import { patchEvent } from './modules/events'
import { patchAttr } from './modules/attrs'

export default function patchProp(el, key, preValue, nextValue) {
  if (key === 'class') {
    return patchClass(el, nextValue)
  } else if (key === 'style') {
    return patchStyle(el, preValue, nextValue)
  } else if (/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, nextValue)
  } else {
    return patchAttr(el, key, nextValue)
  }
}
