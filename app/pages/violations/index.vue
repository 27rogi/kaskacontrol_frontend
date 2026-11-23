<script setup lang="ts">
const headers = useRequestHeaders(["cookie"])
const events = ref<any[]>([])
const unavailable = ref(false)
async function load() {
  unavailable.value = false
  try {
    const loaded = await $fetch<any>("/_api/events", {
      headers,
      query: { limit: 500 },
    })
    events.value = Array.isArray(loaded) ? loaded : []
  }
  catch {
    unavailable.value = true
    events.value = []
  }
}
const columns = [
  { accessorKey: "id", header: "Номер" },
  { accessorKey: "started_at", header: "Дата" },
  { accessorKey: "zone_name", header: "Зона" },
  { accessorKey: "track_id", header: "Track ID" },
  { accessorKey: "status", header: "Статус" },
  { accessorKey: "duration_seconds", header: "Длительность" },
]
function format(value: string) {
  return new Date(value).toLocaleString("ru-RU")
}
await load()
</script>

<template>
  <div>
    <div class="mb-7">
      <h1 class="text-3xl font-bold m-0">
        Нарушения
      </h1>
    </div>
    <DataUnavailable v-if="unavailable" @retry="load" />
    <UCard v-else>
      <UTable :data="events" :columns="columns" class="w-full">
        <template #id-cell="{ row }">
          #{{ row.original.id }}
        </template>
        <template #started_at-cell="{ row }">
          <UButton :to="`/violations/${row.original.id}`" variant="link">
            {{ format(row.original.started_at) }}
          </UButton>
        </template>
        <template #zone_name-cell="{ row }">
          {{ row.original.zone_name || "Без зоны" }}
        </template>
        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'open' ? 'error' : 'success'"
            :title="['source_stopped', 'track_lost'].includes(row.original.close_reason) ? 'Наблюдение завершено, нарушение не устранено' : undefined"
          >
            {{ row.original.status === "open" ? "Открыто" : "Закрыто" }}
          </UBadge>
          <span
            v-if="row.original.status === 'open' && ['source_stopped', 'track_lost'].includes(row.original.close_reason)"
            class="text-muted text-xs ml-1"
          >· наблюдение завершено</span>
        </template>
        <template #duration_seconds-cell="{ row }">
          {{ Math.round(row.original.duration_seconds || 0) }} с
        </template>
        <template #empty>
          <div class="text-muted py-12 text-center">
            Нарушений нет
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
