<template>
  <el-tooltip
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
          class="py-1 px-4 flex items-center whitespace-nowrap cursor-pointer text-sm rounded hover:bg-[--el-fill-color-light]"
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
import { Ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

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
hotkeys('tab', 'menu', (e) => {
  emit('update:visible', !props.visible)
  // e.preventDefault()
  return false
})

const close = () => {
  emit('update:visible', false)
}
watch(
  () => props.visible,
  (val) => {
    if (val) {
      hotkeys.setScope('menu')
    } else {
      hotkeys.setScope('home')
      hotkeys.trigger('/', 'home')
    }
    console.log(hotkeys.getScope())
  },
  { immediate: true }
)

const { t } = useI18n()
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
  //     emit('on-spin')
  //   }
  // }
])

document.addEventListener('contextmenu', (e) => {
  e.stopPropagation()
  e.preventDefault()
})
</script>
