<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{ msg: string }>()

const { t } = useI18n()

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <!-- <img src="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" /> -->
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      {{ t('hi') }}
    </p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
