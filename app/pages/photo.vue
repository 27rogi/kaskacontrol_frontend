<script setup lang="ts">
import type { Static } from "elysia"
import type { AnalysisSchema } from "~~/api/schemas/common"

type Analysis = Static<typeof AnalysisSchema>
const { $api } = useNuxtApp()
const state = reactive<{
  file: File | null
  preview: string
  analysis: Analysis | null
  busy: boolean
  error: string
}>({ analysis: null, busy: false, error: "", file: null, preview: "" })
function selectFile(value?: File) {
  if (!value)
    return
  if (state.preview)
    URL.revokeObjectURL(state.preview)
  state.file = value
  state.preview = URL.createObjectURL(value)
  state.analysis = null
}
async function analyze() {
  if (!state.file)
    return
  state.busy = true
  state.error = ""
  try {
    const response = await $api.image.post({ file: state.file })
    if (response.error)
      throw new Error("Не удалось обработать фото")
    state.analysis = response.data as Analysis
  }
  catch (e: any) {
    state.error = e?.message || "Не удалось обработать фото"
  }
  finally {
    state.busy = false
  }
}
onBeforeUnmount(() => {
  if (state.preview)
    URL.revokeObjectURL(state.preview)
})
</script>

<template>
  <div>
    <section class="mb-8">
      <h1 class="text-4xl font-bold m-0">
        Проверка фото
      </h1>
    </section>
    <div class="gap-4 grid lg:grid-cols-[.8fr_1.2fr]">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold m-0">
              Изображение
            </h2>
            <UBadge color="neutral">
              JPG PNG WEBP
            </UBadge>
          </div>
        </template>
        <FilePicker
          accept="image/*"
          formats="или перетащите изображение"
          :file="state.file"
          :preview="state.preview"
          @select="selectFile"
        />
        <UButton
          class="mt-4 w-full"
          :loading="state.busy"
          :disabled="!state.file"
          @click="analyze"
        >
          <UIcon name="i-lucide-scan-line" />{{
            state.busy ? "Обработка..." : "Проверить фото"
          }}
        </UButton>
        <UAlert
          v-if="state.error"
          color="error"
          variant="soft"
          class="mt-3"
          :description="state.error"
        />
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold m-0">
              Результат детекции
            </h2>
            <UBadge v-if="state.analysis" color="neutral">
              {{ state.analysis.model }}
            </UBadge>
          </div>
        </template>
        <DetectionSummary :analysis="state.analysis" />
      </UCard>
    </div>
  </div>
</template>
