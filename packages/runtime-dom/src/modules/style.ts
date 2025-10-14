export function patchStyle(el, preValue, nextValue) {
  let style = el.style
  // 新样式全部生效
  for (let key in nextValue) {
    style[key] = nextValue[key]
  }
  if (preValue) {
    // 看之前的属性现在有没有，没有就删除
    for (let key in preValue) {
      if (nextValue[key] == null) {
        style[key] = null
      }
    }
  }
}
