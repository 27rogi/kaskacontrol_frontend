<script setup lang="ts">
const props = withDefaults(
  defineProps<{ title: string, submitLabel: string, initial?: any }>(),
  {
    initial: () => ({
      description: "",
      enabled: true,
      name: "",
      source_type: "rtsp",
      source_uri: "",
    }),
  },
)
const emit = defineEmits<{ submit: [data: any] }>()
const sourceTypes = [
  { label: "RTSP", value: "rtsp" },
  { label: "Веб-камера", value: "webcam" },
  { label: "Видео", value: "video" },
]
const form = reactive({
  description: "",
  enabled: true,
  name: "",
  source_type: "rtsp",
  source_uri: "",
})
Object.assign(form, props.initial)
</script>

<template>
  <UForm :state="form" class="max-w-2xl">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">
          {{ title }}
        </h1>
      </template>
      <UFormField label="Название" required class="mb-4">
        <UInput v-model="form.name" required class="w-full" />
      </UFormField>
      <UFormField label="Тип источника" class="mb-4">
        <USelect
          v-model="form.source_type"
          :items="sourceTypes"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Адрес источника" class="mb-4">
        <UInput
          v-model="form.source_uri"
          :disabled="form.source_type === 'webcam'"
          placeholder="rtsp://localhost:554/live"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Описание" class="mb-6">
        <UTextarea v-model="form.description" class="w-full" />
      </UFormField>
      <UCheckbox v-model="form.enabled" label="Зона активна" class="mb-6" />
      <div class="flex gap-3">
        <UButton type="button" color="primary" @click="emit('submit', form)">
          {{ submitLabel }}
        </UButton>
        <UButton to="/zones" color="neutral" variant="outline">
          Отмена
        </UButton>
      </div>
    </UCard>
  </UForm>
</template>
