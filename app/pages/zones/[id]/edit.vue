<script setup lang="ts">
const route = useRoute()
const headers = useRequestHeaders(["cookie"])
const zone = ref<any>(null)
const unavailable = ref(false)
const error = ref("")
async function load() {
  unavailable.value = false
  try {
    zone.value = await $fetch<any>(`/_api/zones/${route.params.id}`, { headers })
  }
  catch {
    unavailable.value = true
  }
}
async function save(data: any) {
  error.value = ""
  try {
    await $fetch(`/_api/zones/${route.params.id}`, {
      body: data,
      method: "PATCH",
    })
    await navigateTo("/zones")
  }
  catch {
    error.value = "Не удалось сохранить зону. Данные недоступны в текущий момент."
  }
}
await load()
</script>

<template>
  <div v-if="unavailable" class="space-y-4">
    <DataUnavailable @retry="load" />
    <UButton to="/zones" variant="outline">К списку зон</UButton>
  </div>
  <div v-else-if="zone" class="space-y-4">
    <UAlert v-if="error" color="error" variant="soft" :description="error" />
    <ZoneForm
    v-if="zone"
    title="Изменение зоны"
    submit-label="Сохранить"
    :initial="zone"
    @submit="save"
    />
  </div>
  <DataUnavailable v-else @retry="load" />
</template>
