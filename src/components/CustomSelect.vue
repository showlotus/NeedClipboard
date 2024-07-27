<template>
  <el-select
    v-model="model"
    v-bind="attrs"
    class="custom-select"
    popper-class="custom-select-popper"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script lang="ts" setup>
import { getCurrentInstance, useAttrs } from 'vue'

interface Option {
  label: string
  value: string
}
interface Props {
  options: Option[]
}

withDefaults(defineProps<Props>(), {
  options: () => []
})
const model = defineModel({ default: '' })
const attrs = useAttrs()

const instance = getCurrentInstance()
console.log(instance)
</script>

<style lang="scss">
.el-select__wrapper.is-focused {
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
}

.custom-select-popper {
  .el-popper__arrow {
    display: none;
  }

  .el-select-dropdown__list {
    /* padding: 8px 0; */
  }

  .el-select-dropdown__item {
    margin: 2px 8px;
    padding: 0 8px;
    border-radius: 8px;
  }
}
</style>
