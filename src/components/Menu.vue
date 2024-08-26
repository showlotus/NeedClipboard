<template>
  <el-tooltip
    ref="menuRef"
    placement="right"
    trigger="contextmenu"
    :show-arrow="false"
    :visible="visible"
    :popper-options="{
      modifiers: [
        {
          name: 'computeStyles',
          options: {
            adaptive: false,
            enabled: false
          }
        }
      ]
    }"
    popper-class="p-0"
    :virtual-ref="triggerRef"
    virtual-triggering
    v-bind="$attrs"
  >
    <template #content>
      <ul class="p-1 select-none">
        <li
          v-for="(o, i) in options"
          :key="i"
          class="py-1 px-4 flex items-center whitespace-nowrap cursor-pointer text-sm rounded"
          :class="{
            'bg-[--el-fill-color-light]': i === activeIndex
          }"
          @mouseenter="activeIndex = i"
          @click="o.click"
        >
          {{ o.label }}
        </li>
      </ul>
    </template>
    <slot />
  </el-tooltip>
</template>

<script lang="ts" setup>
import hotkeys from 'hotkeys-js'
import { watch, computed, ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClickOutside as vClickOutside } from 'element-plus'

const props = withDefaults(
  defineProps<{ triggerRef: any; visible: boolean }>(),
  {
    triggerRef: null,
    visible: false
  }
)

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'on-delete'): void
  (e: 'on-spin'): void
}>()

const { t } = useI18n()
const activeIndex = ref(-1)
const menuRef = ref()

const close = () => {
  emit('update:visible', false)
}
watch(
  () => props.visible,
  (val) => {
    if (val) {
      hotkeys.setScope('menu')
    } else {
      activeIndex.value = -1
      hotkeys.setScope('home')
      hotkeys.trigger('/', 'home')
    }
    console.log(hotkeys.getScope())
  },
  { immediate: true }
)
hotkeys('tab', 'menu', () => {
  emit('update:visible', !props.visible)
  return false
})
hotkeys('up', 'menu', () => {
  const len = options.value.length
  activeIndex.value = (activeIndex.value - 1 + len) % len
  console.log(activeIndex.value)
  return false
})
hotkeys('down', 'menu', () => {
  activeIndex.value = (activeIndex.value + 1) % options.value.length
  console.log(activeIndex.value)
  return false
})
hotkeys('enter', 'menu', () => {
  if (activeIndex.value >= 0) {
    options.value[activeIndex.value].click()
  }
  return false
})
hotkeys('esc', 'menu', () => {
  close()
})
const options = computed(() => [
  {
    label: t('NC.delete'),
    click() {
      close()
      emit('on-delete')
    }
  },
  {
    label: t('NC.spin'),
    click() {
      close()
      emit('on-spin')
    }
  }
])

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  console.log('document click')
  if (!target.contains(menuRef.value.popperRef.contentRef)) {
    close()
  }
})

document.addEventListener('contextmenu', (e) => {
  e.stopPropagation()
  e.preventDefault()
})
</script>
