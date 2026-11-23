<script setup lang="ts">
const { $api } = useNuxtApp()
const { data: health, refresh } = await useAsyncData("python-health", async () => {
  const response = await $api.health.get()
  return response.data
}, { default: () => ({ ok: false, python: false }), server: false })
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(refresh, 10000)
})
onBeforeUnmount(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <div class="text-xs flex gap-3 items-center">
    <span class="rounded-full h-2 w-2" :class="health?.python ? 'bg-primary-500' : 'bg-red-500'" />
    <span :class="health?.python ? 'text-primary-500' : 'text-red-500'">{{ health?.python ? 'Системы в норме' : 'Сервер видеоаналитики недоступен' }}</span>
  </div>
</template>
