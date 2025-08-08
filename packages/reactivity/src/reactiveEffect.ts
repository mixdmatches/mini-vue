import { activeEffect } from '@mini-vue/reactivity'

export function track(target, key) {
  if (activeEffect) {
    console.log(activeEffect, key)
  }
}
