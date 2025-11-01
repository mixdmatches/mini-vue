// 主要对节点元素的属性操作 class style event 普通属性
import { patchStyle } from './modules/style'
import { patchClass } from './modules/class'
import { patchEvent } from './modules/events'
import { patchAttr } from './modules/attrs'

/**
 * 更新属性style,class等
 * @param el 元素
 * @param key 唯一标识
 * @param preValue 旧值
 * @param nextValue 新值
 */
export default function patchProp(el, key: string, preValue, nextValue) {
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
