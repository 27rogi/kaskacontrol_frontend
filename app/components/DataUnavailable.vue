<script setup lang="ts">
withDefaults(defineProps<{ loading?: boolean, description?: string }>(), {
  description: "Данные недоступны в текущий момент. Проверьте соединение с сервером и попробуйте снова.",
  loading: false,
})

defineEmits<{ retry: [] }>()
</script>

<template>
  <UAlert
    color="warning"
    variant="soft"
    :title="loading ? 'Загрузка данных' : 'Данные недоступны в текущий момент'"
    :description="description"
  >
    <template #actions>
      <UButton size="sm" variant="outline" :loading="loading" @click="$emit('retry')">
        Повторить
      </UButton>
    </template>
  </UAlert>
</template>
