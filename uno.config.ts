import presetWind from "@unocss/preset-wind4"
import { defineConfig } from "@unocss/vite"

export default defineConfig({
  presets: [
    presetWind({
      reset: false,
    }),
  ],
})
