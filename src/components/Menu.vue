<template>
  <div v-click-outside="handleClickOutside">
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
  </div>
</template>

<script lang="ts" setup>
import { ClickOutside as vClickOutside } from 'element-plus'
import hotkeys from 'hotkeys-js'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{ triggerRef: any }>(), {
  triggerRef: null
})

const modelValue = defineModel<boolean>('visible', { default: false })

const emit = defineEmits<{
  (e: 'on-delete'): void
  (e: 'on-spin'): void
}>()

const { t } = useI18n()
const activeIndex = ref(-1)
const menuRef = ref()

const close = () => {
  modelValue.value = false
}
const handleClickOutside = () => {
  if (modelValue.value) {
    close()
  }
}
watch(
  modelValue,
  (val) => {
    if (val) {
      hotkeys.setScope('menu')
    } else {
      activeIndex.value = -1
      hotkeys.setScope('home')
      hotkeys.trigger('/', 'home')
    }
  },
  { immediate: true }
)
hotkeys('tab', 'menu', () => {
  modelValue.value = !modelValue.value
  return false
})
hotkeys('up', 'menu', () => {
  const len = options.value.length
  activeIndex.value = (activeIndex.value - 1 + len) % len
  return false
})
hotkeys('down', 'menu', () => {
  activeIndex.value = (activeIndex.value + 1) % options.value.length
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
  }
  // {
  //   label: t('NC.spin'),
  //   click() {
  //     close()
  //     emit('on-spin')
  //   }
  // }
])

document.addEventListener('contextmenu', (e) => {
  e.stopPropagation()
  e.preventDefault()
})
</script>
