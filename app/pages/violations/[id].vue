<script setup lang="ts">
const route = useRoute()
const headers = useRequestHeaders(["cookie"])
const event = ref<any>(null)
const unavailable = ref(false)
const saving = ref(false)
const toast = useToast()
async function load() {
  unavailable.value = false
  try {
    event.value = await $fetch<any>(`/_api/events/${route.params.id}`, { headers })
  }
  catch {
    unavailable.value = true
  }
}
const stats = computed(() => event.value ? [
  { label: "Track ID", value: `#${event.value.track_id}` },
  { label: "Источник", value: event.value.source_type },
  { label: "Цвет каски", value: event.value.helmet_color || "Не определен" },
  {
    label: "Категория",
    value: event.value.helmet_role || "Роль не определена",
  },
  {
    label: "Начало",
    value: new Date(event.value.started_at).toLocaleString("ru-RU"),
  },
  { label: "Причина открытия", value: event.value.event_type || "Ожидается" },
  {
    label: "Причина закрытия",
    value: closeReason(event.value.close_reason),
  },
  {
    label: "Длительность",
    value: `${Math.round(event.value.duration_seconds || 0)} с`,
  },
 ] : [])
function closeReason(reason: string | null) {
  if (reason === "source_stopped" || reason === "track_lost")
    return "Наблюдение завершено, нарушение не устранено"
  if (reason === "helmet_detected")
    return "Обнаружена каска"
  if (reason === "manual")
    return "Закрыто вручную"
  return reason || "Не закрыто"
}
async function toggleStatus() {
  if (!event.value || saving.value)
    return
  saving.value = true
  try {
    const next = event.value.status === "open" ? "closed" : "open"
    event.value = await $fetch(`/_api/events/${event.value.id}`, {
      method: "PATCH",
      headers,
      body: { status: next },
    })
    toast.add({
      title: next === "closed" ? "Нарушение закрыто" : "Нарушение открыто",
      color: next === "closed" ? "success" : "warning",
    })
  }
  catch {
    toast.add({ title: "Не удалось изменить статус", color: "error" })
  }
  finally {
    saving.value = false
  }
}
function apiUrl(path: string) {
  return `http://localhost:8000${path}`
}
await load()
let refreshTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refreshTimer = setInterval(load, 4000)
})
onBeforeUnmount(() => {
  if (refreshTimer)
    clearInterval(refreshTimer)
})
watch(() => route.params.id, load)
</script>

<template>
  <div v-if="unavailable" class="space-y-4">
    <DataUnavailable @retry="load" />
    <UButton to="/violations" variant="outline">К списку нарушений</UButton>
  </div>
  <div v-else-if="event">
    <div class="mb-7 flex gap-4 items-center">
      <NuxtLink to="/violations" class="text-muted">
        <UIcon name="i-lucide-arrow-left" />
      </NuxtLink>
      <div>
        <p class="text-primary text-xs font-bold">
          {{ event.zone_name || "Без зоны" }}
        </p>
        <h1 class="text-3xl font-bold m-0">
          Нарушение #{{ event.id }}
        </h1>
      </div>
      <UBadge
        class="ml-auto"
        :color="event.status === 'open' ? 'error' : 'success'"
      >
        {{ event.status === "open" ? "Открыто" : "Закрыто" }}
      </UBadge>
      <UButton
        :color="event.status === 'open' ? 'success' : 'warning'"
        :loading="saving"
        variant="soft"
        @click="toggleStatus"
      >
        {{ event.status === "open" ? "Закрыть нарушение" : "Открыть нарушение" }}
      </UButton>
    </div>
    <div class="mb-5 gap-3 grid sm:grid-cols-4">
      <UCard v-for="item in stats" :key="item.label">
        <span class="text-muted text-xs block">{{ item.label }}</span><b class="mt-1 block">
          {{ item.value }}
        </b>
      </UCard>
    </div>
    <div class="gap-4 grid md:grid-cols-2">
      <UCard
        v-for="image in [
          { label: 'Начало нарушения', path: event.start_image_path },
          { label: 'Закрытие нарушения', path: event.end_image_path },
        ]"
        :key="image.label"
      >
        <template #header>
          <span class="text-sm font-semibold">{{
            image.label
          }}</span>
        </template><img
          v-if="image.path"
          :src="apiUrl(image.path)"
          class="rounded bg-black w-full"
        >
        <div
          v-else
          class="bg-muted text-muted text-sm grid min-h-64 place-items-center"
        >
          Фото отсутствует
        </div>
      </UCard>
    </div>
  </div>
  <DataUnavailable v-else @retry="load" />
</template>
