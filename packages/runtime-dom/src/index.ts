export * from '@mini-vue/reactivity'

import { nodeOps } from './nodeOps'
import patchProp from './patchProp'
import { createRenderer } from '@mini-vue/runtime-core'
const renderOptions = Object.assign({ patchProp }, nodeOps)

export const render = (vNode, container) => {
  return createRenderer(renderOptions).render(vNode, container)
}

export { renderOptions }

export * from '@mini-vue/runtime-core'
