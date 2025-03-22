import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import {PrimeVueResolver} from '@primevue/auto-import-resolver';
import Components from 'unplugin-vue-components/vite';

// https://vite.dev/config/
export default defineConfig({
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
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false
      },
      '/SGIMatchScore': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false
      }
    }
  }
})





