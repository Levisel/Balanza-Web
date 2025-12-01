import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  base: './',   // ←🔥 ESTO ES LO QUE TE FALTABA
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/SGIFPCapture': {
        target: 'https://127.0.0.1:8443',
        changeOrigin: true,
        secure: false
      },
      '/SGIMatchScore': {
        target: 'https://127.0.0.1:8443',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
