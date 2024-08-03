import { ref } from 'vue'
import { defineStore } from 'pinia'

export const userRecordStore = defineStore('record', () => {
  const record = ref({})
  const updateRecord = (val) => {
    record.value = val
  }

  return {
    record,
    updateRecord
  }
})
