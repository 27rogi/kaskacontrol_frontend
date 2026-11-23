// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-10-04",

  devtools: { enabled: true },

  eslint: {
    config: {
      nuxt: {
        sortConfigKeys: false,
      },
      standalone: false,
    },
  },

  experimental: {
    typescriptPlugin: true,
    watcher: "builder",
  },

  modules: [
    "nuxt-elysia",
    "@nuxt/eslint",
    "@nuxt/ui",
    // '@unocss/nuxt',
    "@vueuse/nuxt",
  ],

  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    preset: "bun",
  },

  runtimeConfig: {
    public: {
      elysiaWsPort: Number(process.env.ELYSIA_WS_PORT || 3001),
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "date-fns",
        "date-fns/locale",
        "@elysia/eden",
        "@elysiajs/eden",
      ],
    },
  },
})
