<script setup lang="ts">
const headers = useRequestHeaders(["cookie"])
const zones = ref<any[]>([])
const error = ref("")
const columns = [
  { accessorKey: "name", header: "Название" },
  { accessorKey: "source_type", header: "Источник" },
  { accessorKey: "source_uri", header: "Адрес" },
  { accessorKey: "enabled", header: "Статус" },
  { header: "", id: "actions" },
]
async function load() {
  try {
    const loaded = await $fetch<any>("/_api/zones", { headers })
    zones.value = Array.isArray(loaded) ? loaded : []
  }
  catch {
    error.value = "Данные недоступны в текущий момент. Проверьте соединение с сервером и попробуйте снова."
  }
}
async function remove(id: number) {
  // eslint-disable-next-line no-alert
  if (!confirm("Удалить эту зону?"))
    return
  try {
    await $fetch(`/_api/zones/${id}`, { method: "DELETE" })
    await load()
  }
  catch {
    error.value = "Не удалось удалить зону"
  }
}
await load()
</script>

<template>
  <div>
    <div class="mb-7 flex items-end justify-between">
      <div>
        <h1 class="text-3xl font-bold m-0">
          Зоны наблюдения
        </h1>
      </div>
      <UButton to="/zones/new">
        <UIcon name="i-lucide-plus" />Добавить зону
      </UButton>
    </div>
    <UCard>
      <UTable :data="zones" :columns="columns" class="w-full">
        <template #source_type-cell="{ row }">
          <UBadge color="neutral">
            {{ row.original.source_type }}
          </UBadge>
        </template>
        <template #source_uri-cell="{ row }">
          <span class="max-w-xs block truncate">{{
            row.original.source_uri || "Локальная веб-камера"
          }}</span>
        </template>
        <template #enabled-cell="{ row }">
          <UBadge :color="row.original.enabled ? 'success' : 'neutral'">
            {{ row.original.enabled ? "Активна" : "Отключена" }}
          </UBadge>
        </template>
        <template #actions-cell="{ row }">
          <div class="flex gap-1 justify-end">
            <UButton :to="`/zones/${row.original.id}/edit`" variant="link">
              Изменить
            </UButton>
            <UButton
              color="error"
              variant="link"
              @click="remove(row.original.id)"
            >
              Удалить
            </UButton>
          </div>
        </template>
        <template #empty>
          <div class="text-muted py-12 text-center">
            {{ error ? "Данные недоступны в текущий момент" : "Зоны ещё не созданы" }}
          </div>
        </template>
      </UTable>
    </UCard>
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      class="mt-4"
      :description="error"
    />
    <UButton v-if="error" class="mt-3" variant="outline" @click="load">
      Повторить загрузку
    </UButton>
  </div>
</template>
