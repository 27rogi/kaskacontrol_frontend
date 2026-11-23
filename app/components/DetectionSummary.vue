<script setup lang="ts">
import type { Static } from "elysia"
import type { AnalysisSchema } from "~~/api/schemas/common"

type Analysis = Static<typeof AnalysisSchema>
defineProps<{ analysis: Analysis | null, placeholder?: string }>()
const colors: Record<string, string> = {
  orange: "Оранжевые",
  red: "Красные",
  unknown: "Не определены",
  white: "Белые",
  yellow: "Жёлтые",
}
</script>

<template>
  <div>
    <div
      class="bg-muted rounded-md flex min-h-64 items-center justify-center overflow-hidden"
    >
      <img
        v-if="analysis?.annotated_image"
        :src="analysis.annotated_image"
        alt="Аннотированный результат"
        class="max-h-[34rem] w-full block object-contain"
      >
      <div
        v-else
        class="text-zinc-400 p-6 text-center flex flex-col gap-2 items-center"
      >
        <UIcon name="i-lucide-scan-search" class="text-3xl" />
        <span class="text-sm">{{
          placeholder || "Результат появится здесь"
        }}</span>
      </div>
    </div>
    <div
      v-if="analysis"
      class="border-default bg-muted mt-4 border gap-px grid grid-cols-2 sm:grid-cols-4"
    >
      <div class="bg-default p-3">
        <b class="text-2xl block">
          {{ analysis.counts.people }} </b><span class="text-muted text-xs">Людей</span>
      </div>
      <div class="bg-default p-3">
        <b class="text-2xl block">
          {{ analysis.counts.helmets }} </b><span class="text-muted text-xs">Касок</span>
      </div>
      <div class="bg-default p-3">
        <b class="text-success text-2xl block">
          {{ analysis.counts.people_with_helmet }} </b><span class="text-muted text-xs">С касками</span>
      </div>
      <div class="bg-default p-3">
        <b class="text-error text-2xl block">
          {{ analysis.counts.people_without_helmet }} </b><span class="text-muted text-xs">Без каски</span>
      </div>
    </div>
    <div
      v-if="analysis"
      class="text-xs text-zinc-600 mt-3 flex flex-wrap gap-3"
    >
      <span
        v-for="(count, color) in analysis.counts.helmet_colors"
        v-show="count"
        :key="color"
      >{{ colors[color] }}: <b class="text-zinc-900">{{ count }}</b></span>
      <span
        v-for="(role, color) in analysis.counts.helmet_roles"
        v-show="analysis.counts.helmet_colors[color]"
        :key="`role-${color}`"
      >{{ colors[color] || color }}: {{ role }}</span>
      <span class="ml-auto">{{ analysis.processing_time_ms }} мс</span>
    </div>
  </div>
</template>
