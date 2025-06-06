import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('add-')
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    commonjsOptions: {
      esmExternals: true
    }
  },
  server: {
    allowedHosts: [
      "dev.app.cwm.com"
    ],
    host: true,
    port: 8080,
    strictPort: true,
    hmr: { overlay: false }
  },
})
