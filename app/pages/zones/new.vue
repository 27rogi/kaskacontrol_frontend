<script setup lang="ts">
const error = ref("")
async function create(data: any) {
  error.value = ""
  try {
    await $fetch("/_api/zones", { body: data, method: "POST" })
    await navigateTo("/zones")
  }
  catch {
    error.value = "Не удалось создать зону. Данные недоступны в текущий момент."
  }
}
</script>

<template>
  <div class="space-y-4">
    <UAlert v-if="error" color="error" variant="soft" :description="error" />
    <ZoneForm title="Новая зона" submit-label="Создать зону" @submit="create" />
  </div>
</template>
