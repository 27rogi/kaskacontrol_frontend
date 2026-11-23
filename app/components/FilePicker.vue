<script setup lang="ts">
const props = defineProps<{
  accept: string
  formats: string
  file: File | null
  preview?: string
}>()
const emit = defineEmits<{ select: [file: File | undefined] }>()
</script>

<template>
  <div>
    <UFileUpload
      :model-value="props.file"
      :accept="props.accept"
      :description="props.formats"
      label="Выберите файл"
      class="w-full"
      @update:model-value="emit('select', $event || undefined)"
    />
    <img
      v-if="props.preview"
      :src="props.preview"
      alt="Предпросмотр"
      class="bg-muted mt-4 rounded max-h-44 w-full object-contain"
    >
  </div>
</template>
